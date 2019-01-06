/**
 * Maybe --> 合并判空，是一个包含两个具体子类型的空类型（标记类型）
 * Maybe 是 Just 和 Nothing 的抽象，Just 和 Nothing 各自包含自己的 Monadic 的实现
 * Maybe 擅长与集中管理的无效数据的检查
 * 使用场景：不确定的调用（查询数据库、在集合中查找值、从服务器请求数据。。。）
 * 不足：未提供出错的具体地方
 */ 
class Maybe {
  static just(a) {
    return new Just(a);
  }

  static nothing() {
    return new Nothing();
  }

  // 由一个可为空的类型创建Maybe。如果值为空，创建一个Nothing，否则，将值存在Just子类型中来表示其存在性
  static fromNullable(a) {
    return a !== null && a !== undefined ? Maybe.just(a) : Maybe.nothing();
  }

  static of(a) {
    return Maybe.just(a);
  }

  get isNothing() {
    return false;
  }

  get isJust() {
    return false;
  }
}

// Just --> 处理存在的值
class Just extends Maybe {
  constructor(value) {
    super();
    this._value = value;
  }

  get value() {
    return this._value;
  }

  // 将映射函数应用与Just，变换其中的值，并存储回容器中
  map(f) {
    return Just.of(f(this.value));
  }

  // Monad 提供默认的一元操作，用于从中获取其值
  getOrElse() {
    return this._value;
  }

  filter(f) {
    Maybe.fromNullable(f(this._value) ? this._value : null);
  }

  get isJust() {
    return true;
  }

  toString() {
    return `Maybe.Just(${this._value})`;
  }
}

// Nothing --> 为无值的情况提供保护
class Nothing extends Maybe {
  map(f) {
    return this;
  }

  get value() {
    throw new TypeError(`Can't extract the value of a Nothing.`);
  }

  // 忽略值，返回other
  getOrElse(other) {
    return other;
  }

  // 如果存在的值满足所给的断言，则返回包含值的Just，否则返回Nothing
  filter() {
    return this._value;
  }

  get isNothing() {
    return true;
  }

  toString() {
    return `Maybe.Nothing`;
  }
}