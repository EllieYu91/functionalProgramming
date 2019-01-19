/**
 * 这种将值包裹到容器中的模式，是为了构建无副作用的代码，把可能不纯的变化包裹成引用透明的过程
 */
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
