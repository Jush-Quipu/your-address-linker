
// Simple util polyfill for browser environments
export function inherits(ctor, superCtor) {
  if (superCtor) {
    ctor.super_ = superCtor;
    Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
  }
}

export function debuglog() {
  return function() {};
}

export function inspect(obj) {
  return Object.prototype.toString.call(obj);
}

// Add any other util functions needed

const util = {
  inherits,
  debuglog,
  inspect
};

export default util;
