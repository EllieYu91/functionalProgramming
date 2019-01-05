/**
 * 如何函数式地处理异常（null、undefined，无网络。。。）
 * 创建与组合容错函数
 * Functor、Monad
 */
// 根据值快速创建 Wrapper 的帮助函数
// wrap::A -> Wraper(A)
const wrap = val => new Wrapper(val);

// 值的提取
const wrappedValue = wrap('Get Functional');
const result = wrappedValue.map(R.identity);
console.log(result); // -> Get Functional

const result2 = wrappedValue.map(R.toUpper);
console.log(result2); // -> GET FUNCTIONAL

// map 的变种，取出包裹的值，将其应用 f 函数后的返回值重新包裹起来，并返回包裹后的值
Wrapper.prototype.fmap = function(f) {
  return wrap(f(this._value));
}

const plus = R.curry((a, b ) => a + b);
const plus3 = plus(3);
// 包裹 2
const two = wrap(2);
// 执行过程：取出 2，将 2 执行 plus3 方法后得到结果 5，重新包裹 5，最后将 5 通过调用 map、R.identity方法后提取出来
// fmap 函数返回同样的类型，因此可以链式地继续调用 Wrapper 类中的方法
const result3 = two.fmap(plus3).map(R.identity);
console.log(result3); // -> 5


/**
 * Monad
 */
// 求给定数字的一半
const half = val => wrap(val / 2);
const result4 = wrap(2).fmap(half);
const result5 = wrap(3).fmap(half);
console.log(result4, result5); // -> Wrapper(1), Wrapper(1.5)

// 求给定偶数的一半，输入奇数时，无报错
const Empty = function() {};
Empty.prototype.map = function() {
  return this;
}
Empty.prototype.fmap = function() {
  return empty();
}
const empty = () => new Empty;

const isEven = val => Number.isFinite(val) && (val % 2 === 0);
const half2 = val => isEven(val) ? wrap(val / 2) : empty();
const result6 = half2(4);
console.log(result6); // -> Wrapper(2)
const result7 = half2(3);
console.log(result7); // -> Empty
// 输入奇数导致返回Empty，而不是null，因此后面想应用函数，就不必在意可能出现的异常
const result8 = half2(3).fmap(plus3);
console.log(result8); // -> Empty


//
const result9 = WrapperMonad.of('Hello Monads!').map(R.toUpper).map(R.identity);
console.log(result9); // -> WrapperMonad('HELLO MONADS!')


/**
 * 使用 Maybe Monad 和 Either Monad 来处理异常
 */
const find = (array, path, value) => {
  const l = R.lens(R.path(path), R.assocPath(path));
  return R.head(array.filter(val => R.view(l, val) === value));
};
// safeFindObj :: DB -> string -> Maybe
const safeFindObj = R.curry((array, path, value) => {
  return Maybe.fromNullable(find(array, path, value));
});

// safeFindStudent :: string -> Maybe(Student)
const safeFindStudent = safeFindObj(people);

const student = safeFindStudent(['ssn'])('444-44-4444').map(R.identity);
console.log(student); // -> Just(Student(...)) or Nothing

const result10 = safeFindStudent(['ssn'])('444-44-4444').map(R.view(R.lensProp('address')));
console.log(result10); // -> Just(Address(...)) or Nothing

// 找到某个学生姓名并显示，如果找不到就显示默认值
const studentLastname = safeFindStudent(['ssn'])('444-44-4444').map(R.view(R.lensProp('lastname')));
const result11 = studentLastname.getOrElse('Enter Last Name');
console.log(result11); // -> 'Kleene' or 'Enter Last Name'


// 查询嵌套属性。找到某个学生，并显示其国家
// 任何一步返回 Nothing ，所有后续操作都会被跳过
const getCountry = student => student
                                .map(R.view(R.lensProp('address')))
                                .map(R.view(R.lensProp('country')))
                                .getOrElse('Country does not exist!');
const country = R.compose(getCountry, safeFindStudent);
const result12 = country(['address', 'country'], 'US');
console.log(result12); // ->'US' or 'Country does not exist!'



// 将任意普通函数转化成能操作 Monad 的函数
const lift = R.curry((f, value) => Maybe.fromNullable(value).map(f));

const find2 = (array, path, value) => {
  const l = R.lens(R.path(path), R.assocPath(path));
  return array.filter(val => R.view(l, val) === value);
};
const safeFindObj2 = R.curry((array, path, value) => {
  return find2(array, path, value);
});
const safeFindStudent2 = safeFindObj(people);

const country2 = R.compose(lift, getCountry, lift(R.head), lift(safeFindStudent2));
const result13 = country2(['address', 'country'], 'US');
console.log(result13);

// const country3 = R.compose(lift, safeFindObj2);
// const result14 = country3(people, ['lastname'], 'Kleene');
// console.log(result14);
