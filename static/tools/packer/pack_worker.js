// ═══════════════════════════════════════════════════════════════════════════
// pack_worker.js — 浏览器内 .MOD 打包 worker(余烬工坊 · Emberworks)
//
// 驱动 pack.wasm(tl2-mikuro-mod-packer 桌面版同一套 Rust 代码编译的
// wasm32-wasip1),经 @bjorn3/browser_wasi_shim@0.3.0(vendored)提供
// 内存文件系统。打包全程在本地浏览器内完成,不上传任何文件。
//
// 三个 preopen:
//   /mod  — 用户选择的 mod_root(MOD.DAT + MEDIA/)
//   /base — 附带的 Runic base UNITS 数据(BASEFILE 继承解析用,只读)
//   /out  — 输出(.MOD 与流式打包的 .data.tmp 临时文件都落在这里)
//
// 两个关键兼容层:
//   CIMap        — Windows FS 是大小写不敏感的;TL2 的 BASEFILE 引用是小写
//                  (media/units/items/base.dat)而附带 base 文件是大写路径,
//                  没有它 BASEFILE 继承会断。
//   fileWithMtime — shim 0.3.0 的 Filestat.write_bytes 用了错位 offset
//                  (atim@38 / mtim@46 / ctim@52,mtim 与 ctim 还互相重叠),
//                  wasip1 标准布局是 40/48/56。时间戳全 0 时错位读不出差别,
//                  但要把 File.lastModified 传给 Rust 的 metadata.modified()
//                  (→ manifest FILETIME),必须覆写 stat() 按标准 offset 写。
// ═══════════════════════════════════════════════════════════════════════════
import {
  WASI, File as WFile, Directory, PreopenDirectory, OpenFile, ConsoleStdout,
  wasi as W,
} from "./vendor/browser_wasi_shim/index.js";

const post = (type, extra) => self.postMessage(Object.assign({ type }, extra));
const log = (line, cls) => post("log", { line, cls });

const FILETIME_EPOCH_DELTA = 116444736000000000n; // 100ns ticks, 1601→1970

// ── 大小写不敏感 Map(仿 Windows FS 语义)─────────────────────────────────
class CIMap extends Map {
  get(k) { return super.get(String(k).toUpperCase()); }
  has(k) { return super.has(String(k).toUpperCase()); }
  set(k, v) { return super.set(String(k).toUpperCase(), v); }
  delete(k) { return super.delete(String(k).toUpperCase()); }
}
const ciDir = () => { const c = new CIMap(); const d = new Directory(c); d.contents = c; return d; };

// ── File + mtime(标准 offset 的 filestat)──────────────────────────────────
function fileWithMtime(bytes, mtimeNs) {
  const f = new WFile(bytes);
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

// ── 静态资产(module + base 树只加载一次,跨多次打包复用)────────────────────
let wasmPromise = null;
function loadWasm() {
  if (!wasmPromise) wasmPromise = (async () => {
    post("stage", { stage: "加载 pack.wasm …" });
    try { return await WebAssembly.compileStreaming(fetch("./pack.wasm")); }
    catch (_) {
      const b = await fetch("./pack.wasm").then(r => {
        if (!r.ok) throw new Error("pack.wasm fetch " + r.status);
        return r.arrayBuffer();
      });
      return WebAssembly.compile(b);
    }
  })();
  return wasmPromise;
}

let basePromise = null;
function loadBase() {
  if (!basePromise) basePromise = (async () => {
    post("stage", { stage: "加载 base UNITS 数据 …" });
    const gz = await fetch("./base_units_bundle.bin.gz").then(r => {
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
    log(`base UNITS bundle:${n} 个文件(gz ${gz.byteLength >> 10} KB)`);
    return buildTree(entries); // 只读,可跨 pack 复用
  })();
  return basePromise;
}

// ── 跑一次 pack ─────────────────────────────────────────────────────────────
// modEntries: Map rel → {bytes, mtimeMs?/mtimeNs?};outName: "xxx.MOD"
async function runPack(modEntries, outName) {
  const [wasmMod, baseTree] = await Promise.all([loadWasm(), loadBase()]);

  post("stage", { stage: "构建内存文件系统 …" });
  const modTree = buildTree(modEntries);
  const modDir = new PreopenDirectory("/mod", modTree.contents);
  if (modDir.dir) modDir.dir.contents = modTree.contents; // shim 可能拷成普通 Map,强制回 CIMap
  const outCI = new CIMap();
  const outDir = new PreopenDirectory("/out", outCI);
  if (outDir.dir) outDir.dir.contents = outCI;
  const baseDir = new PreopenDirectory("/base", baseTree.contents);
  if (baseDir.dir) baseDir.dir.contents = baseTree.contents;

  const fds = [
    new OpenFile(new WFile([])),                       // stdin
    ConsoleStdout.lineBuffered(m => log("[wasm] " + m)), // stdout
    ConsoleStdout.lineBuffered(m => log("[wasm] " + m)), // stderr(converted:/packed: 进度都在这)
    modDir, outDir, baseDir,
  ];
  const wasi = new WASI(
    ["pack", "/mod", "/out/" + outName],
    ["MPP_BACKEND=none", "TL2_MEDIA_DIR=/base"],
    fds, { debug: false },
  );

  post("stage", { stage: "打包中(DAT/LAYOUT 编译 + 容器组装)…" });
  const t0 = performance.now();
  const instance = await WebAssembly.instantiate(wasmMod, { wasi_snapshot_preview1: wasi.wasiImport });
  let rc = 0;
  rc = wasi.start(instance); // 同步阻塞——所以整段逻辑住在 worker 里
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
//   注入回去是不动点)。
// Test B(毫秒精度):按真实用户路径注入固定的 File.lastModified 毫秒值,
//   manifest 中每个源文件条目的 FILETIME 必须等于 f64 路径复算的期望值,
//   合成条目保持 0,数据段解压内容逐文件与参照一致。
async function selftest() {
  log("── 内置自检 · 天煞星宠物 MOD 样例 ──");
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
      ? `PASS · Test A 与桌面版参照逐字节一致(${a.data.length} B,SHA-256 相同);Test B mtime 链路 ${srcOk}/${srcTotal} 命中`
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
      const { data, ms } = await runPack(entries, "OUTPUT.MOD");
      const sha = await sha256hex(data);
      log(`打包完成:${data.length} 字节 / ${ms} ms`);
      log(`SHA256:${sha}`);
      const out = data.byteOffset === 0 && data.buffer.byteLength === data.length ? data : data.slice();
      self.postMessage({ type: "done", name: msg.outName, size: out.length, sha, ms, data: out.buffer }, [out.buffer]);
    }
  } catch (e) {
    log("错误:" + (e && e.stack || e), "bad");
    post("error", { message: String(e && e.message || e) });
  }
};
