import strg from 'local-storage-fallback';

let s: StorageFallback;

try {
  if (!window.localStorage) {
    throw new Error();
  }
  s = window.localStorage;
} catch (e) {
  s = strg;
}

export const storage = s;
