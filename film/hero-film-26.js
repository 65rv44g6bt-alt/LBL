/* The Bridge Exchange, hero cut for the website (laptop), v26: drawn live on a transparent canvas, locked to the music's beat grid.
   New: big-word intro, big-word team learnings, a photo carousel, and the end card over it. */
window.BEATS = {"p1": [0.139, 0.627, 1.115, 1.602, 2.09, 2.577, 3.065, 3.553, 4.017, 4.505, 4.993, 5.457, 5.922, 6.409, 6.897, 7.384, 7.872, 8.36, 8.847, 9.335, 9.823, 10.287, 10.775, 11.262, 11.75, 12.237, 12.702, 13.189, 13.677, 14.165, 14.652, 15.14, 15.604, 16.092, 16.58, 17.067, 17.555, 18.019, 18.507, 18.994, 19.482, 19.97, 20.434, 20.922, 21.409, 21.897, 22.385, 22.872, 23.36, 23.824, 24.312, 24.799, 25.287, 25.775, 26.262, 26.75, 27.214, 27.702, 28.19, 28.677, 29.142, 29.629, 30.117, 30.604, 31.092, 31.58, 32.0639, 32.5479, 33.0318, 33.5157, 33.9996, 34.4836], "p2": [33.0318, 33.5194, 34.007, 34.4946, 34.9706, 35.4583, 35.9459, 36.4335, 36.8979, 37.3855, 37.8615, 38.3608, 38.8368, 39.3244, 39.8004, 40.288, 40.7756, 41.2516, 41.7393, 42.2269, 42.7029, 43.1905, 43.6781, 44.1541, 44.6418, 45.141, 45.617, 46.1046, 46.5806, 47.0682, 47.5559, 48.0435, 48.5079, 49.0071, 49.4831, 49.9707, 50.4467, 50.9344, 51.422, 51.9096, 52.374, 52.8732, 53.3492, 53.8369, 54.3129, 54.8005, 55.2881, 55.7757], "dur": 62.75, "endT": [56.228, 57.11, 58.062, 59.026]};
(function () {
"use strict";
var cv = null, ctx = null;
var W = 1920, H = 1080, DUR = window.BEATS.dur;
var C = { bg: "#FFFFFF", ink: "#1B1D1F", soft: "#6A7076", line: "#E4E5E7", grid: "rgba(27,29,31,0.045)",
          panel: "#083A42", panel2: "#0B4650", onP: "#EDF3F6", onPs: "#9FB2BF", acc: "#FF6000", red: "#D7263D", sand: "#C9A46A", block: "#E7E4DD" };
var TEAM = ["#FF6000", "#12A594", "#3B7BEA", "#F2B33D", "#22457A"];
var TNAME = ["Premium materials", "Newspaper + tips", "The hoarders", "Bamboo truss", "Glue-gun heavy"];
var SANS = '"Inter Display", Inter, "Helvetica Neue", Arial, sans-serif';

/* ---------- the music's beat grid ---------- */
var BEATS = window.BEATS;
var B1 = function (i) { return BEATS.p1[Math.min(i, BEATS.p1.length - 1)]; };
var B2 = function (i) { return BEATS.p2[Math.min(i, BEATS.p2.length - 1)]; };
var T_TITLE = B1(6), T_BID = B1(12), T_BUILD = B1(36), T_BREAK = B1(48), T_SNAP = B1(64), T_SCORE = B2(0), T_REVEAL = B2(24), T_END = B2(45);
var T_SLIDE = B1(16), T_TRADE = B1(18);   // bid: piles fill centred, slide left as the bank arrives, then trading opens

/* ---------- maths ---------- */
var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.max(a, Math.min(b, x)); };
var seg = function (t, a, b) { return clamp((t - a) / (b - a)); };
var lerp = function (a, b, k) { return a + (b - a) * k; };
var eo = function (x) { return 1 - Math.pow(1 - x, 3); };
var eo5 = function (x) { return 1 - Math.pow(1 - x, 5); };
var ei = function (x) { return x * x * x; };
var eio = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
var eback = function (x) { var c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
var vis = function (t, a, b, fi, fo) { fi = fi || 0.3; fo = fo || 0.3; if (t < a || t > b) return 0; return seg(t, a, a + fi) * (1 - seg(t, b - fo, b)); };
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hex(h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
function mix(c1, c2, k) { var a = hex(c1), b = hex(c2); return "rgb(" + Math.round(lerp(a[0], b[0], k)) + "," + Math.round(lerp(a[1], b[1], k)) + "," + Math.round(lerp(a[2], b[2], k)) + ")"; }
var fmt = function (n) { return Math.round(n).toLocaleString("en-US"); };

/* ---------- drawing helpers ---------- */
var SA = 1;
function setFont(size, weight, fam) { ctx.font = (weight || 700) + " " + size + "px " + (fam || SANS); }
function text(s, x, y, o) {
  o = o || {}; var size = o.size || 40;
  setFont(size, o.weight, o.fam);
  ctx.letterSpacing = (o.ls !== undefined ? o.ls : -size * 0.03) + "px";
  ctx.textAlign = o.align || "left"; ctx.textBaseline = "alphabetic";
  ctx.globalAlpha = SA * (o.alpha === undefined ? 1 : o.alpha);
  ctx.fillStyle = o.color || C.ink; ctx.fillText(s, x, y);
  ctx.globalAlpha = 1; ctx.letterSpacing = "0px";
}
function measure(s, size, weight, ls, fam) { setFont(size, weight, fam); ctx.letterSpacing = (ls !== undefined ? ls : -size * 0.03) + "px"; var w = ctx.measureText(s).width; ctx.letterSpacing = "0px"; return w; }
function reveal(s, x, y, p, o) {
  if (p <= 0) return; o = o || {};
  var size = o.size || 40, k = eo5(clamp(p)), w = measure(s, size, o.weight, o.ls, o.fam);
  var x0 = o.align === "center" ? x - w / 2 : o.align === "right" ? x - w : x;
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 40, y - size * 1.1, w + 80, size * 1.45); ctx.clip();
  text(s, x, y + (1 - k) * size * 1.15, o); ctx.restore();
}
function caps(s, x, y, p, o) { o = o || {}; reveal(s.toUpperCase(), x, y, p, { size: o.size || 20, weight: o.weight || (o.size >= 40 ? 800 : 700), ls: o.ls || 3, color: o.color || C.acc, align: o.align, alpha: o.alpha }); }
function line(x1, y1, x2, y2, col, w, a) { ctx.globalAlpha = SA * (a === undefined ? 1 : a); ctx.strokeStyle = col; ctx.lineWidth = w || 2; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.globalAlpha = 1; }
function rect(x, y, w, h, fill, stroke, lw, a, r) {
  ctx.globalAlpha = SA * (a === undefined ? 1 : a); ctx.beginPath(); if (r) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); } ctx.globalAlpha = 1;
}
function dot(x, y, r, fill, a) { if (!(r > 0)) return; ctx.globalAlpha = SA * (a === undefined ? 1 : a); ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1; }
function ring(x, y, r, col, w, a, from, to) { ctx.globalAlpha = SA * (a === undefined ? 1 : a); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(x, y, r, from || 0, to === undefined ? 6.2832 : to); ctx.stroke(); ctx.globalAlpha = 1; }
function header(t, a, b, num, title, sub) {
  var k = vis(t, a, b, 0.01, 0.01); if (!k) return; var s0 = SA; SA = k;
  /* chapter number removed for the website: the page shows the steps */
  if (title) caption(title, t, a);
  if (sub) reveal(sub, 120, 336, seg(t, a + 0.2, a + 0.7), { size: 28, weight: 500, color: C.soft, ls: -0.4 });
  SA = s0;
}

/* captions sit top centre, one line, just under the page's step bar */
var CAP_Y = 236;
function caption(s, t, at) { reveal(s, 960, CAP_Y, seg(t, at + 0.04, at + 0.42), { size: 74, weight: 800, align: "center", ls: -2 }); }
/* ---------- persistent layers ---------- */
function background(t) { /* transparent: the model shows through */ }
function hud(t) {
  /* v12: no progress bar */
}

/* ---------- the market: rows, purchases, prices ---------- */
var LADDER = [6, 8, 10, 12, 15, 18, 22, 27, 33, 40, 48, 60, 72, 86, 100, 120, 150, 180, 215, 260];
var ROWS = [
  { n: "Balsa sticks", s: "Premium · easy to build", r: 15 }, { n: "Hot-glue gun", s: "Premium · 10-min hire", r: 14 },
  { n: "Masking tape", s: "Scarce", r: 11 }, { n: "Bamboo skewers", s: "Mid-range", r: 9 },
  { n: "Newspaper", s: "Cheap · needs skill", r: 1 }, { n: "Expert Tip card", s: "Know-how", r: 13 },
  { n: "Trusted Blueprints", s: "Proven designs", r: 15 }, { n: "Spy card", s: "See a rival's plan", r: 15 }
];
// who tends to buy what
var PREF = [[0, 0, 1, 2, 0, 1, 2, 6], [4, 4, 5, 6, 4, 2, 7, 4], [4, 7, 4, 3, 4, 4, 4, 4], [3, 3, 2, 2, 3, 2, 6, 3], [1, 1, 2, 2, 1, 0, 2, 2]];
var BUYS = [], HIST = ROWS.map(function (r) { return [[0, r.r]]; }), SPENT = [[], [], [], [], []];
(function () {
  var r = rng(41), eighth = (B1(13) - B1(12)) / 2, cnt = ROWS.map(function () { return 0; }), rung = ROWS.map(function (x) { return x.r; });
  var events = [];
  for (var g = 0; g < 46; g++) {           // eighth notes from the bar after the market opens
    var land = B1(19) + g * eighth;
    if (land > B1(35) - 0.1) break;
    var busy = 0.6 + 0.4 * clamp(g / 24);
    if (r() < busy) events.push({ t: land, team: Math.floor(r() * 5) });
    if (g > 8 && r() < busy * 0.8) events.push({ t: land + eighth * 0.5, team: Math.floor(r() * 5) });
  }
  events.sort(function (a, b) { return a.t - b.t; });
  var lastBuy = ROWS.map(function () { return T_TRADE; }), CAP = [850, 380, 150, 720, 1000], spent = [0, 0, 0, 0, 0];
  events.forEach(function (e) {
    var row = PREF[e.team][Math.floor(r() * 8)];
    if (spent[e.team] + LADDER[rung[row]] > CAP[e.team]) { row = 4; if (spent[e.team] + LADDER[rung[4]] > CAP[e.team]) return; }
    spent[e.team] += LADDER[rung[row]];
    ROWS.forEach(function (x, i) { if (e.t - lastBuy[i] > 2.2 && rung[i] > 0 && i !== 2) { rung[i]--; HIST[i].push([e.t - 0.01, rung[i]]); lastBuy[i] = e.t; } });
    var price = LADDER[rung[row]];
    BUYS.push({ t: e.t, team: e.team, row: row, price: price, n: Math.min(price, 90) });
    SPENT[e.team].push([e.t - 0.62, price]);
    lastBuy[row] = e.t;
    if (++cnt[row] % 2 === 0 || row === 2) { rung[row] = Math.min(LADDER.length - 1, rung[row] + 1); HIST[row].push([e.t, rung[row]]); }
  });
})();
var RANGE = HIST.map(function (h) { var a = h.map(function (q) { return q[1]; }); return [Math.min.apply(null, a), Math.max.apply(null, a)]; });
var rungAt = function (i, t) { var h = HIST[i], r = h[0][1]; for (var k = 0; k < h.length; k++) if (h[k][0] <= t) r = h[k][1]; return r; };
var changeAt = function (i, t) { var h = HIST[i], c = null; for (var k = 1; k < h.length; k++) if (h[k][0] <= t) c = [h[k][0], h[k][1], h[k - 1][1]]; return c; };
var spentAt = function (team, t) { var s = 0; SPENT[team].forEach(function (p) { if (p[0] <= t) s += p[1]; }); return Math.min(1000, s); };

/* ---------- ticker ---------- */
function ticker(t) {
  var a = vis(t, T_TRADE, T_BUILD, 0.01, 0.01); if (!a) return; var s0 = SA; SA = a;
  var y = 0, h = 52;
  rect(0, y, W, h, C.panel);
  var parts = [];
  ROWS.forEach(function (r, i) {
    var ch = changeAt(i, t), up = ch && ch[1] > ch[2];
    parts.push([r.n.toUpperCase() + "  ", C.onP], [String(LADDER[rungAt(i, t)]) + "  ", "#FFFFFF"], [(ch ? (up ? "▲" : "▼") : "◆") + "        ", ch ? (up ? C.acc : "#6FE0C8") : C.onPs]);
  });
  var total = 0; parts.forEach(function (p) { total += measure(p[0], 23, 700, 1.2); });
  var x = -((t - T_BID + 4) * 160) % total;
  for (var rep = 0; rep < 3; rep++) parts.forEach(function (p) { var w = measure(p[0], 23, 700, 1.2); if (x > -400 && x < W + 50) text(p[0], x, y + 35, { size: 23, weight: 700, color: p[1], ls: 1.2 }); x += w; });
  SA = s0;
}

/* ---------- team credit piles: 250 dots each, one dot = 4 credits ---------- */
var PILE = { cols: 14, rows: 18, step: 9.05, r: 4.0, y: 470 };
var CX = 0;                                   // the column's horizontal offset: centred first, then slid left
var colX = function (t) { return 508 * (1 - eio(seg(t, T_SLIDE, T_SLIDE + 0.5))); };
var colS = function (t) { return lerp(1.15, 1, eio(seg(t, T_SLIDE, T_SLIDE + 0.5))); };
function pileXY(i, n) { var x0 = 120 + CX + i * 134; return [x0 + (n % PILE.cols) * PILE.step, PILE.y + (PILE.rows - 1 - Math.floor(n / PILE.cols)) * PILE.step]; }
var dotsLeft = function (i, t) { return Math.min(250, Math.round((1000 - spentAt(i, t)) / 4)); };
var FILL0 = function (i) { return T_BID + 0.1 + i * 0.05; }, FILL_D = 0.9;
function drawPiles(t) {
  for (var i = 0; i < 5; i++) {
    var left = dotsLeft(i, t), rf = seg(t, FILL0(i), FILL0(i) + FILL_D) * (PILE.rows + 1.5);
    if (rf <= 0) continue;
    ctx.fillStyle = TEAM[i];
    for (var n = 0; n < left; n++) {
      var rr = Math.floor(n / PILE.cols), k = clamp(rf - rr); if (k <= 0) break;
      var p = pileXY(i, n);
      ctx.globalAlpha = SA * clamp(k * 2.5); ctx.beginPath(); ctx.arc(p[0], p[1] - (1 - eo(k)) * 14, PILE.r, 0, 6.2832); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

/* ---------- blocks: the banks, running to the screen edge ---------- */
function block(x0, x1, y, a, edge) {
  ctx.save(); ctx.globalAlpha = SA * a * HATCH_A; ctx.strokeStyle = C.ink; ctx.lineWidth = HATCH_W; ctx.lineCap = "butt";
  var SPAN = Math.max(H, VY1 - y + 60);
  ctx.beginPath(); ctx.rect(x0, y, x1 - x0, VY1 - y + 20); ctx.clip(); ctx.beginPath();
  for (var i = -SPAN; i < x1 - x0 + 22; i += 22) { ctx.moveTo(x0 + i, y); ctx.lineTo(x0 + i + SPAN, y + SPAN); } ctx.stroke(); ctx.restore(); ctx.globalAlpha = 1;
  line(x0, y, x1, y, C.ink, 3, a);
  line(edge, y, edge, VY1 + 20, C.ink, 3, a);
}
var HATCH_W = 1.2, HATCH_A = 0.85;
function abutments(t, a, rise) {
  var y = lerp(H + 40, DECK, eo(rise));
  block(VX0 - 10, 560, y, a, 560); block(1360, VX1 + 10, y, a, 1360);
}
/* ---------- the logo, redrawn from the supplied artwork (in the artwork's 1376 x 768 space) ---------- */
var LOGO = {
  deck: [270, 1105, 278, 3], wick: 3.6,
  // [centre x, wick top, body top, body bottom, wick bottom, body width]
  candles: [[340.5, 249, 266, 279, 298, 24], [379.5, 227, 249, 279, 288, 24], [418.5, 185, 213, 266, 278, 24], [457.5, 125, 155, 254, 278, 24],
            [497.5, 39, 72, 323, 323, 26], [537, 98, 128, 243, 278, 23], [576.5, 154, 183, 268, 278, 24], [616, 190, 213, 279, 288, 23],
            [655, 208, 231, 279, 299, 24], [694.5, 217, 248, 279, 298, 24], [734, 208, 232, 279, 298, 24], [773, 190, 213, 279, 288, 24],
            [812, 154, 183, 268, 278, 23], [851, 98, 128, 243, 278, 23], [891, 39, 72, 323, 323, 26], [930.5, 125, 155, 254, 278, 24],
            [970, 185, 213, 266, 278, 23], [1008.5, 226, 245, 279, 288, 25], [1048.5, 249, 266, 279, 298, 24]],
  // each letter placed on the artwork's own letter box: [char, ink left, ink right]
  lines: [{ size: 181.5, base: 453, dark: true, g: [["T", 145, 263], ["H", 271, 398], ["E", 410, 517], ["B", 556, 674], ["R", 681, 803], ["I", 808, 848], ["D", 861, 989], ["G", 996, 1131], ["E", 1141, 1248]] },
          { size: 186.5, base: 592, dark: false, g: [["E", 151, 262], ["X", 267, null], ["C", null, 535], ["H", 546, 677], ["A", 682, 832], ["N", 840, 975], ["G", 985, 1125], ["E", 1135, 1245]] }],
  sub: { s: "TEAM BUILDING & LEADERSHIP", size: 42.9, ink: [305, 1067], base: 669, weight: 500 }
};
var LOGO_N = LOGO.candles.length;
function candleStart(i) { return i / (LOGO_N + 3); }          // in candle progress units, left to right
function logoGlyph(ch, size, box) {
  ctx.font = "900 " + size + "px MontLogo"; ctx.letterSpacing = "0px";
  var m = ctx.measureText(ch), L = m.actualBoundingBoxLeft, R = m.actualBoundingBoxRight;
  if (box[1] === null) return box[2] - R;
  if (box[2] === null) return box[1] + L;
  return (box[1] + box[2]) / 2 - (R - L) / 2;
}
// cp: candle progress, tp: lettering progress, sp: subtitle progress (0 hides it)
function drawLogo(tx, ty, sc, cp, tp, sp) {
  ctx.save(); ctx.translate(tx, ty); ctx.scale(sc, sc); ctx.globalAlpha = SA;
  var dk = LOGO.deck;
  if (cp > 0) { ctx.fillStyle = C.ink; ctx.fillRect(dk[0], dk[2] - dk[3] / 2, (dk[1] - dk[0]) * Math.min(1, cp * 1.06), dk[3]); }
  LOGO.candles.forEach(function (cd, i) {
    var k = clamp((cp - candleStart(i)) * (LOGO_N + 3) / 4); if (k <= 0) return;
    var e = eback(k), mid = dk[2], sy = function (y) { return mid + (y - mid) * e; };
    ctx.fillStyle = C.ink;
    ctx.fillRect(cd[0] - LOGO.wick / 2, sy(cd[1]), LOGO.wick, sy(cd[4]) - sy(cd[1]));
    ctx.fillRect(cd[0] - cd[5] / 2, sy(cd[2]), cd[5], sy(cd[3]) - sy(cd[2]));
  });
  LOGO.lines.forEach(function (ln, j) {
    var k = eo5(clamp(j === 0 ? tp : tp * 1.2 - 0.2)); if (k <= 0) return;
    ctx.save(); ctx.beginPath(); ctx.rect(0, ln.base - ln.size * 0.8, 1376, ln.size * 0.84); ctx.clip();
    ctx.fillStyle = ln.dark ? C.ink : C.acc; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ln.g.forEach(function (gl) { var x = logoGlyph(gl[0], ln.size, gl); ctx.font = "900 " + ln.size + "px MontLogo"; ctx.fillText(gl[0], x, ln.base + (1 - k) * ln.size * 0.9); });
    ctx.restore();
  });
  if (sp > 0) {
    var S = LOGO.sub; ctx.font = S.weight + " " + S.size + "px MontLogo"; ctx.letterSpacing = "0px";
    var m = ctx.measureText(S.s), w0 = m.actualBoundingBoxRight + m.actualBoundingBoxLeft, ls = (S.ink[1] - S.ink[0] - w0) / (S.s.length - 1);
    ctx.letterSpacing = ls + "px"; var m2 = ctx.measureText(S.s), inkW = m2.actualBoundingBoxRight + m2.actualBoundingBoxLeft;
    var kx = eo5(clamp(sp)), sx0 = 696.5 - inkW / 2 + m2.actualBoundingBoxLeft;          // centred on the logo's axis
    ctx.save(); ctx.beginPath(); ctx.rect(0, S.base - S.size * 1.05, 1376, S.size * 1.35); ctx.clip();
    ctx.fillStyle = C.ink; ctx.globalAlpha = SA; ctx.fillText(S.s, sx0, S.base + (1 - kx) * S.size * 1.15); ctx.restore(); ctx.letterSpacing = "0px";
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
var LOGO_OPEN = { s: 0.65, tx: 960 - 696.5 * 0.65, ty: 250 };     // opening: the same size as the end logo, no subtitle, Bid. Build. Break. below; the pair sits where the bigger one did
var LOGO_END = { s: 1.0, tx: 960 - 696.5 * 1.0, ty: 96 - 39 * 1.0 };       // closing: with subtitle, dots and info below

/* ================= scenes ================= */
/* big words: each word rises into place on its beat; the whole block wipes upwards as the next idea lands */
function bigLines(lines, t, tIn, tOut, o) {
  if (t < tIn || t >= tOut) return;
  var size = o.size, wt = 900, ls = -size * 0.045, out = eo(seg(t, tOut - 0.17, tOut)), push = 1 + 0.035 * seg(t, tIn, tOut);
  ctx.save(); ctx.translate(960, o.cy); ctx.scale(push, push); ctx.translate(-960, -o.cy);
  lines.forEach(function (ln) {
    var sp = measure(" ", size, wt, ls), w = 0;
    ln.parts.forEach(function (p, k) { w += measure(p[0], size, wt, ls) + (k ? sp : 0); });
    var x = 960 - w / 2;
    ln.parts.forEach(function (p, k) {
      if (k) x += sp;
      var pw = measure(p[0], size, wt, ls), e = eo5(seg(t, p[2], p[2] + 0.26));
      if (e > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(x - 40, ln.y - size * 1.02, pw + 80, size * 1.32); ctx.clip();
        text(p[0], x, ln.y + (1 - e) * size * 1.05 - out * size * 1.15, { size: size, weight: wt, ls: ls, color: p[1] });
        ctx.restore();
      }
      x += pw;
    });
  });
  ctx.restore();
}
// a line of words that share one beat, each a touch after the last
function words(str, color, at, step) { return str.split(" ").map(function (w, k) { return [w, color, at + k * (step || 0.06)]; }); }
function sceneIntro(t) {
  if (t >= T_TITLE) return; SA = 1;
  var size = 160, wt = 900, ls = -size * 0.045, out = eo(seg(t, T_TITLE - 0.22, T_TITLE)), lift = out * size * 1.2;
  var L1 = "See what your team", L2 = "can carry.", y1 = 486, y2 = 668;
  var w1 = measure(L1, size, wt, ls), x1 = 960 - w1 / 2, w2 = measure(L2, size, wt, ls), x2 = 960 - w2 / 2;
  var land = B1(2), drop0 = land - 0.26;
  // after the load lands: a damped bounce, deepest in the middle of the span
  var dt = t - land, bend = dt > 0 ? Math.exp(-dt * 5.2) * Math.sin(dt * 21) * 16 : 0;
  ctx.save(); ctx.beginPath(); ctx.rect(VX0, y1 - size * 1.0, VX1 - VX0, size * 1.36); ctx.clip();
  for (var i = 0; i < L1.length; i++) {
    var ch = L1[i]; if (ch === " ") continue;
    var cx = x1 + measure(L1.substr(0, i), size, wt, ls), cw = measure(ch, size, wt, ls);
    var at = B1(0) + i * 0.03, k = eback(seg(t, at, at + 0.42)); if (k <= 0) continue;
    var u = Math.sin(Math.PI * clamp((cx + cw / 2 - x1) / w1));
    text(ch, cx, y1 + (1 - k) * size * 0.95 + bend * u - lift, { size: size, weight: wt, ls: ls, color: C.ink, alpha: clamp(k * 1.6) });
  }
  ctx.restore();
  // the load: it falls into its line with gravity, then settles with the deck
  var f = seg(t, drop0, land);
  if (f > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(VX0, y2 - size * 1.0, VX1 - VX0, size * 1.36); ctx.clip();
    var fy = t < land ? -(1 - f * f) * size * 1.15 : bend * 0.6;
    text(L2, x2, y2 + fy - lift, { size: size, weight: wt, ls: ls, color: C.acc });
    ctx.restore();
  }
  SA = 1;
}
function sceneTitle(t) {
  if (t < T_TITLE || t >= T_BID) return; SA = 1;
  var L = LOGO_OPEN, cp = seg(t, T_TITLE + 0.12, T_TITLE + 0.12 + CANDLE_D);
  drawLogo(L.tx, L.ty, L.s, cp, seg(t, T_TITLE, T_TITLE + 0.42), 0);
  var yb = L.ty + 592 * L.s + 118;
  ["Bid.", "Build.", "Break."].forEach(function (w, k) {
    var at = B1(8 + k), p = seg(t, at, at + 0.22), sc = lerp(1.5, 1, eo(p));
    ctx.save(); ctx.translate([720, 960, 1200][k], yb); ctx.scale(sc, sc);
    text(w, 0, 0, { size: 68, weight: 800, align: "center", alpha: p, color: k === 2 ? C.acc : C.ink }); ctx.restore();
  });
  SA = 1;
}
var CANDLE_D = 0.8;
var BOARD = { x: 860, y: 292, w: 960, rowH: 70 };
function rowY(i) { return BOARD.y + 90 + i * BOARD.rowH; }
function sceneBid(t) {
  if (t < T_BID || t >= T_BUILD) return; var A = 1; SA = 1;
  header(t, T_BID, T_BUILD, "01 — Bid", null, null);
  // a thousand credits per team, shown as piles of dots: centred and a touch larger first, then slid left for the bank
  CX = colX(t); var CS = colS(t), PVX = 452 + CX, PVY = 600;
  ctx.save(); ctx.translate(PVX, PVY); ctx.scale(CS, CS); ctx.translate(-PVX, -PVY);
  var cu = Math.round(eo(seg(t, FILL0(0), FILL0(4) + FILL_D)) * 1000);
  reveal(fmt(cu), 118 + CX, 430, seg(t, T_BID + 0.02, T_BID + 0.35), { size: 84, weight: 900, ls: -3 });
  reveal("credits per team", 128 + CX + measure("1,000", 84, 900, -3), 428, seg(t, T_BID + 0.15, T_BID + 0.5), { size: 34, weight: 600, color: C.soft, ls: -0.4 });
  drawPiles(t);
  for (var i = 0; i < 5; i++) {
    var cxp = 120 + CX + i * 134 + 59, la = seg(t, T_BID + 0.2, T_BID + 0.5);
    dot(cxp, 680, 15, TEAM[i], la); text("ABCDE"[i], cxp, 687, { size: 17, weight: 800, align: "center", color: "#fff", alpha: la, ls: 0 });
    text(fmt(1000 - spentAt(i, t)), cxp, 732, { size: 30, weight: 800, align: "center", color: TEAM[i], alpha: la, ls: -0.5 });
  }
  ctx.restore();
  // the captions, one at a time, top centre
  [[B1(13), B1(19), "Each team buys from one shared material bank."], [B1(19), B1(27), "Every purchase moves the price for everyone."], [B1(27), T_BUILD, "Expertise is for sale too."]].forEach(function (c) {
    if (t >= c[0] && t < c[1]) caption(c[2], t, c[0]);
  });
  // the material bank, index-2 style
  var bp = eio(seg(t, T_SLIDE, T_SLIDE + 0.5)); if (bp <= 0) { SA = 1; return; }
  var bx = BOARD.x + (1 - bp) * 1100, by = BOARD.y;
  SA = A;
  rect(bx, by, BOARD.w, 90 + ROWS.length * BOARD.rowH + 24, C.panel, null, 0, 1, 20);
  text("MATERIAL BANK", bx + 30, by + 54, { size: 20, weight: 700, color: C.onPs, ls: 2.8 });
  var pulse = 0.4 + 0.6 * Math.abs(Math.sin(t * 5));
  dot(bx + BOARD.w - 222, by + 47, 7, C.acc, pulse); text("LIVE MARKET", bx + BOARD.w - 30, by + 54, { size: 20, weight: 700, color: "#fff", align: "right", ls: 2.8 });
  ROWS.forEach(function (r, i) {
    var y = rowY(i), ra = seg(t, T_SLIDE + 0.25 + i * 0.04, T_SLIDE + 0.5 + i * 0.04); SA = A * ra;
    var ch = changeAt(i, t), fl = ch ? 1 - seg(t, ch[0], ch[0] + 0.35) : 0, up = ch && ch[1] > ch[2];
    if (fl > 0) rect(bx + 14, y - 4, BOARD.w - 28, BOARD.rowH - 6, up ? "rgba(255,96,0," + (0.22 * fl) + ")" : "rgba(111,224,200," + (0.16 * fl) + ")", null, 0, 1, 10);
    line(bx + 30, y - 6, bx + BOARD.w - 30, y - 6, "rgba(237,243,246,0.10)", 1);
    text(r.n, bx + 30, y + 33, { size: 30, weight: 600, color: "#fff", ls: -0.5 });
    text(r.s.toUpperCase(), bx + 30, y + 58, { size: 14, weight: 700, color: i >= 5 ? "#FFB27A" : C.onPs, ls: 1.8 });
    // price history: a dented polyline drawn live, left to right, with a small bounce on every move
    var sx = bx + 440, sw = 260, rg = RANGE[i], span = Math.max(3, rg[1] - rg[0]), mid = (rg[0] + rg[1]) / 2, H_ = HIST[i];
    var px = function (tt) { return sx + clamp((tt - T_TRADE) / (T_BUILD - 0.3 - T_TRADE)) * sw; };
    var vAt = function (tt) {
      var v = H_[0][1];
      for (var q = 1; q < H_.length; q++) {
        if (H_[q][0] > tt) break;
        var d = H_[q][1] - H_[q - 1][1], u = tt - H_[q][0];
        v = H_[q][1] + (u < 0.12 ? -d * (1 - u / 0.12) : d * 0.3 * Math.exp(-(u - 0.12) / 0.25) * Math.cos((u - 0.12) * 12));
      }
      return v + 0.1 * (Math.sin(tt * 4.3 + i * 1.7) + 0.6 * Math.sin(tt * 8.9 + i * 4.1)) * clamp((tt - T_TRADE) * 2);
    };
    var py = function (v) { return clamp(y + 33 - (v - mid) / span * 52, y + 5, y + 66); };
    var pts = [];
    for (var tt = T_TRADE; tt < t; tt += 0.1) pts.push([px(tt), py(vAt(tt))]);
    pts.push([px(t), py(vAt(Math.max(T_TRADE, t)))]);
    ctx.globalAlpha = SA * 0.95; var pcol = ch ? (up ? "#FF8A3D" : "#6FE0C8") : "#BFD0D8"; ctx.strokeStyle = pcol; ctx.lineWidth = 2.7; ctx.lineJoin = "miter"; ctx.lineCap = "butt"; ctx.beginPath();
    pts.forEach(function (q, k) { if (k === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]); });
    ctx.stroke(); ctx.globalAlpha = 1;
    var lx = pts[pts.length - 1][0], ly = pts[pts.length - 1][1];
    if (t > T_TRADE) dot(lx, ly, 4.2, pcol);
    var price = LADDER[rungAt(i, t)], sc = 1 + 0.25 * fl;
    ctx.save(); ctx.translate(bx + BOARD.w - 150, y + 45); ctx.scale(sc, sc);
    text(String(price), 0, 0, { size: 40, weight: 800, color: fl > 0 ? mix("#FFFFFF", up ? "#FF8A3D" : "#6FE0C8", fl) : "#fff", align: "right", ls: -0.5 }); ctx.restore();
    if (ch) { var pct = Math.round((LADDER[ch[1]] - LADDER[ch[2]]) / LADDER[ch[2]] * 100); text((pct > 0 ? "▲ +" : "▼ ") + pct + "%", bx + BOARD.w - 28, y + 42, { size: 20, weight: 700, color: pct > 0 ? "#FF8A3D" : "#6FE0C8", align: "right", ls: 0 }); }
  });
  SA = A;
  // purchases: each credit spent flies as a dot from the team into the bank
  BUYS.forEach(function (b) {
    var t0 = b.t - 0.62; if (t < t0 || t > b.t + 0.05) return;
    var left0 = dotsLeft(b.team, t0 - 0.001), nd = Math.min(Math.round(b.price / 4), 40);
    var tx = bx + 26, ty = rowY(b.row) + 36;
    for (var j = 0; j < nd; j++) {
      var k = clamp((t - t0 - j * 0.008) / 0.55); if (k <= 0 || k >= 1) continue;
      var n = left0 - 1 - j; if (n < 0) continue;
      var sp = pileXY(b.team, n), e = eio(k), x = lerp(sp[0], tx, e), y = lerp(sp[1], ty, e) - Math.sin(Math.PI * e) * (90 + (j % 7) * 14);
      dot(x, y, 4.2 * (1 - 0.3 * e), TEAM[b.team]);
    }
  });
  SA = 1;
}

/* ---------- the build: dots draw five bridge typologies ---------- */
var DECK = 760;
function polyPts(polys, N) {
  var segs = [], total = 0;
  polys.forEach(function (p) { for (var i = 0; i < p.length - 1; i++) { var L = Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]); segs.push([p[i], p[i + 1], L]); total += L; } });
  var out = [];
  for (var n = 0; n < N; n++) {
    var d = (n + 0.5) / N * total, acc = 0;
    for (var s = 0; s < segs.length; s++) { if (acc + segs[s][2] >= d) { var k = (d - acc) / segs[s][2]; out.push([lerp(segs[s][0][0], segs[s][1][0], k), lerp(segs[s][0][1], segs[s][1][1], k)]); break; } acc += segs[s][2]; }
  }
  while (out.length < N) out.push(out[out.length - 1]);
  return out;
}
function curve(f, x0, x1, n) { var p = []; for (var i = 0; i <= n; i++) { var x = lerp(x0, x1, i / n); p.push([x, f(x)]); } return p; }
var X0 = 560, X1 = 1360, MIDX = 960;
var NPTS = 210;
var SHAPES = (function () {
  var beam = [[[X0 - 20, DECK], [X1 + 20, DECK]], [[X0 - 20, DECK - 46], [X1 + 20, DECK - 46]], [[X0 - 20, DECK], [X0 - 20, DECK - 46]], [[X1 + 20, DECK], [X1 + 20, DECK - 46]]];
  for (var i = 1; i < 10; i++) beam.push([[lerp(X0, X1, i / 10), DECK], [lerp(X0, X1, i / 10), DECK - 46]]);
  var truss = [[[X0 - 20, DECK], [X1 + 20, DECK]]], NP = 6, D = 120;
  for (var j = 0; j < NP; j++) { var a = lerp(X0, X1, j / NP), b = lerp(X0, X1, (j + 1) / NP), m = (a + b) / 2; truss.push([[a, DECK], [m, DECK - D], [b, DECK]]); if (j < NP - 1) truss.push([[m, DECK - D], [m + (X1 - X0) / NP, DECK - D]]); }
  var cable = function (x) { var u = (x - MIDX) / (MIDX - X0); return DECK - 40 - 200 * (1 - (1 - u * u)) - 0; };
  var susp = [[[X0 - 60, DECK], [X1 + 60, DECK]], [[X0, DECK + 10], [X0, DECK - 250]], [[X1, DECK + 10], [X1, DECK - 250]], curve(function (x) { var u = (x - MIDX) / (MIDX - X0); return DECK - 30 - 220 * u * u; }, X0, X1, 40), [[X0, DECK - 250], [X0 - 200, DECK + 20]], [[X1, DECK - 250], [X1 + 200, DECK + 20]]];
  for (var h = 1; h < 12; h++) { var x = lerp(X0, X1, h / 12), u = (x - MIDX) / (MIDX - X0); susp.push([[x, DECK], [x, DECK - 30 - 220 * u * u]]); }
  var archY = function (x) { var u = (x - MIDX) / (MIDX - X0); return DECK + 170 - 150 * (1 - u * u); };
  var arch = [[[X0 - 20, DECK], [X1 + 20, DECK]], curve(archY, X0, X1, 40)];
  for (var s = 1; s < 10; s++) { var xs = lerp(X0, X1, s / 10); arch.push([[xs, archY(xs)], [xs, DECK]]); }
  var invY = function (x) { var u = (x - MIDX) / (MIDX - X0); return DECK + 150 * (1 - u * u); };
  var inv = [[[X0 - 20, DECK], [X1 + 20, DECK]], curve(invY, X0, X1, 40)];
  for (var v = 1; v < 10; v++) { var xv = lerp(X0, X1, v / 10); inv.push([[xv, DECK], [xv, invY(xv)]]); }
  return [beam, truss, susp, arch, inv].map(function (p) { return polyPts(p, NPTS); });
})();
var TYPO = ["Beam", "Truss", "Suspension", "Arch", "Inverted arch"];
var SCAT = (function () { var r = rng(77), a = []; for (var i = 0; i < NPTS; i++) a.push([r() * 700 - 120, 300 + r() * 600, r()]); return a; })();
// shape sequence on the beat: A beam, B truss, C suspension, D arch, E inverted arch, then back to B's truss
var SEQ = [[B1(37), 0], [B1(39), 1], [B1(41), 2], [B1(43), 3], [B1(45), 4], [B1(47), 1]];
function shapeAt(t) {
  var cur = SEQ[0], prev = null;
  for (var i = 0; i < SEQ.length; i++) if (t >= SEQ[i][0] - 0.3) { prev = i > 0 ? SEQ[i - 1] : null; cur = SEQ[i]; }
  return { cur: cur, prev: prev };
}
function buildDots(t, alpha) {
  var st = shapeAt(t), k = seg(t, st.cur[0] - 0.3, st.cur[0] + 0.25);
  var from = st.prev ? SHAPES[st.prev[1]] : null, to = SHAPES[st.cur[1]];
  var team = st.cur[1], colFrom = st.prev ? TEAM[st.prev[1]] : TEAM[0];
  for (var i = 0; i < NPTS; i++) {
    var kk = eio(clamp(k * 1.5 - (i % 37) / 37 * 0.5));
    var x0, y0;
    if (from) { x0 = from[i][0]; y0 = from[i][1]; } else { var sk = eio(clamp(seg(t, T_BUILD, B1(37) + 0.2) * 1.4 - SCAT[i][2] * 0.4)); x0 = lerp(SCAT[i][0], to[i][0], clamp(sk)); y0 = lerp(SCAT[i][1], to[i][1], clamp(sk)); kk = 0; }
    var x = lerp(x0, to[i][0], kk), y = lerp(y0, to[i][1], kk) - Math.sin(Math.PI * kk) * 26 * ((i % 5) - 2) / 2;
    dot(x, y, 5.2, kk > 0.5 || !from ? TEAM[team] : colFrom, alpha);
  }
}
function sceneBuild(t) {
  if (t < T_BUILD || t > T_BREAK + 0.35) return; var A = 1; SA = 1;
  header(t, T_BUILD, T_BREAK, "02 — Build", "Every team designs its own bridge.", null);
  abutments(t, 1, seg(t, T_BUILD, T_BUILD + 0.45));
  var fade = 1 - seg(t, T_BREAK, T_BREAK + 0.35);
  buildDots(t, fade);
  // the label of the current typology
  var st = shapeAt(t), li = st.cur[1], la = seg(t, st.cur[0] - 0.05, st.cur[0] + 0.25) * (t < T_BREAK ? 1 : 0);
  if (t > B1(37) - 0.3) {
    var who = SEQ.indexOf(st.cur) === 5 ? "Team B" : "Team " + "ABCDE"[li];
    reveal(who.toUpperCase(), 960, 404, la, { size: 26, weight: 800, align: "center", color: TEAM[li], ls: 4 });
    reveal(TYPO[li], 960, 484, la, { size: 76, weight: 800, align: "center", color: C.ink, ls: -2 });
  }
  SA = 1;
}

/* ---------- the break (from final-2) ---------- */
var NP = 6, DEPTH = 120;
function nodes() { var b = [], tp = []; for (var i = 0; i <= NP; i++) b.push([lerp(X0, X1, i / NP), DECK]); for (var j = 0; j < NP; j++) tp.push([lerp(X0, X1, (j + 0.5) / NP), DECK - DEPTH]); return { b: b, t: tp }; }
var MEM = (function () { var m = []; for (var i = 0; i < NP; i++) m.push(["b", i, "b", i + 1, 0]); for (var j = 0; j < NP; j++) { m.push(["b", j, "t", j, 1]); m.push(["t", j, "b", j + 1, 1]); } for (var k = 0; k < NP - 1; k++) m.push(["t", k, "t", k + 1, 2]); return m; })();
var DEBRIS = (function () { var r = rng(7), d = []; for (var i = 0; i < 70; i++) d.push({ vx: (r() - 0.5) * 1000, vy: -r() * 650 - 100, rot: (r() - 0.5) * 18, len: 10 + r() * 34, dot: r() < 0.5 }); return d; })();
var L_START = B1(50), STEP8 = (B1(51) - B1(50)) / 2;
var HOLD0 = L_START + 22 * STEP8, HOLD1 = HOLD0 + 0.8, OVER = HOLD1 + 0.15;
function loadAt(t) { if (t < L_START) return 0; if (t < HOLD0) return Math.min(22, Math.floor((t - L_START) / STEP8) + 1) * 0.5; if (t < OVER) return 11; return 11.5; }
function sceneBreak(t) {
  if (t < T_BREAK || t >= T_SCORE) return; var A = 1;
  var L = loadAt(t), amp = t < T_SNAP ? Math.max(0, L - 8.5) * 0.7 + (t > OVER ? 1.4 : 0) : 4 * (1 - seg(t, T_SNAP, T_SNAP + 0.22));
  ctx.save(); ctx.translate(Math.sin(t * 83) * amp, Math.cos(t * 71) * amp * 0.6);
  SA = A;
  header(t, T_BREAK, T_SCORE, "03 — Break", null, null);
  abutments(t, 1, 1);
  var N = nodes(), broke = t >= T_SNAP, bk = broke ? seg(t, T_SNAP, T_SNAP + 1.3) : 0, fall = ei(bk);
  var defl = L * 1.8 + Math.pow(Math.max(0, L - 8), 2) * 1.8;
  var dy = function (x) { return defl * Math.sin(Math.PI * clamp((x - X0) / (X1 - X0))); };
  var place = function (p) {
    var x = p[0], y = p[1] + dy(p[0]); if (!broke) return [x, y];
    var left = x < MIDX, px = left ? X0 : X1, ang = (left ? 1 : -1) * fall * 0.85;
    var dx = x - px, dyy = y - DECK, c = Math.cos(ang), s = Math.sin(ang);
    return [px + dx * c - dyy * s, DECK + dx * s + dyy * c + fall * 50];
  };
  var drawIn = seg(t, T_BREAK, T_BREAK + 0.45);
  MEM.forEach(function (m, idx) {
    var a = place(N[m[0]][m[1]]), b = place(N[m[2]][m[3]]);
    var mx = (N[m[0]][m[1]][0] + N[m[2]][m[3]][0]) / 2;
    if (broke && Math.abs(mx - MIDX) < 80) return;
    var u = Math.sin(Math.PI * clamp((mx - X0) / (X1 - X0))), st = clamp(L / 11.5 * (0.45 + 0.55 * u));
    var col = st < 0.6 ? mix(TEAM[1], C.acc, st / 0.6) : mix(C.acc, C.red, (st - 0.6) / 0.4);
    var p = eo(clamp(drawIn * 1.6 - idx / MEM.length * 0.6));
    line(a[0], a[1], lerp(a[0], b[0], p), lerp(a[1], b[1], p), col, m[4] === 0 ? 10 : 7);
  });
  N.b.concat(N.t).forEach(function (n) { if (broke && Math.abs(n[0] - MIDX) < 20) return; var q = place(n); dot(q[0], q[1], 5, C.bg); ring(q[0], q[1], 5, C.ink, 2, drawIn); });
  // the bucket, and the sand pouring in as dots
  var bA = seg(t, L_START - 0.6, L_START - 0.1);
  if (bA > 0) {
    var hook = place(N.b[3]), by = hook[1] + 150 + (broke ? 0.5 * 2600 * Math.pow(t - T_SNAP, 2) : 0);
    SA = A * bA;
    if (!broke) line(hook[0], hook[1], hook[0], by - 60, C.soft, 2);
    ctx.globalAlpha = SA; ctx.beginPath(); ctx.moveTo(hook[0] - 56, by - 60); ctx.lineTo(hook[0] + 56, by - 60); ctx.lineTo(hook[0] + 43, by + 30); ctx.lineTo(hook[0] - 43, by + 30); ctx.closePath();
    ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.fillStyle = C.sand; var fk = clamp(L / 12); ctx.fillRect(hook[0] - 60, by + 30 - 90 * fk, 120, 90 * fk); ctx.restore(); ctx.globalAlpha = 1;
    if ((t > L_START && t < HOLD0) || (t > HOLD1 && t < T_SNAP)) for (var g = 0; g < 90; g++) {
      var ph = (t * 1.7 + g * 0.61803) % 1, u = Math.sin(g * 12.9898) * 43758.5453 % 1, w = lerp(96, 34, Math.pow(ph, 0.8));
      dot(hook[0] + u * w + Math.sin(t * 9 + g) * 2, by - 400 + ph * 345, 2.4 + (g % 3) * 0.7, C.sand, 0.92 * clamp(ph * 6));
    }
    SA = A;
  }
  if (broke) {
    var dt = t - T_SNAP;
    DEBRIS.forEach(function (d) {
      var x = MIDX + d.vx * dt, y = DECK + d.vy * dt + 0.5 * 2600 * dt * dt; if (y > VY1 + 50) return;
      var a2 = 1 - seg(t, T_SNAP + 1.0, T_SNAP + 1.8);
      if (d.dot) dot(x, y, 4, C.red, a2); else { ctx.save(); ctx.translate(x, y); ctx.rotate(d.rot * dt); line(-d.len / 2, 0, d.len / 2, 0, C.red, 5, a2); ctx.restore(); }
    });
  }
  ctx.restore();
  // the load gauge
  SA = A * seg(t, L_START - 0.4, L_START);
  var gx = 1460, gy = 230, lc = L >= 11.5 ? C.red : L >= 9 ? C.acc : C.ink;
  text("LOAD", gx, gy, { size: 20, weight: 700, color: C.soft, ls: 2.5 });
  text(L.toFixed(1), gx - 6, gy + 112, { size: 124, weight: 800, color: lc, ls: -4.5 });
  text("kg", gx + measure(L.toFixed(1), 124, 800, -4.5) + 5, gy + 112, { size: 36, weight: 600, color: C.soft, ls: 0 });
  for (var k = 0; k < 24; k++) dot(gx + 5 + k * 15, gy + 148, 4.8, k < L * 2 ? lc : "rgba(27,29,31,0.14)");
  if (t > HOLD0 && t < T_SNAP) {
    var hp = seg(t, HOLD0, HOLD1), ha = 1 - seg(t, T_SNAP - 0.2, T_SNAP);
    ring(gx + 24, gy + 208, 24, TEAM[1], 5, ha, -Math.PI / 2, -Math.PI / 2 + 6.2832 * hp);
    text(hp < 1 ? String(Math.max(0, 10 - Math.floor(hp * 10.99))) : "✓", gx + 24, gy + 217, { size: 26, weight: 800, align: "center", color: TEAM[1], alpha: ha, ls: 0 });
    text(hp < 1 ? "HOLD 10 s" : "HELD 11.0 kg", gx + 64, gy + 216, { size: 24, weight: 800, color: TEAM[1], alpha: ha, ls: 1.5 });
  }
  SA = A;
  if (t >= T_SNAP) {
    var f = 1 - seg(t, T_SNAP, T_SNAP + 0.28);
    ctx.fillStyle = "rgba(255,255,255," + (0.9 * f * A) + ")"; ctx.fillRect(VX0, VY0, VX1 - VX0, VY1 - VY0);
    ctx.fillStyle = "rgba(215,38,61," + (0.18 * f * A) + ")"; ctx.fillRect(VX0, VY0, VX1 - VX0, VY1 - VY0);
    var sp = seg(t, T_SNAP + 0.08, T_SNAP + 0.4), sc = lerp(1.5, 1, eback(sp));
    ctx.save(); ctx.translate(960, 548); ctx.scale(sc, sc);
    text("BREAKING POINT", 0, 0, { size: 156, weight: 900, align: "center", color: C.red, alpha: sp, ls: -6 }); ctx.restore();
  }
  SA = 1;
}

/* ---------- the score: the formula full screen, then the cursors move the board, never settling on a winner ---------- */
var BASE = [[1.0, 12, 150], [0.8, 11, 620], [0.5, 4, 850], [0.9, 9, 280], [1.1, 8, 0]];
var score = function (p) { return p[0] * p[1] * (1 + p[2] / 1000); };
var T_FREEZE = B2(19), EIGHTH2 = (B2(1) - B2(0)) / 2;
var T_MORPH = B2(6), F_MOVE = B2(10), P_IN = B2(11);
var LIST = [["Span", "Distance"], ["Load", "Held"], ["Unspent Budget", "Bonus"]];
var LIST_T = [B2(0) + 0.03, B2(2) + 0.03, B2(4) + 0.03];
var FTOK = [["Span", 0], [" × ", 1], ["Load", 0], [" × ", 1], ["(1 + ", 1], ["Unspent", 0], [" ÷ ", 1], ["Budget", 0], [")", 1]];
var OPS = [1, 3, 4, 6, 8], OPS_T = OPS.map(function (k, j) { return T_MORPH + 0.42 + j * 0.07; });
var FTIMES = LIST_T.concat(OPS_T);
function params(i, t) {
  // each team's cursors drift as if exploring strategies
  var k = seg(t, P_IN + 0.3, T_FREEZE), ph = i * 1.7;
  var s = clamp(BASE[i][0] + k * 0.22 * Math.sin(t * 1.9 + ph), 0.5, 1.1);
  var l = clamp(BASE[i][1] + k * 3.2 * Math.sin(t * 1.4 + ph * 1.3) + k * (i === 2 ? 4 : 0), 2, 20);
  var u = clamp(BASE[i][2] + k * 260 * Math.sin(t * 1.15 + ph * 0.7), 0, 900);
  var p = [s, l, u];
  // at the freeze the two leaders are dead level
  var fz = eio(seg(t, T_FREEZE - 0.7, T_FREEZE));
  if (fz > 0 && (i === 0 || i === 1)) { var target = i === 0 ? [1.0, 11.7, 300] : [0.9, 12.0, 408.3]; p = p.map(function (v, j) { return lerp(v, target[j], fz); }); }
  return p;
}
function formula(t) {
  var BIG = 136, SMALL = 60, WT = 800, LS = -4.5, sp = measure(" ", BIG, WT, LS);
  // 1. the list: big black term, small grey meaning
  var rowW = LIST.map(function (r) { return measure(r[0], BIG, WT, LS) + 30 + measure(r[1], 46, 600, -0.6); });
  var lx0 = 960 - Math.max.apply(null, rowW) / 2, ly = [420, 580, 740];
  var src = { 0: [lx0, ly[0]], 2: [lx0, ly[1]], 5: [lx0, ly[2]], 7: [lx0 + measure("Unspent", BIG, WT, LS) + sp, ly[2]] };
  var gone = seg(t, T_MORPH, T_MORPH + 0.18);
  LIST.forEach(function (r, i) {
    if (t < LIST_T[i] || gone >= 1) return;
    var gx = lx0 + measure(r[0], BIG, WT, LS) + 30;
    if (t < T_MORPH) { var p = seg(t, LIST_T[i], LIST_T[i] + 0.3); reveal(r[0], lx0, ly[i], p, { size: BIG, weight: WT, ls: LS }); }
    reveal(r[1], gx, ly[i], seg(t, LIST_T[i] + 0.12, LIST_T[i] + 0.42), { size: 46, weight: 600, color: C.soft, ls: -0.6, alpha: 1 - gone });
  });
  if (t < T_MORPH) return;
  // 2. the big words slide into the formula, the orange operators drop in between them
  var wB = FTOK.map(function (x) { return measure(x[0], BIG, WT, LS); }), wS = FTOK.map(function (x) { return measure(x[0], SMALL, WT, -1.7); });
  var l1 = wB[0] + wB[1] + wB[2] - sp, l2 = 0, k; for (k = 3; k < FTOK.length; k++) l2 += wB[k]; l2 -= sp;
  var bx = [], by = [], x = 960 - l1 / 2;
  for (k = 0; k < 3; k++) { bx.push(x); by.push(520); x += wB[k]; }
  x = 960 - l2 / 2 - sp;
  for (k = 3; k < FTOK.length; k++) { bx.push(x); by.push(680); x += wB[k]; }
  var mv = eio(seg(t, F_MOVE, F_MOVE + 0.5));
  x = 114;
  for (k = 0; k < FTOK.length; k++) {
    var size = lerp(BIG, SMALL, mv), col = FTOK[k][1] ? C.acc : C.ink, fx, fy;
    if (FTOK[k][1]) {
      var oj = OPS.indexOf(k), po = seg(t, OPS_T[oj], OPS_T[oj] + 0.2);
      if (po > 0) {
        fx = lerp(bx[k], x, mv); fy = lerp(by[k], 298, mv);
        if (mv > 0) text(FTOK[k][0], fx, fy, { size: size, weight: WT, ls: lerp(LS, -1.7, mv), color: col });
        else { var sc = lerp(1.5, 1, eo(po)); ctx.save(); ctx.translate(fx + wB[k] / 2, fy); ctx.scale(sc, sc); text(FTOK[k][0], -wB[k] / 2, 0, { size: size, weight: WT, ls: LS, color: col, alpha: clamp(po * 2) }); ctx.restore(); }
      }
    } else {
      var j = [0, 2, 5, 7].indexOf(k), m = eio(seg(t, T_MORPH + j * 0.05, T_MORPH + 0.55 + j * 0.05));
      fx = lerp(lerp(src[k][0], bx[k], m), x, mv); fy = lerp(lerp(src[k][1], by[k], m), 298, mv);
      text(FTOK[k][0], fx, fy, { size: size, weight: WT, ls: lerp(LS, -1.7, mv), color: col });
    }
    x += wS[k];
  }
}
function sceneScore(t) {
  if (t < T_SCORE || t >= T_REVEAL) return; var A = 1; SA = 1;
  header(t, T_SCORE, T_REVEAL, "04 — The Legend Score", null, null);
  formula(t);
  var pp = eo(seg(t, P_IN - 0.1, P_IN + 0.4)); if (pp <= 0) { SA = 1; return; }
  // calculator panel
  var cx = 120 - (1 - pp) * 260, cy = 380;
  SA = A * pp;
  rect(cx, cy, 760, 520, C.panel, null, 0, 1, 20);
  text("Legend Score", cx + 36, cy + 66, { size: 38, weight: 700, color: "#fff", ls: -0.9 });
  text("Strategy cursors", cx + 36, cy + 106, { size: 25, weight: 600, color: "#FF8A3D", ls: -0.2 });
  var sel = Math.floor(Math.max(0, t - P_IN) / ((B2(2) - B2(0)))) % 5;
  var P = params(sel, t), labels = [["Span", P[0].toFixed(1) + " m", (P[0] - 0.5) / 0.6], ["Load held", P[1].toFixed(1) + " kg", (P[1] - 2) / 18], ["Unspent", fmt(P[2]), P[2] / 900]];
  dot(cx + 52, cy + 160, 14, TEAM[sel]); text("ABCDE"[sel], cx + 52, cy + 167, { size: 15, weight: 800, align: "center", color: "#fff", ls: 0 });
  text(TNAME[sel], cx + 78, cy + 169, { size: 26, weight: 700, color: "#fff", ls: -0.3 });
  labels.forEach(function (lb, j) {
    var y = cy + 240 + j * 70;
    text(lb[0], cx + 36, y, { size: 26, weight: 600, color: C.onP, ls: 0 });
    rect(cx + 210, y - 10, 380, 6, "rgba(237,243,246,0.18)", null, 0, 1, 3);
    rect(cx + 210, y - 10, 380 * clamp(lb[2]), 6, C.acc, null, 0, 1, 3);
    dot(cx + 210 + 380 * clamp(lb[2]), y - 7, 12, C.acc); dot(cx + 210 + 380 * clamp(lb[2]), y - 7, 5, "#fff");
    text(lb[1], cx + 724, y, { size: 28, weight: 800, color: "#fff", align: "right", ls: 0 });
  });
  var fz = seg(t, T_FREEZE, T_FREEZE + 0.2);
  text("Score", cx + 36, cy + 470, { size: 26, weight: 600, color: C.onPs, ls: 0 });
  text(fz > 0.5 && (sel === 0 || sel === 1) ? "?" : score(P).toFixed(1), cx + 724, cy + 486, { size: 72, weight: 800, color: "#fff", align: "right", ls: -2 });
  // leaderboard panel
  var lx = 940 + (1 - pp) * 260, ly = 380;
  rect(lx, ly, 860, 520, C.panel, null, 0, 1, 20);
  text("Leaderboard", lx + 36, ly + 66, { size: 38, weight: 700, color: "#fff", ls: -0.9 });
  var rankAt = function (tt, i) { var v = [0, 1, 2, 3, 4].map(function (j) { return score(params(j, tt)); }), r = 0; v.forEach(function (x, j) { if (j !== i && (x > v[i] + 1e-6 || (Math.abs(x - v[i]) < 1e-6 && j < i))) r++; }); return r; };
  var soft = function (i) { var s = 0, w = 0; for (var q = 0; q < 10; q++) { var ww = 1 - 0.9 * q / 9; s += rankAt(t - 0.25 * q / 9, i) * ww; w += ww; } return s / w; };
  for (var i = 0; i < 5; i++) {
    var rk = soft(i), y = ly + 98 + rk * 82, sc = score(params(i, t)), hidden = fz > 0 && (i === 0 || i === 1);
    var top = fz > 0 ? (i === 0 || i === 1) : rk < 0.5;
    rect(lx + 22, y, 816, 74, top ? "rgba(255,96,0,0.14)" : null, null, 0, 1, 12);
    text(hidden ? "?" : String(Math.round(rk) + 1), lx + 50, y + 47, { size: 27, weight: 800, color: top ? "#FF8A3D" : "#fff", align: "center", ls: 0 });
    dot(lx + 100, y + 37, 14, TEAM[i]); text("ABCDE"[i], lx + 100, y + 43, { size: 14, weight: 800, align: "center", color: "#fff", ls: 0 });
    var p = params(i, t);
    text(TNAME[i], lx + 128, y + 31, { size: 26, weight: 700, color: "#fff", ls: -0.3 });
    text(p[0].toFixed(1) + " m × " + p[1].toFixed(1) + " kg · " + fmt(p[2]), lx + 128, y + 62, { size: 24, weight: 600, color: C.onP, ls: 0 });
    var bw = 220 * clamp(sc / 22);
    rect(lx + 500, y + 30, 220, 14, "rgba(237,243,246,0.18)", null, 0, 1, 7);
    rect(lx + 500, y + 30, bw, 14, i === 4 ? "#6E8CC0" : TEAM[i], null, 0, 1, 7);
    text(hidden ? "?" : sc.toFixed(1), lx + 812, y + 47, { size: 28, weight: 800, color: "#fff", align: "right", ls: 0 });
  }
  SA = A;
  SA = 1;
}

/* ---------- 05, team learnings: "Who" stays put; only the words that change roll, like a slot reel, at a steady pace;
   the group's name sits small above the line ---------- */
var LEARN = [["Resource allocation", "controls", "the budget?"],
             ["Resource allocation", "buy", "expertise?"],
             ["Resource allocation", "build", "expertise?"],
             ["Behaviour under pressure", "panics", "when prices jump?"],
             ["Behaviour under pressure", "spots", "the cheap route?"],
             ["Collaboration", "trades", "with others?"],
             ["Collaboration", "corners", "the market?"]];
var LEARN_AT = [24, 27, 30, 33, 36, 39, 42].map(B2);   // a steady 3 beats each; the last line holds until the photos come in at 0:54.8
var WORD_D = 0.36, WORD_STAG = 0.05;                          // each word rolls quickly, one after the other, left to right
function eroll(x) { var c1 = 1.2, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }   // the index-17 clunk, a touch softer
// word by word: a word that stays only slides sideways to make room; a word that changes rolls up and out as the new one rolls up into place
function rollWords(A, B, x, yb, o, step, t, t0) {
  var sp = measure(" ", o.size, o.weight, o.ls);
  function xs(W) { var r = [], cx = x; (W || []).forEach(function (w) { r.push(cx); cx += measure(w.s, o.size, o.weight, o.ls) + sp; }); return r; }
  var xa = xs(A), xb = xs(B), n = Math.max(A ? A.length : 0, B.length);
  for (var i = 0; i < n; i++) {
    var a = A && A[i], b = B[i], k = seg(t, t0 + i * WORD_STAG, t0 + i * WORD_STAG + WORD_D), kr = eroll(k);
    if (a && b && a.s === b.s && a.c === b.c) { text(b.s, lerp(xa[i], xb[i], eo(k)), yb, Object.assign({}, o, { color: b.c })); continue; }
    if (a) text(a.s, xa[i], yb - kr * step, Object.assign({}, o, { color: a.c, alpha: o.alpha * (1 - 0.35 * Math.min(1, kr)) }));
    if (b) text(b.s, xb[i], yb + (1 - kr) * step, Object.assign({}, o, { color: b.c, alpha: o.alpha * (1 - 0.35 * Math.min(1, Math.abs(1 - kr))) }));
  }
}
function lineWords(q) { return [{ s: q[1], c: C.acc }].concat(q[2].split(" ").map(function (w) { return { s: w, c: C.ink }; })); }
function titleWords(q) { return q[0].split(" ").map(function (w) { return { s: w, c: C.ink }; }); }
function sceneLearn(t) {
  if (t < T_REVEAL || t >= T_END + 0.15) return; SA = 1;
  var size = 92, wt = 900, ls = -size * 0.04, sp = measure(" ", size, wt, ls), lh = size * 1.18;
  var wWho = measure("Who", size, wt, ls), wMax = 0;
  LEARN.forEach(function (q) { wMax = Math.max(wMax, measure(q[1] + " " + q[2], size, wt, ls)); });
  var x0 = 960 - (wWho + sp + wMax) / 2, xs = x0 + wWho + sp, y = DECK_Y === null ? 604 : clamp(DECK_Y, 420, 760);   // on the model's bridge deck
  var inA = eo5(seg(t, T_REVEAL, T_REVEAL + 0.5)), out = 0, fade = 1 - seg(t, T_END, T_END + 0.12);   // no exit roll: it goes as the photos arrive
  var cur = 0; LEARN_AT.forEach(function (at, i) { if (t >= at) cur = i; });
  var prev = cur > 0 ? LEARN[cur - 1] : null, now = LEARN[cur], t0 = LEARN_AT[cur];
  var L = { size: size, weight: wt, ls: ls, alpha: fade }, yl = y - out * size * 1.15;
  ctx.save(); ctx.beginPath(); ctx.rect(VX0, y - size * 0.98, VX1 - VX0, size * 1.34); ctx.clip();
  text("Who", x0, yl + (1 - inA) * size * 1.05, Object.assign({}, L, { color: C.ink }));
  rollWords(prev && lineWords(prev), lineWords(now), xs, yl, L, lh, t, t0);
  ctx.restore();
  // the group's name, small, above the line; its words roll only when the group changes
  var ts = 30, ty = y - size - 24;
  ctx.save(); ctx.beginPath(); ctx.rect(VX0, ty - ts * 1.05, VX1 - VX0, ts * 1.45); ctx.clip();
  rollWords(prev && titleWords(prev), titleWords(now), x0 + 4, ty - out * ts * 1.4, { size: ts, weight: 700, ls: -0.3, alpha: fade }, ts * 1.3, t, t0);
  ctx.restore();
  SA = 1;
}

/* ---------- the end photos, 0:54.8 to 1:00: four photos at full strength, each fading into the next ---------- */
var T_LEN = 60;   // the film's length on the clock; the logo and details come after it
var T_CAR = T_END, CAR = { w: 1520, h: 850, cy: 548 }, CAR_IMG = [];
var BEAT = (B2(47) - B2(45)) / 2, CAR_STEP = 2 * BEAT, CAR_AT = [0, 1, 2, 3].map(function (i) { return T_END + i * CAR_STEP; }), CAR_X = 0.25;
var T_OUTRO = T_END + 4 * CAR_STEP;   // 0:58.7, two beats after the fourth photo: the logo and the details take over
function photo(im, a, t, t0) {
  if (!(im && im.complete && im.naturalWidth) || a <= 0) return;
  var w = CAR.w, h = CAR.h, x = 960 - w / 2, y = CAR.cy - h / 2, kb = 1 + 0.05 * seg(t, t0, t0 + CAR_STEP + CAR_X);
  var iw = im.naturalWidth / kb, ih = im.naturalHeight / kb;
  ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.roundRect(x, y, w, h, 22); ctx.clip();
  ctx.drawImage(im, (im.naturalWidth - iw) / 2, (im.naturalHeight - ih) / 2, iw, ih, x, y, w, h); ctx.restore();
}
function sceneCarousel(t) {
  if (t < T_CAR) return;
  var ga = seg(t, T_END, T_END + 0.2) * (1 - seg(t, T_OUTRO, T_OUTRO + 0.3));
  if (ga <= 0) return;
  var cur = 0; CAR_AT.forEach(function (at, i) { if (t >= at) cur = i; });
  var k = seg(t, CAR_AT[cur], CAR_AT[cur] + CAR_X);
  if (cur > 0 && k < 1) photo(CAR_IMG[cur - 1], ga, t, CAR_AT[cur - 1]);
  photo(CAR_IMG[cur], ga * (cur > 0 ? k : 1), t, CAR_AT[cur]);
}

/* ---------- end card: the logo at the cut, then subtitle, dots, line and info on the violins' beats ---------- */
var END_T = window.BEATS.endT;   // 0:56, 0:57, 0:58 (the G minor landing), 0:59
// the closing logo at half size, centred, with the details under it; it stays when the photos go
var LOGO_SMALL = { s: 0.65, tx: 960 - 696.5 * 0.65, ty: 236 - 39 * 0.65 };
function sceneEnd(t) {
  var T0 = T_OUTRO + 0.1;   // right after the fourth photo; the clock still stops at 1:00
  if (t < T0) return; SA = 1;
  var L = LOGO_SMALL; drawLogo(L.tx, L.ty, L.s, seg(t, T0 + 0.1, T0 + 0.1 + CANDLE_D), seg(t, T0, T0 + 0.42), seg(t, T0 + 0.5, T0 + 0.9));
  var y0 = L.ty + 669 * L.s;
  for (var k = 0; k < 5; k++) dot(960 + (k - 2) * 34, y0 + 48, 8.5 * eback(seg(t, T0 + 0.9 + k * 0.06, T0 + 1.2 + k * 0.06)), TEAM[k]);
  var MS = { weight: 500, fam: "MontLogo", align: "center", color: C.ink, ls: 0 };          // the subtitle's Montserrat and ink
  {
    reveal("A half-day team challenge, designed by architects.", 960, y0 + 120, seg(t, T0 + 1.2, T0 + 1.6), Object.assign({ size: 30 }, MS));
    reveal("6 to 50 participants  ·  Your venue or off-site", 960, y0 + 166, seg(t, T0 + 1.5, T0 + 1.9), Object.assign({ size: 25 }, MS));
    reveal("From HK$730 per person", 960, y0 + 206, seg(t, T0 + 1.62, T0 + 2.02), Object.assign({ size: 25 }, MS));
  }
  SA = 1;
}

/* ---------- frame ---------- */
// the area every scene needs, in the film's 1920 x 1080 space; it is scaled to fill the canvas, and full-bleed layers run to the canvas edges
var BAND = { x0: 100, x1: 1820, y0: 112, y1: 985 }, VX0 = 0, VX1 = W, VY0 = 0, VY1 = H, FS = 1;
var DECK_F = null, DECK_Y = null;   // the bridge deck of the model behind the film: a share of the canvas height (from the page), and in film units
function render(t) {
  if (!ctx) return;
  t = clamp(t, 0, DUR);
  var cw = cv.width, ch = cv.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, cw, ch);
  var s = Math.min(cw / (BAND.x1 - BAND.x0), ch / (BAND.y1 - BAND.y0));
  var ox = cw / 2 - s * (BAND.x0 + BAND.x1) / 2, oy = ch / 2 - s * (BAND.y0 + BAND.y1) / 2;
  ctx.setTransform(s, 0, 0, s, ox, oy); FS = s;
  VX0 = -ox / s; VX1 = (cw - ox) / s; VY0 = -oy / s; VY1 = (ch - oy) / s;
  DECK_Y = DECK_F === null || !isFinite(DECK_F) ? null : (DECK_F * ch - oy) / s;
  sceneIntro(t); sceneTitle(t); sceneBid(t); sceneBuild(t); sceneBreak(t); sceneScore(t); sceneLearn(t); sceneCarousel(t); sceneEnd(t);
}
var ready = document.fonts && document.fonts.load ? Promise.all([document.fonts.load("900 100px Inter"), document.fonts.load("700 40px Inter"), document.fonts.load("900 100px MontLogo"), document.fonts.load("500 40px MontLogo")]).catch(function () {}) : Promise.resolve();
window.LBLFilm = {
  DUR: DUR,
  LEN: T_LEN,   // what the clock shows; the end card plays after it
  CH: [T_BID, T_BUILD, T_BREAK, T_SCORE, T_REVEAL, T_END],   // the five steps, and where the carousel and the logo take over
  init: function (canvas, imgs) {
    cv = canvas; ctx = cv.getContext("2d");
    CAR_IMG = (imgs || []).map(function (src) { var im = new Image(); im.decoding = "async"; im.src = src; return im; });
    return ready;
  },
  render: render,
  deck: function (f) { DECK_F = f; }
};
})();
