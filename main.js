/* main.js
   Shared utilities and StorageService wrapper
*/

const StorageService = (() => {
  // namespacing + versioning + simple migration hook
  const prefix = 'ecom_';
  function key(name, version = 'v1') {
    return `${prefix}${name}_${version}`;
  }

  function getRaw(name, version='v1') {
    try {
      return JSON.parse(localStorage.getItem(key(name,version)) || 'null');
    } catch {
      return null;
    }
  }
  function setRaw(name, value, version='v1') {
    localStorage.setItem(key(name,version), JSON.stringify(value));
    // cross-tab notify
    localStorage.setItem(`${key(name,version)}_changed`, Date.now().toString());
  }
  function removeRaw(name, version='v1') {
    localStorage.removeItem(key(name,version));
    localStorage.setItem(`${key(name,version)}_changed`, Date.now().toString());
  }

  // migrate placeholder
  function migrate(name, fromVersion, toVersion, migrateFn) {
    const data = getRaw(name, fromVersion);
    if (data !== null) {
      const newData = migrateFn(data);
      setRaw(name, newData, toVersion);
      removeRaw(name, fromVersion);
    }
  }

  return {
    key,
    get: getRaw,
    set: setRaw,
    remove: removeRaw,
    migrate
  };
})();

/* Helpers */
function currency(n) {
  return 'Rs ' + Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 2 });
}

function slugify(s) {
  return (s || '').toString().toLowerCase()
    .replace(/\s+/g,'-').replace(/[^\w-]+/g,'').replace(/--+/g,'-').replace(/^-+|-+$/g,'');
}

function debounce(fn, ms=300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(()=>fn(...args), ms);
  };
}

/* Cross-tab session sync (for auth changes) */
window.addEventListener('storage', (e) => {
  if (e.key === 'ecom_session_change') {
    // optional: UI update hook
    const ev = new Event('ecom:session-changed');
    window.dispatchEvent(ev);
  }
});

/* Exports for other scripts */
window.App = {
  StorageService,
  currency,
  slugify,
  debounce
};
