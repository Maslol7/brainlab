const PROFILES = {
  yonatan: { id: 'yonatan', name: 'יונתן', bd: '12-13', g: 'm', key: 'brainlab-yonatan-v1', sbx: 'brainlab-sandbox-v1', cloud: 'bl-cloud' },
  romi: { id: 'romi', name: 'רומי', bd: '04-03', g: 'f', key: 'brainlab-romi-v1', sbx: 'brainlab-sandbox-romi', cloud: 'bl-cloud-romi' },
};
const PROF = (() => {
  let id = null;
  try {
    const m = /[?&]kid=(\w+)/.exec(location.search);
    if (m && PROFILES[m[1]]) { id = m[1]; localStorage.setItem('bl-profile', id); try { history.replaceState(null, '', location.pathname); } catch (e) { } }
    else id = localStorage.getItem('bl-profile');
  } catch (e) { }
  return PROFILES[id] || PROFILES.yonatan;
})();
