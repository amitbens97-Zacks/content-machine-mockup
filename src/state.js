// All the mockup's data in one object, kept per browser tab and per demo user.
import { GENDER, START_PLAN } from './data.js';

const STORE = `flowbiz-cm-state-v1-${GENDER}`;

export function freshState() {
  return {
    cfg: {
      // part 1: the channel and the look
      channels: ['ig', 'fb'],
      connect: null, // 'meta' after the Meta sheet, 'manual' for "אפרסם בעצמי"
      fbGroups: true, // the audience is also in Facebook groups: copy and remind, no direct post
      style: 'soft',
      template: 't1',
      colors: 'brand', // 'brand' = the logo colors, 'own' = the template's palette
      photo: 'landing', // 'landing' = the photo from step 9, 'upload' = a new one
      voice: '',
      // part 2: the week
      plan: START_PLAN.map((i) => ({ ...i })),
      // part 3: the content, per item
      generated: false,
      items: {},
      // part 4: the flyer
      flyer: { layout: 'split', price: true, qr: true, swatch: 0, saved: false, edits: {} },
      // part 5: publishing, per item: { status: 'scheduled' | 'manual' | 'posted', at, to: [] }
      sched: {},
      done: false,
    },
    // developer switches (Shift+D)
    flags: { b2b: false, noOffer: false, noLogo: false, noPhoto: false, growSub: true, failPublish: false, personalIg: false, noPage: false },
  };
}

export function loadState() {
  try {
    const raw = sessionStorage.getItem(STORE);
    if (raw) {
      const s = JSON.parse(raw);
      const f = freshState();
      return { cfg: { ...f.cfg, ...s.cfg }, flags: { ...f.flags, ...s.flags } };
    }
  } catch {}
  return freshState();
}

export function saveState(s) {
  try {
    sessionStorage.setItem(STORE, JSON.stringify(s));
  } catch {}
}
