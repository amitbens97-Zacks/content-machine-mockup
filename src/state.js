// All the mockup's data in one object, kept per browser tab and per demo user.
import { GENDER, START_PLAN } from './data.js';

const STORE = `flowbiz-cm-state-v1-${GENDER}`;

export function freshState() {
  return {
    cfg: {
      // the week being made: 1 = the first pass through the step; history = weeks done
      week: 1,
      history: [],
      autoWeek: false, // the shark prepares next week's draft every Saturday night
      // parts 1-2: channels and the look
      channels: ['ig', 'fb'],
      connect: null, // 'meta' after the Meta sheet, 'manual' for "אפרסם בעצמי"
      fbGroups: true, // the audience is also in Facebook groups: copy and remind, no direct post
      style: 'soft',
      template: 't1',
      colors: 'brand', // 'brand' = the logo colors, 'own' = the template's palette
      photo: 'landing', // 'landing' = the photo from step 9, 'upload' = a new one
      voice: '',
      // the 3 items of the week: topic and format (part 3), day and time (part 5)
      plan: START_PLAN.map((i) => ({ ...i })),
      // part 3: the content, per item
      generated: false,
      items: {},
      // part 4: the flyer
      flyer: { layout: 'split', price: true, qr: true, swatch: 0, saved: false, edits: {}, look: null },
      // part 5: the week plan, per item: { status: 'scheduled' | 'manual' | 'posted', at, to: [] }
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
