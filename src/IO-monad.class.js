/**
 * IO Monad 包装的是effect，而不是一个值。
 * 一个函数可以看作一个等待计算的惰性的值
 */
class  IO {
    constructor(effect) {
        // IO 构造器包含读和写的操作，该操作由 effect 函数表示
        if(!_.isFunction(effect)) {
            throw 'IO Usage: function required';
        }
        this.effect = effect;
    }

    // 将值或函数提升至 IO Monad 中
    static of(a) {
        return new IO(() => a);
    }

    // 将值或函数提升至 IO Monad 中    
    static from(fn) {
        return new IO(fn);
    }

    // 映射 Functor
    map(fn) {
        const self = this;
        return new IO(() => fn(self.effect()));
    }

    chain(fn) {
        return fn(this.effect());
    }

    // 执行 IO 的惰性调用链
    run() {
        return this.effect();
    }
}
