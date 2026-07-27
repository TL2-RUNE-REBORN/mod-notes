// ═══════════════════════════════════════════════════════════════════════════
// unpack_worker.js — 浏览器内 .MOD 解包 worker(余烬工坊 · Emberworks)
//
// 驱动 unpack.wasm(tl2-mikuro-mod-packer 桌面版同一套 Rust 代码编译的
// wasm32-wasip1),经 @bjorn3/browser_wasi_shim@0.3.0(vendored)提供内存
// 文件系统。解包全程在本地浏览器内完成,不上传任何文件。
//
// 解包不是「解压」:.MOD 容器里存的是**编译产物、却挂在源文件名下**
// (FOO.DAT 里其实是 BINDAT,FOO.LAYOUT 里其实是 BINLAYOUT),所以 wasm 侧
// 会把它们反编译回 UTF-16LE 文本源;其余文件原样写出。产物与桌面版
// `tl2-mikuro-mod-packer unpack` 逐字节一致。
//
// 两个 preopen:
//   /in   — 用户选中的 .MOD(只读)
//   /out  — 解包产物(整棵 MOD.DAT + MEDIA/ 树)
//
// 落盘两条路(浏览器不能像桌面那样直接写任意目录):
//   File System Access — 用户授权一个输出目录,worker 直接逐文件写进去,
//                        写一个丢一个,内存峰值≈单个文件。Chrome / Edge。
//   ZIP 兜底           — 没有 FSA 的浏览器打成 store-only ZIP 下载。整包要
//                        在内存里组装,所以有体积/条目上限,超了就明说。
//
// 单线程:unpack.wasm 是 wasm32-wasip1(非 threads)构建,rayon 在这里退化
// 为串行。解包的瓶颈本来就是逐文件落盘,不是 CPU。
// ═══════════════════════════════════════════════════════════════════════════
import {
  WASI, File as WFile, PreopenDirectory, OpenFile, ConsoleStdout,
} from "./vendor/browser_wasi_shim/index.js";
import { CIMap, ciDir, viewFile } from "./pack_threads_common.js";

const post = (type, extra) => self.postMessage(Object.assign({ type }, extra));
const log = (line, cls) => post("log", { line, cls });

// 英文页复用同一份 worker 与 wasm 资产,只用 URL 上的 ?lang=en 切文案。
const LANG = /(^|[?&])lang=en(&|$)/.test(self.location.search) ? "en" : "zh";
const T = (zh, en) => (LANG === "en" ? en : zh);

// ZIP 兜底的硬上限:store-only ZIP 无 ZIP64,中央目录用 16 位条目数、
// 32 位偏移,超了就是坏包 —— 与其产一个悄悄损坏的 ZIP,不如直说。
const ZIP_MAX_ENTRIES = 65535;
const ZIP_MAX_BYTES = 0xFFFFFFFF;

// ── wasm 模块(只加载一次,跨多次解包复用)────────────────────────────────
let wasmPromise = null;
function loadWasm() {
  if (!wasmPromise) wasmPromise = (async () => {
    post("stage", { stage: T("加载 unpack.wasm …", "Loading unpack.wasm …") });
    const r = await fetch("./unpack.wasm");
    if (!r.ok) throw new Error("unpack.wasm fetch " + r.status);
    return WebAssembly.compile(await r.arrayBuffer());
  })();
  return wasmPromise;
}

// ── 跑一次 unpack:返回 /out 的根目录 contents ──────────────────────────────
async function runUnpack(modBytes, modName) {
  const module = await loadWasm();

  post("stage", { stage: T("构建内存文件系统 …", "Building the in-memory filesystem …") });
  const inTree = ciDir();
  inTree.contents.set(modName, viewFile(modBytes)); // 零拷贝持有原字节
  const inDir = new PreopenDirectory("/in", inTree.contents);
  if (inDir.dir) inDir.dir.contents = inTree.contents;
  const outCI = new CIMap();
  const outDir = new PreopenDirectory("/out", outCI);
  if (outDir.dir) outDir.dir.contents = outCI;

  // wasm 每 5% 往 stderr 打一行 "  N/M files (P%)" —— 转成进度条。
  const onLine = m => {
    const hit = /^\s*(\d+)\/(\d+) files \((\d+)%\)/.exec(m);
    if (hit) post("progress", { done: +hit[1], total: +hit[2] });
    else log("[wasm] " + m);
  };
  const fds = [
    new OpenFile(new WFile([])),
    ConsoleStdout.lineBuffered(onLine),
    ConsoleStdout.lineBuffered(onLine),
    inDir, outDir,
  ];

  const wasi = new WASI(["unpack", "/in/" + modName, "/out"], [], fds, { debug: false });
  post("stage", { stage: T("解包中(反编译 DAT / LAYOUT)…", "Unpacking (decompiling DAT / LAYOUT) …") });
  const t0 = performance.now();
  const instance = await WebAssembly.instantiate(module, {
    wasi_snapshot_preview1: wasi.wasiImport,
  });
  const rc = wasi.start(instance); // 同步阻塞——所以整段逻辑住在 worker 里
  const ms = Math.round(performance.now() - t0);
  if (rc !== 0) throw new Error(T("unpack.wasm 退出码 ", "unpack.wasm exit code ") + rc);
  return { contents: (outDir.dir && outDir.dir.contents) || outCI, ms };
}

// ── 把 /out 树摊平成 [{parts, file}](深度优先,目录在前)────────────────
function flatten(contents, prefix, out) {
  for (const [name, node] of contents) {
    const parts = prefix.concat(name);
    if (node && node.contents instanceof Map) flatten(node.contents, parts, out);
    else out.push({ parts, node });
  }
  return out;
}

// ── 落盘 A:File System Access,写一个丢一个 ────────────────────────────────
async function writeToDirectory(entries, dirHandle) {
  const dirCache = new Map([["", dirHandle]]);
  const dirFor = async parts => {
    const key = parts.join("/");
    const hit = dirCache.get(key);
    if (hit) return hit;
    const parent = await dirFor(parts.slice(0, -1));
    const h = await parent.getDirectoryHandle(parts[parts.length - 1], { create: true });
    dirCache.set(key, h);
    return h;
  };
  let done = 0, bytes = 0;
  for (const e of entries) {
    const dir = await dirFor(e.parts.slice(0, -1));
    const fh = await dir.getFileHandle(e.parts[e.parts.length - 1], { create: true });
    const w = await fh.createWritable();
    const data = e.node.data;
    await w.write(data);
    await w.close();
    bytes += data.byteLength;
    // 写完就松手:整棵树同时驻留是解包的内存峰值,放掉才敢开大 mod。
    e.node.data = new Uint8Array(0);
    if ((++done & 31) === 0 || done === entries.length) {
      post("progress", { done, total: entries.length, phase: "write", bytes });
    }
  }
  return { bytes };
}

// ── 落盘 B:store-only ZIP(无 FSA 的浏览器)────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c >>> 0;
  }
  return t;
})();
function crc32(u8) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function buildZip(entries) {
  const enc = new TextEncoder();
  const total = entries.reduce((s, e) => s + e.node.data.byteLength, 0);
  if (entries.length > ZIP_MAX_ENTRIES || total > ZIP_MAX_BYTES) {
    throw new Error(T(
      `这个 mod 解出 ${entries.length} 个文件 / ${(total / 1048576).toFixed(0)} MB,超出 ZIP 兜底的上限。` +
      `请用 Chrome / Edge(可直接写出目录),或用桌面版解包。`,
      `This mod unpacks to ${entries.length} files / ${(total / 1048576).toFixed(0)} MB, past the limits of the ` +
      `ZIP fallback. Use Chrome / Edge (which can write the folder directly), or the desktop unpacker.`,
    ));
  }
  const parts = [];
  const central = [];
  let offset = 0, done = 0;
  for (const e of entries) {
    const nameBytes = enc.encode(e.parts.join("/"));
    const data = e.node.data;
    const crc = crc32(data);
    const local = new Uint8Array(30 + nameBytes.length);
    const dv = new DataView(local.buffer);
    dv.setUint32(0, 0x04034B50, true);
    dv.setUint16(4, 20, true);          // version needed
    dv.setUint16(6, 0x0800, true);      // flags: UTF-8 names
    dv.setUint16(8, 0, true);           // method 0 = store
    dv.setUint32(14, crc, true);
    dv.setUint32(18, data.byteLength, true);
    dv.setUint32(22, data.byteLength, true);
    dv.setUint16(26, nameBytes.length, true);
    local.set(nameBytes, 30);
    parts.push(local, data);

    const cen = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cen.buffer);
    cv.setUint32(0, 0x02014B50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.byteLength, true);
    cv.setUint32(24, data.byteLength, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint32(42, offset, true);
    cen.set(nameBytes, 46);
    central.push(cen);

    offset += local.byteLength + data.byteLength;
    if ((++done & 255) === 0 || done === entries.length) {
      post("progress", { done, total: entries.length, phase: "zip", bytes: offset });
    }
  }
  const centralSize = central.reduce((s, c) => s + c.byteLength, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054B50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  return new Blob([...parts, ...central, end], { type: "application/zip" });
}

// ── 消息入口 ────────────────────────────────────────────────────────────────
self.onmessage = async ev => {
  const msg = ev.data;
  if (msg.op !== "unpack") return;
  try {
    const file = msg.file;
    const modName = (file.name || "INPUT.MOD").replace(/[^\w.\-]/g, "_");
    post("stage", { stage: T("读取 .MOD …", "Reading the .MOD …") });
    const modBytes = new Uint8Array(await file.arrayBuffer());
    log(T(
      `输入:${file.name} · ${modBytes.length.toLocaleString()} 字节`,
      `Input: ${file.name} · ${modBytes.length.toLocaleString()} bytes`,
    ));

    const { contents, ms } = await runUnpack(modBytes, modName);
    const entries = flatten(contents, [], []);
    if (!entries.length) throw new Error(T("wasm 正常退出但没有产出文件", "wasm exited cleanly but produced no files"));
    const totalBytes = entries.reduce((s, e) => s + e.node.data.byteLength, 0);
    log(T(
      `解包完成:${entries.length} 个文件 · ${(totalBytes / 1048576).toFixed(1)} MB · ${ms} ms`,
      `Unpacked: ${entries.length} files · ${(totalBytes / 1048576).toFixed(1)} MB · ${ms} ms`,
    ));

    if (msg.dirHandle) {
      post("stage", { stage: T("写出到所选文件夹 …", "Writing to the chosen folder …") });
      const { bytes } = await writeToDirectory(entries, msg.dirHandle);
      post("done", { mode: "dir", files: entries.length, bytes, ms });
    } else {
      post("stage", { stage: T("打包成 ZIP …", "Building the ZIP …") });
      const blob = buildZip(entries);
      post("done", { mode: "zip", files: entries.length, bytes: totalBytes, ms, blob });
    }
  } catch (e) {
    post("error", { message: (e && e.message) || String(e) });
  }
};
