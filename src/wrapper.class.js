/**
 * 包裹值的函数式数据类型
 */
class Wrapper {
  // 存储任意类型值的简单类型
  constructor(value) {
    this._value = value;
  }

  // 用函数来map该类型值
  // map::(A -> B) -> A -> B
  map(f) {
    return f(this._value);
  }

  toString() {
    return 'Wraper (' + this._value + ')';
  }
}