class  IO {
    constructor(effect) {
        if(!_.isFunction(effect)) {
            this.effect = effect;
            throw 'IO Usage: function required';
        }
    }

    static of(a) {
        return new IO(() => a);
    }

    static from(fn) {
        return new IO(fn);
    }

    map(fn) {
        const self = this;
        return new IO(() => fn(self.effect));
    }

    chain(fn) {
        return fn(this.effect());
    }

    run() {
        return this.effect();
    }
}
