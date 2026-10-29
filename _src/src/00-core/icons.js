/* ---------- icons ---------- */
const IC = {
  flame: '<svg viewBox="0 0 24 24" fill="#FF8A3D"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3-1-4 1-7 1-9.5z"/></svg>',
  coin: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FFC845" stroke="#B88A12" stroke-width="1.5"/><circle cx="12" cy="12" r="6" fill="none" stroke="#B88A12" stroke-width="1.4"/><path d="M12 8.5v7" stroke="#B88A12" stroke-width="1.6" stroke-linecap="round"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 21V4m0 0h11l-2 4 2 4H5"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6z"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/></svg>',
  game: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10.5v4M5 12.5h4"/><circle cx="15.5" cy="11" r="1" fill="currentColor"/><circle cx="18" cy="13.5" r="1" fill="currentColor"/></svg>',
  shop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 8h16l-1.5 12h-13z"/><path d="M8 8a4 4 0 0 1 8 0"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
  calc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="2" width="16" height="20" rx="3"/><path d="M8 6h8M8 11h1M12 11h1M16 11h0M8 15h1M12 15h1M8 19h1M12 19h1M16 15v4"/></svg>',
  keys: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M12 4v16M17 4v16"/><path d="M5.5 4h3v9h-3zM10.5 4h3v9h-3zM15.5 4h3v9h-3z" fill="currentColor" stroke="none" transform="translate(1 0)"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h3l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L21 7H6"/><circle cx="10" cy="20.5" r="1.4"/><circle cx="17" cy="20.5" r="1.4"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3"/><path d="M20 4v14h-7"/></svg>',
  share: '<svg viewBox="0 0 24 24" style="width:20px;height:20px" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
  chev: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>',
  cake: '<svg viewBox="0 0 40 40"><rect x="6" y="18" width="28" height="16" rx="3" fill="#E8364F"/><rect x="6" y="18" width="28" height="5" fill="#fff" opacity=".75"/><rect x="12" y="10" width="3" height="8" fill="#53A8FF"/><rect x="18.5" y="8" width="3" height="10" fill="#7FE3D6"/><rect x="25" y="10" width="3" height="8" fill="#A6D45E"/><circle cx="13.5" cy="8" r="2" fill="#FF7A3D"/><circle cx="20" cy="6" r="2" fill="#FFC845"/><circle cx="26.5" cy="8" r="2" fill="#FF7A3D"/></svg>',
};
const coinS = (w = 16) => IC.coin.replace('<svg', `<svg style="width:${w}px;height:${w}px"`);
IC.heart = '<svg viewBox="0 0 24 24" fill="#FF7AA8"><path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.2 5 6.6 5c2 0 3.6 1.1 5.4 3 1.8-1.9 3.4-3 5.4-3 3.4 0 5.6 3.3 4.1 6.8C19.5 16.4 12 21 12 21z"/></svg>';
IC.lock = IC.lock || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
