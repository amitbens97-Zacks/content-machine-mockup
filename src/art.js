// The creatives: a post image, carousel slides, a reel frame and the flyer, drawn in the
// chosen template (skills pack, page 18). Everything is laid out on the real canvas size
// (1080 wide) and scaled down to fit, so the preview is the file that gets exported.
// Rules from the pack: the colors come from the logo with a 4.5:1 contrast check, full
// Hebrew, the owner's photo, margins kept, the top corner left free for Instagram's
// "1/6" counter, and no FlowBiz mark on the user's content.
import { html, useState, useEffect, useRef, cx } from './lib.js';
import { USER, BRAND, OFFER, PAGE_LINK } from './data.js';

// ---------- colors ----------
const lum = (hex) => {
  const v = hex.replace('#', '').match(/.{2}/g).map((x) => parseInt(x, 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
export const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
// The palette of a template: the logo's colors by default, the template's own on request.
// If the text color fails 4.5:1 on the background, it falls back to near-black or white.
export function palette(t, mode, noLogo, swatch = 0) {
  let p;
  if (mode === 'own' || noLogo) p = { ...t.own };
  else p = t.dark ? { bg: BRAND.dark, ink: '#ffffff', a: BRAND.accent, b: BRAND.primary } : { bg: BRAND.light, ink: BRAND.dark, a: BRAND.primary, b: BRAND.accent };
  if (swatch) p = { ...p, a: BRAND.swatches[swatch % BRAND.swatches.length] };
  if (contrast(p.ink, p.bg) < 4.5) p.ink = lum(p.bg) > 0.4 ? '#141414' : '#ffffff';
  p.onA = contrast('#ffffff', p.a) >= 4.5 ? '#ffffff' : contrast('#141414', p.a) >= 4.5 ? '#141414' : (lum(p.a) > 0.4 ? '#141414' : '#ffffff');
  p.dark = lum(p.bg) < 0.2;
  p.ratio = contrast(p.ink, p.bg);
  return p;
}

// ---------- a canvas scaled to its box ----------
export function Canvas({ w = 1080, h = 1350, class: cls = '', children, round = 10 }) {
  const ref = useRef();
  const [s, setS] = useState(0.3);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setS(el.clientWidth / w));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return html`<div ref=${ref} class=${cx('relative w-full overflow-hidden shadow-[0_2px_10px_rgba(45,62,102,.16)]', cls)} style=${{ aspectRatio: `${w} / ${h}`, borderRadius: `${round}px` }}>
    <div dir="rtl" style=${{ position: 'absolute', top: 0, right: 0, width: `${w}px`, height: `${h}px`, transform: `scale(${s})`, transformOrigin: 'top right' }}>${children}</div>
  </div>`;
}

// ---------- the marks of each template ----------
function Decor({ t, p, h = 1350 }) {
  const W = 1080;
  const svg = (inner) => html`<svg width=${W} height=${h} viewBox=${`0 0 ${W} ${h}`} style="position:absolute;inset:0" aria-hidden="true">${inner}</svg>`;
  switch (t.decor) {
    case 'blobs':
      return svg(html`<path d=${`M${W - 40} -40 C ${W + 60} 220, ${W - 260} 360, ${W - 420} 200 S ${W - 520} -60, ${W - 40} -40Z`} fill=${p.a} opacity=".18" />
        <path d=${`M-60 ${h - 300} C 120 ${h - 420}, 380 ${h - 260}, 300 ${h - 80} S -80 ${h + 40}, -60 ${h - 300}Z`} fill=${p.b} opacity=".28" />`);
    case 'grid':
      return svg(html`${Array.from({ length: 12 }, (_, i) => html`<line x1=${i * 96 + 12} y1="0" x2=${i * 96 + 12} y2=${h} stroke=${p.ink} opacity=".05" />`)}
        <rect x="0" y=${h - 18} width=${W} height="18" fill=${p.a} />`);
    case 'diagonal':
      return svg(html`<polygon points=${`0,${h * 0.62} ${W},${h * 0.42} ${W},${h * 0.52} 0,${h * 0.72}`} fill=${p.b} opacity=".9" /><polygon points=${`0,${h * 0.75} ${W},${h * 0.55} ${W},${h * 0.57} 0,${h * 0.77}`} fill=${p.a} />`);
    case 'polaroid':
      return svg(html`<rect x="40" y="40" width=${W - 80} height=${h - 80} fill="none" stroke=${p.a} stroke-width="3" stroke-dasharray="14 12" opacity=".5" /><circle cx=${W - 110} cy="120" r="34" fill=${p.b} opacity=".7" />`);
    case 'frame':
      return svg(html`<rect x="44" y="44" width=${W - 88} height=${h - 88} fill="none" stroke=${p.a} stroke-width="3" /><rect x="60" y="60" width=${W - 120} height=${h - 120} fill="none" stroke=${p.a} stroke-width="1" opacity=".6" />`);
    case 'sun':
      return svg(html`<circle cx="120" cy="140" r="220" fill=${p.a} opacity=".9" />${Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return html`<line x1=${120 + Math.cos(a) * 250} y1=${140 + Math.sin(a) * 250} x2=${120 + Math.cos(a) * 300} y2=${140 + Math.sin(a) * 300} stroke=${p.a} stroke-width="14" stroke-linecap="round" />`;
      })}<circle cx=${W - 90} cy=${h - 110} r="36" fill=${p.b} />`);
    case 'moon':
      return svg(html`<circle cx="170" cy="180" r="90" fill=${p.a} /><circle cx="205" cy="160" r="84" fill=${p.bg} />${[[880, 140], [960, 300], [760, 90], [120, 1180], [300, 1250]].map(([x, y]) => html`<circle cx=${x} cy=${y} r="5" fill=${p.a} opacity=".8" />`)}`);
    case 'magazine':
      return svg(html`<line x1="96" y1="96" x2=${W - 96} y2="96" stroke=${p.ink} stroke-width="3" /><line x1="96" y1=${h - 96} x2=${W - 96} y2=${h - 96} stroke=${p.ink} stroke-width="1.5" />`);
    case 'cuts':
      return svg(html`<polygon points=${`${W},0 ${W},260 ${W - 360},0`} fill=${p.a} /><polygon points=${`0,${h} 0,${h - 220} 300,${h}`} fill=${p.b} opacity=".85" />`);
    case 'arches':
      return svg(html`<path d=${`M${W - 380} ${h} V ${h - 360} a 190 190 0 0 1 380 0 V ${h}Z`} fill=${p.a} opacity=".16" /><path d=${`M${W - 300} ${h} V ${h - 260} a 110 110 0 0 1 220 0 V ${h}Z`} fill=${p.b} opacity=".5" />`);
    default:
      return null;
  }
}

// The business mark on every creative: the user's logo (from step 6) and name.
function Brand({ p, noLogo, size = 76, light }) {
  return html`<div style=${{ display: 'flex', alignItems: 'center', gap: '18px' }}>
    ${!noLogo && html`<img src=${BRAND.logo} alt="" style=${{ width: `${size}px`, height: `${size}px`, borderRadius: '999px', background: '#fff' }} />`}
    <span style=${{ font: `800 ${Math.round(size * 0.42)}px Rubik, Assistant, sans-serif`, color: light ? '#fff' : p.ink }}>${USER.business}</span>
  </div>`;
}

const box = (p, t, extra = {}) => ({ position: 'absolute', inset: 0, background: p.bg, color: p.ink, fontFamily: `'${t.font}', Assistant, sans-serif`, overflow: 'hidden', ...extra });
const hl = (t, p) => (t.decor === 'grid' ? { background: `linear-gradient(transparent 58%, ${t.own.a} 58%, ${t.own.a} 92%, transparent 92%)` } : {});

// ---------- carousel slide / post image, 1080x1350 ----------
export function Slide({ s, t, p, i = 0, total = 1, noLogo }) {
  const pad = { position: 'absolute', top: '150px', right: '96px', left: '96px', bottom: '170px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '34px', zIndex: 1 };
  const num = t.decor === 'magazine' ? { font: `900 230px Heebo`, color: t.own.a, lineHeight: 0.8 } : { font: `800 64px Rubik`, color: p.a };
  let inner;
  if (s.kind === 'cover')
    inner = html`<span style=${{ alignSelf: 'flex-start', padding: '10px 28px', borderRadius: '999px', background: p.a, color: p.onA, font: t.decor === 'polaroid' ? `700 52px 'Amatic SC'` : `700 36px Rubik` }}>${s.opener}</span>
      <h1 style=${{ font: `800 92px/1.12 '${t.font}', Rubik`, margin: 0 }}><span style=${hl(t, p)}>${s.title}</span></h1>
      ${s.sub && html`<p style=${{ font: `500 44px/1.35 Assistant`, margin: 0, opacity: 0.88 }}>${s.sub}</p>`}`;
  else if (s.kind === 'content')
    inner = html`<span style=${num}>${String(s.n).padStart(2, '0')}</span>
      <h2 style=${{ font: `800 74px/1.15 '${t.font}', Rubik`, margin: 0 }}><span style=${hl(t, p)}>${s.title}</span></h2>
      ${s.body && html`<p style=${{ font: `500 46px/1.42 Assistant`, margin: 0 }}>${s.body}</p>`}`;
  else if (s.kind === 'summary')
    inner = html`<h2 style=${{ font: `800 78px/1.15 '${t.font}', Rubik`, margin: 0 }}><span style=${hl(t, p)}>${s.title}</span></h2>
      <ul style=${{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '26px' }}>
        ${s.points.map((x) => html`<li style=${{ display: 'flex', gap: '22px', alignItems: 'flex-start', font: `600 46px/1.35 Assistant` }}><span style=${{ flex: 'none', marginTop: '14px', width: '30px', height: '30px', borderRadius: t.decor === 'grid' || t.decor === 'magazine' ? '4px' : '999px', background: p.a }}></span>${x}</li>`)}
      </ul>`;
  else if (s.kind === 'cta')
    inner = html`<h2 style=${{ font: `800 84px/1.15 '${t.font}', Rubik`, margin: 0 }}>${s.title}</h2>
      <p style=${{ display: 'flex', alignItems: 'center', gap: '18px', font: `700 42px/1.3 Assistant`, margin: 0, color: p.a }}>
        <svg width="44" height="54" viewBox="0 0 22 27"><path d="M2 2h18v23l-9-6-9 6z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" /></svg>${s.save}
      </p>`;
  else if (s.kind === 'quote')
    inner = html`<span style=${{ font: `900 220px/0.6 Rubik`, color: p.a, height: '110px' }}>”</span>
      <p style=${{ font: `800 74px/1.25 '${t.font}', Rubik`, margin: 0 }}><span style=${hl(t, p)}>${s.title}</span></p>`;
  return html`<div style=${box(p, t)}>
    <${Decor} t=${t} p=${p} />
    <div style=${pad}>${inner}</div>
    <div style=${{ position: 'absolute', right: '96px', bottom: '70px', zIndex: 1 }}><${Brand} p=${p} noLogo=${noLogo} /></div>
    ${s.kind === 'cover' && total > 1 && html`<span style=${{ position: 'absolute', left: '96px', bottom: '86px', zIndex: 1, font: `700 36px Assistant`, color: p.a }}>${s.swipe || 'החליקו לצד'} ←</span>`}
    ${total > 1 && s.kind !== 'cover' && html`<span style=${{ position: 'absolute', left: '96px', bottom: '86px', zIndex: 1, font: `700 32px Rubik`, opacity: 0.6 }}>${i + 1}/${total}</span>`}
  </div>`;
}

// ---------- reel frame, 1080x1920 ----------
// The hook stays in a band at the top (230-420) for the whole reel; captions sit at
// about 1250, so neither one hides under Instagram's buttons.
export function ReelFrame({ t, p, hook, caption, photo, playing }) {
  return html`<div style=${box(p, t, { background: '#222' })}>
    <img src=${photo} alt="" style=${{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.82)' }} />
    ${hook && html`<div style=${{ position: 'absolute', top: '230px', right: '70px', left: '70px', minHeight: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '26px 40px', borderRadius: '28px', background: p.a, color: p.onA, font: `800 66px/1.18 '${t.font}', Rubik`, textAlign: 'center' }}>${hook}</div>`}
    ${caption && html`<div style=${{ position: 'absolute', top: '1210px', right: 0, left: 0, display: 'flex', justifyContent: 'center' }}>
      <span style=${{ padding: '10px 30px', borderRadius: '18px', background: 'rgba(0,0,0,.55)', color: '#fff', font: `800 80px/1.15 Rubik`, textShadow: '0 3px 0 rgba(0,0,0,.4)' }}>${caption}</span>
    </div>`}
    <div style=${{ position: 'absolute', right: '70px', bottom: '230px' }}><${Brand} p=${p} light size=${64} /></div>
    ${!playing && html`<div style=${{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}><span style=${{ width: '200px', height: '200px', borderRadius: '999px', background: 'rgba(0,0,0,.45)', display: 'grid', placeItems: 'center' }}><svg width="90" height="90" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff" /></svg></span></div>`}
  </div>`;
}

// A stand-in QR code, the same pattern every time.
export function FakeQr({ size = 220, fg = '#141414' }) {
  const n = 21;
  const cells = [];
  let x = 7;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const finder = (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);
      x = (x * 73 + 41) % 101;
      if (!finder && x % 2) cells.push([r, c]);
    }
  const f = (r, c) => html`<rect x=${c} y=${r} width="7" height="7" fill=${fg} /><rect x=${c + 1} y=${r + 1} width="5" height="5" fill="#fff" /><rect x=${c + 2} y=${r + 2} width="3" height="3" fill=${fg} />`;
  return html`<svg width=${size} height=${size} viewBox="-1 -1 23 23" style="background:#fff;border-radius:6px"><rect x="-1" y="-1" width="23" height="23" fill="#fff" />${cells.map(([r, c]) => html`<rect x=${c} y=${r} width="1" height="1" fill=${fg} />`)}${f(0, 0)}${f(0, 14)}${f(14, 0)}</svg>`;
}

// ---------- the flyer, 1080x1350 (and the same layout on A4 for print) ----------
// Three layouts of the same photo of the user: "variations" means the same photo in
// different designs, never a generated face.
export const LAYOUTS = [
  { id: 'split', label: 'חצי תמונה' },
  { id: 'circle', label: 'תמונה בעיגול' },
  { id: 'full', label: 'תמונה מלאה' },
];
export function Flyer({ t, p, layout, photo, noLogo, offer = OFFER, price = true, qr = true }) {
  const full = layout === 'full';
  const textColor = full ? '#ffffff' : p.ink;
  const texts = html`
    <h1 style=${{ font: `800 ${layout === 'split' ? 86 : 96}px/1.08 '${t.font}', Rubik`, margin: 0 }}><span style=${full ? {} : hl(t, p)}>${offer.title}</span></h1>
    <p style=${{ font: `600 44px/1.3 Assistant`, margin: 0, opacity: 0.9 }}>${offer.sub}</p>
    <ul style=${{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '16px' }}>
      ${offer.points.map((x) => html`<li style=${{ display: 'flex', gap: '16px', alignItems: 'center', font: `600 38px/1.25 Assistant` }}><svg width="40" height="40" viewBox="0 0 24 24" style="flex:none"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke=${full ? '#fff' : p.a} stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" /></svg>${x}</li>`)}
    </ul>
    ${price && html`<p style=${{ margin: 0, font: `800 54px Rubik` }}>${offer.price} <span style=${{ font: `600 34px Assistant`, opacity: 0.85 }}>· ${offer.terms}</span></p>`}
    <span style=${{ alignSelf: 'flex-start', padding: '20px 40px', borderRadius: '999px', background: full ? '#fff' : p.a, color: full ? p.ink : p.onA, font: `800 ${layout === 'split' ? 34 : 42}px Rubik` }}>${offer.cta}</span>`;
  const foot = html`<div style=${{ position: 'absolute', right: '80px', left: layout === 'split' ? '530px' : '80px', bottom: '64px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '30px', zIndex: 2 }}>
    <div style=${{ display: 'grid', gap: '10px' }}>
      <${Brand} p=${p} noLogo=${noLogo} light=${full} size=${70} />
      <span style=${{ font: `700 36px Rubik`, color: textColor, direction: 'ltr', textAlign: 'right' }}>${USER.phone}</span>
    </div>
    ${qr && html`<div style=${{ display: 'grid', justifyItems: 'center', gap: '8px' }}><${FakeQr} size=${layout === 'split' ? 150 : 170} />${layout !== 'split' && html`<span style=${{ font: `600 24px Assistant`, color: textColor, direction: 'ltr' }}>${PAGE_LINK}</span>`}</div>`}
  </div>`;
  if (layout === 'split')
    return html`<div style=${box(p, t)}>
      <img src=${photo} alt="" style=${{ position: 'absolute', top: 0, left: 0, width: '44%', height: '100%', objectFit: 'cover' }} />
      <div style=${{ position: 'absolute', top: 0, left: '44%', width: '14px', height: '100%', background: p.a }}></div>
      <div style=${{ position: 'absolute', top: '100px', right: '80px', width: '46%', display: 'flex', flexDirection: 'column', gap: '30px', zIndex: 1 }}>${texts}</div>
      ${foot}
    </div>`;
  if (layout === 'circle')
    return html`<div style=${box(p, t)}>
      <${Decor} t=${t} p=${p} />
      <img src=${photo} alt="" style=${{ position: 'absolute', top: '90px', left: '80px', width: '330px', height: '330px', borderRadius: '999px', objectFit: 'cover', border: `12px solid ${p.a}`, zIndex: 1 }} />
      <div style=${{ position: 'absolute', top: '470px', right: '80px', left: '80px', display: 'flex', flexDirection: 'column', gap: '26px', zIndex: 1 }}>${texts}</div>
      <div style=${{ position: 'absolute', top: '150px', right: '80px', width: '520px', font: `700 46px/1.3 Assistant`, zIndex: 1, color: p.a }}>${USER.fullName}<br /><span style=${{ color: p.ink, font: `500 36px Assistant` }}>${USER.role}</span></div>
      ${foot}
    </div>`;
  return html`<div style=${box(p, t)}>
    <img src=${photo} alt="" style=${{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
    <div style=${{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${p.dark ? p.bg : '#0f1f1e'} 0%, rgba(15,31,30,.82) 52%, rgba(15,31,30,0) 78%)` }}></div>
    <div style=${{ position: 'absolute', right: '80px', left: '80px', bottom: '300px', display: 'flex', flexDirection: 'column', gap: '24px', color: '#fff', zIndex: 1 }}>${texts}</div>
    ${foot}
  </div>`;
}
