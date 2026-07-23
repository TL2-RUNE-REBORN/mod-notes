// ═══════════════════════════════════════════════════════════════════════════
// pack_threads_common.js — 多线程打包的共享工具(余烬工坊 · Emberworks)
//
// pack_worker.js(主 wasm 线程)与 pack_thread_worker.js(wasi-threads 子线程)
// 共用的纯工具:SAB 兼容补丁、大小写不敏感目录树、wasm memory limits 解析、
// 文件字节的 SAB 化(一份字节所有 worker 零拷贝共享)。
//
// 多线程模型(de-risk 实测过的 Emscripten PTHREAD_POOL 套路):
//   · pack_threads.wasm 是 wasm32-wasip1-threads 构建,import 一个 shared
//     WebAssembly.Memory,rayon 线程经 `wasi::thread-spawn` 派生;
//   · 主 worker 在 _start 里同步阻塞后,它 new 的 Worker 永远不会开始执行
//     (worker 启动需要父的事件循环)——所以线程 worker 池必须在 _start 前
//     预建好(脚本已运行、instance 已就绪),thread-spawn 只向池成员
//     postMessage(消息投递不需要被阻塞父的事件循环);
//   · rayon 任务(DAT/LAYOUT 编译、MPP、RAW、压缩)在子线程里 std::fs 读文件,
//     走的是子线程自己 instance 的 WASI import——所以每个池成员都持有一份
//     /mod + /base 目录树;文件字节放 SharedArrayBuffer,树节点只是 view,
//     整个池共享同一份字节。/out 只有主实例写。
// ═══════════════════════════════════════════════════════════════════════════
import { File as WFile, Directory } from "./vendor/browser_wasi_shim/index.js";

// ── SAB 兼容补丁 ────────────────────────────────────────────────────────────
// threads 模式下 wasm 线性内存是 SharedArrayBuffer;TextDecoder.decode 按
// 规范拒绝 shared view(shim 内部 16 处 decode 都会读 wasm 内存)。全局
// monkeypatch:检测到 shared 输入先拷贝再解码。单线程模式零影响(无 SAB
// 输入)。幂等,可重复调用。
export function patchTextDecoderForSAB() {
  if (TextDecoder.prototype.decode.__sabPatched) return;
  const orig = TextDecoder.prototype.decode;
  const patched = function (input, options) {
    if (typeof SharedArrayBuffer !== "undefined" && input) {
      if (ArrayBuffer.isView(input) && input.buffer instanceof SharedArrayBuffer) {
        input = new Uint8Array(input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength));
      } else if (input instanceof SharedArrayBuffer) {
        input = input.slice(0);
      }
    }
    return orig.call(this, input, options);
  };
  patched.__sabPatched = true;
  TextDecoder.prototype.decode = patched;
}

// ── stale-SAB 视图竞态修复(引擎级 grow 可见性)────────────────────────────
// 实证(佣兵 mod 二分):兄弟 worker 对 shared WebAssembly.Memory 执行
// memory.grow 后,本 worker 的 `memory.buffer` getter 可能仍返回【旧长度】的
// SharedArrayBuffer(V8 的 per-isolate buffer 缓存尚未刷新)。shim 恰在此刻
// 把文件字节写进"新长出的区间"(fd_read 目标 Vec 刚触发 grow 分配)→ 旧
// SAB 越界 → 线程炸("memory access out of bounds")。
//
// 修复钩子:`memory.grow(0)` —— 合法的 no-op grow,强制本 isolate 走 grow
// 路径同步 underlying size 并重建 buffer 缓存,之后的 getter 保证新鲜。
// shim(browser_wasi_shim)所有内存访问都经 `this.inst.exports.memory.buffer`
// 现取视图,所以拦截点只有一个:给 shim 一个"包装 instance",其
// exports.memory 换成每次 buffer 都先 grow(0) 的代理。真 exports 的其余成员
// (_start / wasi_thread_start / …)原样透传。
//
// 只用于 SHARED memory(threads 构建)。非共享 memory 千万别包:普通 memory
// 的 grow(0) 也会 detach 旧 buffer,反而把单线程 shim 的活视图搞死。
export function wrapInstanceFreshMemory(instance, memory) {
  const memProxy = {
    // shim 只读 buffer;grow 透传以防未来用到
    grow: (d) => memory.grow(d),
    get buffer() {
      memory.grow(0); // force per-isolate buffer-cache refresh
      return memory.buffer;
    },
  };
  const exports = {};
  for (const k of Object.keys(instance.exports)) {
    exports[k] = k === "memory" ? memProxy : instance.exports[k];
  }
  if (!("memory" in exports)) exports.memory = memProxy;
  return { exports };
}

// ── 大小写不敏感目录树(仿 Windows FS 语义;TL2 的 BASEFILE 引用是小写)──
export class CIMap extends Map {
  get(k) { return super.get(String(k).toUpperCase()); }
  has(k) { return super.has(String(k).toUpperCase()); }
  set(k, v) { return super.set(String(k).toUpperCase(), v); }
  delete(k) { return super.delete(String(k).toUpperCase()); }
}
export const ciDir = () => { const c = new CIMap(); const d = new Directory(c); d.contents = c; return d; };

// 零拷贝 File:shim 的 File 构造对 TypedArray 会整段复制;先空构造再覆写
// data,让节点直接持有 SAB/AB 上的 view。
export function viewFile(view) {
  const f = new WFile(new ArrayBuffer(0));
  f.data = view;
  return f;
}

// ── wasm 二进制的 import memory limits(threads 构建声明 min/max/shared)──
export function parseMemLimits(bytes) {
  const b = new Uint8Array(bytes);
  let p = 8;
  const leb = () => { let r = 0, s = 0; for (;;) { const x = b[p++]; r |= (x & 0x7f) << s; if (!(x & 0x80)) return r >>> 0; s += 7; } };
  while (p < b.length) {
    const sid = b[p++]; const sz = leb(); const end = p + sz;
    if (sid === 2) {
      const cnt = leb();
      for (let i = 0; i < cnt; i++) {
        const ml = leb(); p += ml; const nl = leb(); p += nl;
        const kind = b[p++];
        if (kind === 0) leb();
        else if (kind === 1) { p++; const f = b[p++]; leb(); if (f & 1) leb(); }
        else if (kind === 2) { const f = b[p++]; const mn = leb(); const mx = (f & 1) ? leb() : undefined; return { mn, mx, shared: !!(f & 2) }; }
        else if (kind === 3) p += 2;
      }
    }
    p = end;
  }
  return null; // 没有 import memory = 单线程构建
}

// ── 文件字节 SAB 化 ─────────────────────────────────────────────────────────
// entries: Map rel → {bytes, ...}。把所有 bytes 拼进一个大 buffer(隔离环境
// 用 SharedArrayBuffer,可跨 worker 零拷贝共享),并把 e.bytes 原地替换成
// 对应 view(主 worker 的树也直接用它,不再各持一份拷贝)。
// 返回 {buf, meta};meta = [path, off, len][],发给池成员重建目录树。
export function sabifyEntries(entries, useShared) {
  let total = 0;
  for (const [, e] of entries) total += e.bytes.length;
  const buf = useShared ? new SharedArrayBuffer(total) : new ArrayBuffer(total);
  const all = new Uint8Array(buf);
  const meta = [];
  let off = 0;
  for (const [path, e] of entries) {
    all.set(e.bytes, off);
    const len = e.bytes.length;
    e.bytes = new Uint8Array(buf, off, len);
    meta.push([path, off, len]);
    off += len;
  }
  return { buf, meta };
}

// 池成员侧:由 meta + 共享字节重建只读目录树(不带 mtime——子线程只读内容,
// manifest 的 FILETIME 全部在主实例侧读取)。
export function treeFromMeta(meta, buf) {
  const root = ciDir();
  for (const [path, off, len] of meta) {
    const parts = path.split("/");
    let cur = root;
    for (let i = 0; i < parts.length - 1; i++) {
      let d = cur.contents.get(parts[i]);
      if (!d) { d = ciDir(); cur.contents.set(parts[i], d); }
      cur = d;
    }
    cur.contents.set(parts[parts.length - 1], viewFile(new Uint8Array(buf, off, len)));
  }
  return root;
}
