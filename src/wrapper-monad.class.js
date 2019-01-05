class WrapperMonad {
  constructor(value) {
    this._value = value;
  }

  static of(a) {
    return new WrapperMonad(a);
  }

  map(f) {
    return WrapperMonad.of(f(this._value));
  }

  // 压平嵌套的 WrapperMonad
  join() {
    if(!(this._value instanceof WrapperMonad)) {
      return this;
    }
    return this._value.join();
  }

  toString() {
    return `WrapperMonad (${this._value})`;
  }
}
