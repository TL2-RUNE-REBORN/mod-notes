// ═══════════════════════════════════════════════════════════════════════════
// pack_worker.js — 浏览器内 .MOD 打包 worker(余烬工坊 · Emberworks)
//
// 驱动 pack.wasm(tl2-mikuro-mod-packer 桌面版同一套 Rust 代码编译的
// wasm32-wasip1),经 @bjorn3/browser_wasi_shim@0.3.0(vendored)提供
// 内存文件系统。打包全程在本地浏览器内完成,不上传任何文件。
//
// 多线程(2026-07):页面跨源隔离(COOP/COEP)时改用 pack_threads.wasm
// (wasm32-wasip1-threads 构建,shared memory),DAT/LAYOUT 编译与容器压缩
// 由 rayon 在 wasi-threads 上真并行——线程 worker 池在 _start 前预建
// (父阻塞后新 Worker 永远起不来,Emscripten PTHREAD_POOL 同款约束),
// `wasi::thread-spawn` 只向池成员 postMessage。文件字节 SAB 化,整个池
// 零拷贝共享一份;/out 只有主实例写。输出与单线程/桌面版逐字节一致
// (rayon 保序 collect;native 侧 stream_parity 四路对账通过)。
// 非隔离环境自动回退单线程 pack.wasm,行为与旧版完全相同。
//
// 三个 preopen:
//   /mod  — 用户选择的 mod_root(MOD.DAT + MEDIA/)
//   /base — 附带的 Runic base UNITS 数据(BASEFILE 继承解析用,只读)
//   /out  — 输出(.MOD 与流式打包的 .data.tmp 临时文件都落在这里)
//
// 两个关键兼容层:
//   CIMap        — Windows FS 是大小写不敏感的;TL2 的 BASEFILE 引用是小写
//                  (media/units/items/base.dat)而附带 base 文件是大写路径,
//                  没有它 BASEFILE 继承会断。(现居 pack_threads_common.js)
//   fileWithMtime — shim 0.3.0 的 Filestat.write_bytes 用了错位 offset
//                  (atim@38 / mtim@46 / ctim@52,mtim 与 ctim 还互相重叠),
//                  wasip1 标准布局是 40/48/56。时间戳全 0 时错位读不出差别,
//                  但要把 File.lastModified 传给 Rust 的 metadata.modified()
//                  (→ manifest FILETIME),必须覆写 stat() 按标准 offset 写。
// ═══════════════════════════════════════════════════════════════════════════
import {
  WASI, File as WFile, PreopenDirectory, OpenFile, ConsoleStdout,
  wasi as W,
} from "./vendor/browser_wasi_shim/index.js";
import {
  patchTextDecoderForSAB, CIMap, ciDir, viewFile,
  parseMemLimits, sabifyEntries, wrapInstanceFreshMemory,
} from "./pack_threads_common.js";

patchTextDecoderForSAB(); // threads 模式下 wasm 内存是 SAB;单线程零影响

const post = (type, extra) => self.postMessage(Object.assign({ type }, extra));
const log = (line, cls) => post("log", { line, cls });

const FILETIME_EPOCH_DELTA = 116444736000000000n; // 100ns ticks, 1601→1970

// ── 多线程能力检测 ─────────────────────────────────────────────────────────
// 跨源隔离 + SAB 可用才有戏。两个池分开配(与 wasm 侧 TL2_THREADS /
// TL2_CONVERT_THREADS 一一对应):
//   PACK_THREADS    — 容器段(读+crc+zlib):任务大、分配少,near-linear,给足;
//   CONVERT_THREADS — 编译段(DAT/LAYOUT):分配密集,wasm 分配器是全局单锁,
//                     多线程会倒退 —— 实测正收益的档位再开,先保守。
// 消息 forceSingle 强制单线程(自检 A/B 对照与回退用)。
const CAN_THREAD = typeof SharedArrayBuffer !== "undefined" && !!self.crossOriginIsolated;
const PACK_THREADS = CAN_THREAD ? Math.min(navigator.hardwareConcurrency || 4, 8) : 1;
// convert 档位:全局分配器 = 自旋锁 dlmalloc + canary(甜点 2)。mimalloc
// 每线程 heap 后端已建成(探针 2.7x@8)但真管线 convert 多线程在其上挂死
// (根因未收口,wasm crate mi_alloc.rs 有全记录),feature 门后待攻。
const CONVERT_THREADS = CAN_THREAD ? 2 : 1;
const THREADS = CAN_THREAD ? PACK_THREADS + (CONVERT_THREADS >= 2 ? CONVERT_THREADS : 0) : 1;

// ── File + mtime(标准 offset 的 filestat;data 直接持 view,零拷贝)────────
function fileWithMtime(bytes, mtimeNs) {
  const f = viewFile(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
  if (mtimeNs && mtimeNs > 0n) {
    f.stat = function () {
      return {
        filetype: W.FILETYPE_REGULAR_FILE,
        size: this.size,
        mtim: mtimeNs,
        write_bytes(view, ptr) {
          view.setBigUint64(ptr, 0n, true);            // dev
          view.setBigUint64(ptr + 8, 0n, true);        // ino
          view.setUint8(ptr + 16, this.filetype);      // filetype
          view.setBigUint64(ptr + 24, 0n, true);       // nlink
          view.setBigUint64(ptr + 32, this.size, true);// size
          view.setBigUint64(ptr + 40, 0n, true);       // atim(标准 offset)
          view.setBigUint64(ptr + 48, this.mtim, true);// mtim(标准 offset)
          view.setBigUint64(ptr + 56, 0n, true);       // ctim(标准 offset)
        },
      };
    };
  }
  return f;
}

// entries: Map rel → {bytes, mtimeMs?, mtimeNs?}(rel 用 '/' 分隔)
function buildTree(entries) {
  const root = ciDir();
  for (const [path, e] of entries) {
    const parts = path.split("/");
    let cur = root;
    for (let i = 0; i < parts.length - 1; i++) {
      let d = cur.contents.get(parts[i]);
      if (!d) { d = ciDir(); cur.contents.set(parts[i], d); }
      cur = d;
    }
    const ns = e.mtimeNs !== undefined ? e.mtimeNs
      : (e.mtimeMs ? BigInt(e.mtimeMs) * 1000000n : 0n);
    cur.contents.set(parts[parts.length - 1], fileWithMtime(e.bytes, ns));
  }
  return root;
}

// ── 静态资产(module + base 只加载一次,跨多次打包复用)────────────────────
// 单线程与多线程是两个 wasm 文件,各自缓存;多线程版附带 memory limits。
const wasmPromises = {};
function loadWasm(threaded) {
  const key = threaded ? "mt" : "st";
  if (!wasmPromises[key]) wasmPromises[key] = (async () => {
    const url = threaded ? "./pack_threads.wasm" : "./pack.wasm";
    post("stage", { stage: `加载 ${threaded ? "pack_threads" : "pack"}.wasm …` });
    const r = await fetch(url);
    if (!r.ok) throw new Error(url + " fetch " + r.status);
    const bytes = await r.arrayBuffer();
    const module = await WebAssembly.compile(bytes);
    return { module, limits: threaded ? parseMemLimits(bytes) : null };
  })();
  return wasmPromises[key];
}

let basePromise = null;
function loadBase() {
  if (!basePromise) basePromise = (async () => {
    post("stage", { stage: "加载 base 数据(UNITS 模板 + 关卡几何)…" });
    const gz = await fetch("./full_base_bundle.bin.gz").then(r => {
      if (!r.ok) throw new Error("base bundle fetch " + r.status);
      return r.arrayBuffer();
    });
    const u8 = new Uint8Array(await new Response(
      new Blob([gz]).stream().pipeThrough(new DecompressionStream("gzip"))
    ).arrayBuffer());
    const dec = new TextDecoder();
    if (dec.decode(u8.subarray(0, 8)) !== "TL2BASE1") throw new Error("base bundle: bad magic");
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    let p = 8;
    const n = dv.getUint32(p, true); p += 4;
    const entries = new Map();
    for (let i = 0; i < n; i++) {
      const pl = dv.getUint16(p, true); p += 2;
      const path = dec.decode(u8.subarray(p, p + pl)); p += pl;
      const dl = dv.getUint32(p, true); p += 4;
      entries.set(path, { bytes: u8.subarray(p, p + dl) }); p += dl;
    }
    // 隔离环境:字节进 SAB(线程池零拷贝共享);否则普通 buffer(同样省碎片)。
    const { buf, meta } = sabifyEntries(entries, CAN_THREAD);
    log(`base bundle:${n} 个文件(UNITS 模板 + LEVELSETS + 碰撞几何,gz ${gz.byteLength >> 10} KB)`);
    return { tree: buildTree(entries), buf, meta }; // 只读,可跨 pack 复用
  })();
  return basePromise;
}

// ── wasi-threads 线程池(在 _start 阻塞前预建;spawn 只 postMessage)──────
let tidCounter = 0;
async function spawnThreadPool(n, initMsg) {
  const workers = [];
  const ready = [];
  for (let i = 0; i < n; i++) {
    const w = new Worker("./pack_thread_worker.js", { type: "module" });
    workers.push(w);
    ready.push(new Promise((res, rej) => {
      w.onmessage = e => {
        if (e.data && e.data.type === "ready") res();
        else if (e.data && e.data.type === "init-error") rej(new Error(e.data.err));
      };
      w.onerror = e => rej(new Error("pack_thread_worker: " + (e.message || "加载失败")));
    }));
    w.postMessage(initMsg);
  }
  await Promise.all(ready);
  const idle = workers.slice();
  return {
    spawn(startArg) {
      const w = idle.pop();
      if (!w) return -11; // EAGAIN:池耗尽(阻塞中无法再造 worker)
      const tid = ++tidCounter;
      w.postMessage({ op: "start", tid, startArg });
      return tid;
    },
    terminate() { for (const w of workers) w.terminate(); },
  };
}

// ── 跑一次 pack ─────────────────────────────────────────────────────────────
// modEntries: Map rel → {bytes, mtimeMs?/mtimeNs?};outName: "xxx.MOD"
async function runPack(modEntries, outName, forceSingle = false, convertThreads = CONVERT_THREADS) {
  const poolSize = PACK_THREADS + (convertThreads >= 2 ? convertThreads : 0);
  const threaded = !forceSingle && CAN_THREAD && poolSize >= 2;
  const [{ module, limits }, base] = await Promise.all([loadWasm(threaded), loadBase()]);

  post("stage", { stage: "构建内存文件系统 …" });
  // 多线程:mod 字节也进 SAB,池成员共享同一份(主树的 File 直接持同一 view)
  let modMeta = null, modBuf = null;
  if (threaded) ({ buf: modBuf, meta: modMeta } = sabifyEntries(modEntries, true));
  const modTree = buildTree(modEntries);
  const modDir = new PreopenDirectory("/mod", modTree.contents);
  if (modDir.dir) modDir.dir.contents = modTree.contents; // shim 可能拷成普通 Map,强制回 CIMap
  const outCI = new CIMap();
  const outDir = new PreopenDirectory("/out", outCI);
  if (outDir.dir) outDir.dir.contents = outCI;
  const baseDir = new PreopenDirectory("/base", base.tree.contents);
  if (baseDir.dir) baseDir.dir.contents = base.tree.contents;

  const fds = [
    new OpenFile(new WFile([])),                       // stdin
    ConsoleStdout.lineBuffered(m => log("[wasm] " + m)), // stdout
    ConsoleStdout.lineBuffered(m => log("[wasm] " + m)), // stderr(converted:/packed: 进度都在这)
    modDir, outDir, baseDir,
  ];
  const env = ["MPP_BACKEND=re", "TL2_MEDIA_DIR=/base"];

  // 多线程装配:shared memory + 预建线程池 + TL2_THREADS。任何一步失败都
  // 整体回退单线程重跑(输出字节一致,只是慢)。
  let pool = null, memory = null;
  const imports = {};
  if (threaded) {
    try {
      post("stage", { stage: `预建线程池(${poolSize} workers)…` });
      memory = new WebAssembly.Memory({ initial: limits.mn, maximum: limits.mx, shared: true });
      pool = await spawnThreadPool(poolSize, {
        op: "init", module, memory,
        modMeta, modBuf, baseMeta: base.meta, baseBuf: base.buf,
      });
      env.push("TL2_THREADS=" + PACK_THREADS);
      if (convertThreads >= 2) env.push("TL2_CONVERT_THREADS=" + convertThreads);
      imports.env = { memory };
      imports.wasi = { "thread-spawn": (a) => pool.spawn(a) };
      post("mode", { threads: PACK_THREADS, isolated: true });
    } catch (e) {
      log("线程池初始化失败,回退单线程:" + (e && e.message || e), "bad");
      if (pool) pool.terminate();
      return runPack(modEntries, outName, true);
    }
  } else {
    post("mode", { threads: 1, isolated: CAN_THREAD });
  }

  const wasi = new WASI(
    ["pack", "/mod", "/out/" + outName],
    env,
    fds, { debug: false },
  );
  imports.wasi_snapshot_preview1 = wasi.wasiImport;

  post("stage", { stage: threaded ? `打包中(压缩 ×${PACK_THREADS}${convertThreads >= 2 ? " · 编译 ×" + convertThreads : ""} 并行)…` : "打包中(DAT/LAYOUT 编译 + 容器组装)…" });
  const t0 = performance.now();
  const instance = await WebAssembly.instantiate(module, imports);
  let rc = 0;
  try {
    // threads 模式给 shim 一个 fresh-memory 包装实例:兄弟 worker grow 后
    // 本 isolate 的 memory.buffer 可能是旧长度视图(引擎缓存),shim 写新长
    // 出的区间会越界 —— 包装让每次取 buffer 前先 grow(0) 强制刷新。
    const shimInst = threaded ? wrapInstanceFreshMemory(instance, memory) : instance;
    rc = wasi.start(shimInst); // 同步阻塞——所以整段逻辑住在 worker 里
  } finally {
    if (pool) pool.terminate(); // rayon 常驻线程随池一起回收
  }
  const ms = Math.round(performance.now() - t0);
  if (rc !== 0) throw new Error("pack.wasm 退出码 " + rc);

  const oc = (outDir.dir && outDir.dir.contents) || outCI;
  const f = oc.get(outName);
  if (!f) throw new Error("wasm 正常退出但没有产出 " + outName);
  const data = f.data instanceof Uint8Array ? f.data : new Uint8Array(f.data);
  return { data, ms };
}

async function sha256hex(u8) {
  const h = await crypto.subtle.digest("SHA-256", u8);
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── .MOD 容器解析(自检用;ft 用 BigInt——FILETIME ≈ 1.3e17 超出 Number 精度)──
function parseMod(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let p = 0;
  const rw = () => { const v = dv.getUint16(p, true); p += 2; return v; };
  const rd = () => { const v = dv.getUint32(p, true); p += 4; return v; };
  const rq = () => { const v = dv.getBigUint64(p, true); p += 8; return v; };
  const rb = () => { const v = u8[p]; p += 1; return v; };
  const rss = () => {
    const n = rw(); let s = "";
    for (let i = 0; i < n; i++) { s += String.fromCharCode(dv.getUint16(p, true)); p += 2; }
    return s;
  };
  const h = {
    ver: rw(), modver: rw(), gamever: rq(), offData: rd(), offMan: rd(),
    title: rss(), author: rss(), descr: rss(), website: rss(), download: rss(),
    modid: rq(), flags: rd(), reqHash: rq(),
  };
  const nreq = rw(); for (let i = 0; i < nreq; i++) { rss(); rq(); rw(); }
  const ndel = rw(); for (let i = 0; i < ndel; i++) { rss(); }
  p = h.offMan;
  const mver = rw();
  h.mhash = mver >= 2 ? rd() : 0;
  h.root = rss(); h.fc = rd();
  const dc = rd();
  const files = new Map();
  for (let d = 0; d < dc; d++) {
    const dname = rss(); const cnt = rd();
    for (let i = 0; i < cnt; i++) {
      const crc = rd(), typ = rb(), name = rss(), off = rd(), size = rd(), ft = rq();
      if (typ !== 7) files.set(dname + name, { off, size, ft, crc });
    }
  }
  return { h, files };
}

async function inflate(u8) {
  const ds = new DecompressionStream("deflate");
  const wr = ds.writable.getWriter(); wr.write(u8); wr.close();
  return new Uint8Array(await new Response(ds.readable).arrayBuffer());
}
async function block(u8, h, off) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const b = h.offData + off;
  const decsz = dv.getUint32(b, true), csz = dv.getUint32(b + 4, true);
  const blob = u8.subarray(b + 8, b + 8 + (csz ? csz : decsz));
  return csz ? await inflate(blob) : blob.slice();
}
const bytesEq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

// ── 内置自检:天煞星宠物 MOD 样例 ────────────────────────────────────────────
// Test A(逐字节):把参照 ref_pet.MOD 的 manifest FILETIME 反读换算成 ns 注入
//   源文件的 mtime(合成 RAW 在桌面版 ft=0,自然不注入),输出必须与参照
//   逐字节一致(SHA-256)——同时验证打包流水线、mtime 注入链路和与桌面版
//   filetime_of 完全相同的 f64 换算(桌面输出的 ft 落在 f64 可达网格上,
//   注入回去是不动点)。多线程模式下跑的就是并行编译+并行压缩全链路。
// Test B(毫秒精度):按真实用户路径注入固定的 File.lastModified 毫秒值,
//   manifest 中每个源文件条目的 FILETIME 必须等于 f64 路径复算的期望值,
//   合成条目保持 0,数据段解压内容逐文件与参照一致。
async function selftest() {
  log(`── 内置自检 · 天煞星宠物 MOD 样例(${CAN_THREAD ? PACK_THREADS + " 线程" : "单线程"})──`);
  const [modJson, refBuf] = await Promise.all([
    fetch("./selftest/pet_mod.json").then(r => { if (!r.ok) throw new Error("pet_mod.json " + r.status); return r.json(); }),
    fetch("./selftest/ref_pet.MOD").then(r => { if (!r.ok) throw new Error("ref_pet.MOD " + r.status); return r.arrayBuffer(); }),
  ]);
  const ref = new Uint8Array(refBuf);
  const mr = parseMod(ref);
  const b64ToU8 = b64 => {
    const s = atob(b64); const u = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    return u;
  };

  // Test A — 参照 FILETIME 反读注入 → 逐字节一致
  const entriesA = new Map();
  let injected = 0;
  for (const [k, v] of Object.entries(modJson)) {
    const e = { bytes: b64ToU8(v) };
    const fr = mr.files.get(k.toUpperCase()); // manifest key 与源相对路径同形(MOD.DAT 不在 manifest)
    if (fr && fr.ft > 0n) { e.mtimeNs = (fr.ft - FILETIME_EPOCH_DELTA) * 100n; injected++; }
    entriesA.set(k, e);
  }
  log(`样例载入:${entriesA.size} 个文件(${injected} 个注入参照 mtime);参照 ref_pet.MOD ${ref.length} 字节`);
  const a = await runPack(entriesA, "selftest.MOD");
  const [shaA, shaRef] = await Promise.all([sha256hex(a.data), sha256hex(ref)]);
  const passA = a.data.length === ref.length && shaA === shaRef;
  log(`Test A(逐字节一致):输出 ${a.data.length} B / ${a.ms} ms`);
  log(`  SHA256 输出 ${shaA}`);
  log(`  SHA256 参照 ${shaRef}`);
  log(passA ? "  → PASS · 与桌面版输出逐字节一致(含 manifest FILETIME)" : "  → FAIL · 输出与参照不一致", passA ? "ok" : "bad");

  // Test B — 毫秒精度真实用户路径(File.lastModified)
  const MS = Date.UTC(2026, 0, 1); // 固定 2026-01-01T00:00:00Z
  const entriesB = new Map();
  for (const [k, v] of Object.entries(modJson)) entriesB.set(k, { bytes: b64ToU8(v), mtimeMs: MS });
  const b = await runPack(entriesB, "selftest_mtime.MOD");
  // 复刻 Rust filetime_of 的 f64 路径:(secs as f64 * 1e7) as u64 + delta
  const secs = Math.floor(MS / 1000) + (MS % 1000) * 1e-3;
  const expFt = BigInt(Math.trunc(secs * 1e7)) + FILETIME_EPOCH_DELTA;
  const mb = parseMod(b.data);
  let srcOk = 0, synthOk = 0, ftBad = 0, srcTotal = 0, synthTotal = 0;
  for (const [k, f] of mb.files) {
    const isSrc = mr.files.get(k) && mr.files.get(k).ft > 0n; // 参照里带 mtime 的 = 源文件
    if (isSrc) { srcTotal++; f.ft === expFt ? srcOk++ : ftBad++; }
    else { synthTotal++; f.ft === 0n ? synthOk++ : ftBad++; }
  }
  let same = 0, diff = 0;
  for (const [k, fb] of mb.files) {
    const fr = mr.files.get(k);
    if (!fr) { diff++; continue; }
    const db = await block(b.data, mb.h, fb.off);
    const dn = await block(ref, mr.h, fr.off);
    bytesEq(db, dn) ? same++ : diff++;
  }
  const passB = ftBad === 0 && diff === 0 && mb.files.size === mr.files.size;
  log(`Test B(毫秒 mtime):源文件 FILETIME 命中 ${srcOk}/${srcTotal},合成文件保持 0:${synthOk}/${synthTotal},解压内容一致 ${same}/${mr.files.size}`);
  log(passB ? "  → PASS · File.lastModified 全链路进入 manifest FILETIME" : "  → FAIL", passB ? "ok" : "bad");

  post("selftest", {
    pass: passA && passB,
    summary: passA && passB
      ? `PASS · Test A 与桌面版参照逐字节一致(${a.data.length} B,SHA-256 相同);Test B mtime 链路 ${srcOk}/${srcTotal} 命中${CAN_THREAD ? ` · ${PACK_THREADS} 线程` : ""}`
      : `FAIL · Test A ${passA ? "PASS" : "FAIL"} / Test B ${passB ? "PASS" : "FAIL"}(详见日志)`,
    shaA, size: a.data.length,
  });
}

// ── 消息入口:{op:"selftest"} | {op:"pack", files:[{rel,file}], outName} ────
self.onmessage = async (ev) => {
  const msg = ev.data;
  try {
    if (msg.op === "selftest") {
      await selftest();
    } else if (msg.op === "pack") {
      post("stage", { stage: "开始打包 " + msg.outName });
      const entries = new Map();
      let done = 0, bytes = 0;
      for (const { rel, file } of msg.files) {
        const buf = new Uint8Array(await file.arrayBuffer());
        entries.set(rel, { bytes: buf, mtimeMs: file.lastModified });
        done++; bytes += buf.length;
        if ((done & 31) === 0 || done === msg.files.length)
          post("progress", { done, total: msg.files.length, bytes });
      }
      log(`已读入 ${done} 个文件,共 ${(bytes / 1048576).toFixed(1)} MB`);
      // argv 里只放 ASCII 占位名:shim 0.3.0 的 args_sizes_get 按 UTF-16 code units
      // 计长、args_get 按 UTF-8 写入,中文输出名会被截断成无效 UTF-8 → Rust
      // env::args() panic。容器内容与外部文件名无关,真实名字只用于下载。
      const { data, ms } = await runPack(entries, "OUTPUT.MOD", !!msg.forceSingle, msg.convertThreads ?? CONVERT_THREADS);
      const sha = await sha256hex(data);
      log(`打包完成:${data.length} 字节 / ${ms} ms`);
      log(`SHA256:${sha}`);
      const out = data.byteOffset === 0 && data.buffer.byteLength === data.length ? data : data.slice();
      self.postMessage({ type: "done", name: msg.outName, size: out.length, sha, ms, data: out.buffer }, [out.buffer]);
    }
  } catch (e) {
    const raw = String(e && e.message || e);
    // 浏览器 4GB 线性内存上限:巨型整合组件(关卡/MPP 资产极多)会撞穿
    const oom = /memory|out of memory|unreachable|RuntimeError|allocation|os error 48/i.test(raw);
    log("错误:" + (e && e.stack || e), "bad");
    post("error", {
      message: oom
        ? "超出浏览器 4GB 内存上限 —— 这个 mod 太大(关卡 / MPP 资产过多)。请改用桌面版打包器。原始错误:" + raw
        : raw,
    });
  }
};

// 能力上报(页面状态行)
post("mode", { threads: THREADS, isolated: CAN_THREAD });
