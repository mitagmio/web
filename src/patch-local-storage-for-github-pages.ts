const separator = window.location.pathname.replace(/\/+$/, '') + ':';

const setItem = globalThis.localStorage.setItem;
globalThis.localStorage.constructor.prototype.setItem = (key: unknown, value: string) =>
	setItem.apply(localStorage, [separator + key, value]);

const getItem = globalThis.localStorage.getItem;
globalThis.localStorage.constructor.prototype.getItem = (key: unknown) => getItem.apply(globalThis.localStorage, [separator + key]);

const removeItem = globalThis.localStorage.removeItem;
globalThis.localStorage.constructor.prototype.removeItem = (key: unknown) => removeItem.apply(globalThis.localStorage, [separator + key]);

export {};
