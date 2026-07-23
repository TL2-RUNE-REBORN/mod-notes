// ═══════════════════════════════════════════════════════════════════════════
// pack_thread_worker.js — wasi-threads 线程池成员(余烬工坊 · Emberworks)
//
// 一个成员承载一个 rayon worker 线程:
//   {op:"init", module, memory, modMeta, modBuf, baseMeta, baseBuf}
//       → 用共享字节重建 /mod + /base 只读树,实例化同一个 module 到同一块
//         shared memory 上,回 {type:"ready"}(此时父 worker 还没进 _start,
//         事件循环活着,能收到);
//   {op:"start", tid, startArg}
//       → 调 wasi_thread_start(tid, startArg),即 wasi-libc 的线程入口:
//         设栈/TLS 后进入 rayon worker 主循环,同步长跑直到池被 terminate。
//
// fd 布局必须与主实例完全一致(wasi-libc 的 preopen 表在共享内存里只初始化
// 一次):fd3=/mod fd4=/out fd5=/base。子线程只读 /mod /base;/out 给空树占位
// (打包写盘全部发生在主实例线程)。
//
// 子线程的 stderr(并行压缩/编译的进度探针)经 BroadcastChannel 直达页面——
// 父 worker 阻塞在 _start 里,经它转发的话要等打包结束才能一次性吐出来。
// ═══════════════════════════════════════════════════════════════════════════
import {
  WASI, File as WFile, PreopenDirectory, OpenFile, ConsoleStdout,
} from "./vendor/browser_wasi_shim/index.js";
import { patchTextDecoderForSAB, CIMap, treeFromMeta, wrapInstanceFreshMemory } from "./pack_threads_common.js";

patchTextDecoderForSAB();

const bc = new BroadcastChannel("tl2-pack-log");
const log = (line, cls) => bc.postMessage({ line, cls });

let instance = null;
let wasi = null;

self.onmessage = async (ev) => {
  const m = ev.data;
  if (m.op === "init") {
    try {
      const modTree = treeFromMeta(m.modMeta, m.modBuf);
      const baseTree = treeFromMeta(m.baseMeta, m.baseBuf);
      const modDir = new PreopenDirectory("/mod", modTree.contents);
      if (modDir.dir) modDir.dir.contents = modTree.contents;
      const outCI = new CIMap();
      const outDir = new PreopenDirectory("/out", outCI);
      if (outDir.dir) outDir.dir.contents = outCI;
      const baseDir = new PreopenDirectory("/base", baseTree.contents);
      if (baseDir.dir) baseDir.dir.contents = baseTree.contents;
      const fds = [
        new OpenFile(new WFile([])),                          // stdin
        ConsoleStdout.lineBuffered(t => log("[wasm] " + t)),  // stdout
        ConsoleStdout.lineBuffered(t => log("[wasm] " + t)),  // stderr(进度探针)
        modDir, outDir, baseDir,
      ];
      // 子实例不跑 _start:args/env 不会被再读(libc 全局在共享内存里已初始化)
      wasi = new WASI(["pack"], [], fds, { debug: false });
      instance = await WebAssembly.instantiate(m.module, {
        env: { memory: m.memory },
        wasi_snapshot_preview1: wasi.wasiImport,
        // rayon 只从主线程 build_global 派生线程;嵌套派生返回 EAGAIN
        wasi: { "thread-spawn": () => -11 },
      });
      // fresh-memory 包装:本 worker 的 shim 在别的线程 grow 后立即写新区间
      // (fd_read 的目标 Vec 往往刚触发 grow)—— 必须强制刷新 buffer 视图。
      wasi.initialize(wrapInstanceFreshMemory(instance, m.memory)); // 只挂 inst,不跑入口
      self.postMessage({ type: "ready" });
    } catch (e) {
      log("[pool] init 失败:" + String(e && e.stack || e), "bad");
      self.postMessage({ type: "init-error", err: String(e && e.message || e) });
    }
  } else if (m.op === "start") {
    try {
      instance.exports.wasi_thread_start(m.tid, m.startArg);
      // rayon worker 正常情况下不返回(池常驻);返回说明线程函数退出了
    } catch (e) {
      log(`[pool] 线程 ${m.tid} 异常:` + String(e && e.stack || e), "bad");
    }
  }
};
