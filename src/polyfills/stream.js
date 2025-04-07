
// Simple stream polyfill for browser environments
export class Transform {
  constructor() {
    this._events = {};
  }
  
  on(event, listener) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(listener);
    return this;
  }
  
  emit(event, ...args) {
    if (!this._events[event]) return false;
    this._events[event].forEach(listener => listener(...args));
    return true;
  }
  
  removeListener(event, listener) {
    if (!this._events[event]) return this;
    this._events[event] = this._events[event].filter(l => l !== listener);
    return this;
  }
  
  // Add minimal stream interface methods as needed
  pipe() { return this; }
  write() { return true; }
  end() { return this; }
}

export default {
  Transform
};
