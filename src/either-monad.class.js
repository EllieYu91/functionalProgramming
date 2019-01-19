/**
 * Either
 * 通常操作右值（在容器上映射函数总是在 Right 子类型上执行，类似于 Maybe 的 Just 分支）
 * 使用场景：为失败的结果提供更多信息
 */
class Either {
    constructor(value) {
        this._value = value;
    }

    get value() {
        return this._value;
    }

    static left(a) {
        return new Left(a);
    }

    static right(a) {
        return new Right(a);
    }

    // 若值非法，则返回 Lef，否则返回 Right
    static fromNullable(val) {
        return val !== null && val !== undefined ? Either.right(val) : Either.left(val);
    }

    // 创建一个包含值得 Right 实例
    static of(a) {
        return Either.right(a);
    }
}

class Right extends Either {
    // 通过映射函数对 Right 结构中得值进行变换，对 Left 不进行任何操作    
    map(f) {
        return Either.of(f(this._value));
    }

    // 提取 RIght 的值，如果不存在，则返回给定的默认值
    getOrElse(other) {
        return this._value;
    }

    // 将给定函数应用于 Left 值，不对 Right 进行任何操作
    // 无操作，充当占位符，遇到特定 Monad 时可以跳过
    orElse() {
        return this;
    }

    // 将给定函数应用于 Right 值并返回其结果，不对 Left 进行任何操作。
    chain(f) {
        return f(this._value);
    }

    // 如果为 Left ， 通过给定值抛出异常；否则，忽略异常并返回 Right 中的合法值
    getOrElseThrow() {
        return this._value;
    }

    // 如果为 Right 且给定的断言为真，返回包含值得 Right 结构，否则返回空的 Left
    filter(f) {
        return Either.fromNullable(f(this._value) ? this._value : null);
    }

    toString() {
        return `Either.Right(${this._value})`;
    }
}


class Left extends Either {
    // 通过映射函数对 Right 结构中得值进行变换，对 Left 不进行任何操作
    map(_) {
        return this;
    }

    // 尝试提取 Right 结构中得值，否则抛出 TypeError
    get value() {
        throw new TypeError(`Can't extract the  value of a Left(a).`);
    }

    // 提取 RIght 的值，如果不存在，则返回给定的默认值
    getOrElse(other) {
        return other;
    }

    // 将给定函数应用于 Left 值，不对 Right 进行任何操作
    orElse(f) {
        return f(this._value);
    }

    // 将给定函数应用于 Right 值并返回其结果，不对 Left 进行任何操作。
    chain(f) {
        return this;
    }

    // 如果为 Left ，通过给定值抛出异常；否则，忽略异常并返回 Right 中的合法值
    getOrElseThrow(a) {
        throw new Error(a);
    }

    // 如果为 Right 且给定的断言为真，返回包含值得 Right 结构，否则返回空的 Left
    filter(f) {
        return this;
    }

    toString() {
        return `Either.Left(${this._value})`;
    }
}





