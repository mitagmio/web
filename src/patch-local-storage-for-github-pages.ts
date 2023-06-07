export const setItem = globalThis.localStorage.setItem;
globalThis.localStorage.constructor.prototype.setItem = setItem;

export const getItem = globalThis.localStorage.getItem;
globalThis.localStorage.constructor.prototype.getItem = getItem;

export const removeItem = globalThis.localStorage.removeItem;
globalThis.localStorage.constructor.prototype.removeItem = removeItem;
