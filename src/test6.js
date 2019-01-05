/**
 * 函数的管道化
 * 元组结构、柯里化
 * 柯里化的替代方案：部分应用、函数绑定
 */
const result = normalize(trim('   444-44-4444  '));
console.log(result);

/**
 * 元组结构（让函数总是输出一个值）
 * 元组-有限的、有序的元素列表，由2-3个值成组出现，记为(a, b, c)
 */
// 创建一个不可变且长度固定的数据结构，可用于在函数间通讯的存储了n个不同类型值的异构集合
// checkType :: Type -> Type -> Type | TypeError
const checkType = R.curry(function(typeDef, obj) {
	if(!R.is(typeDef, obj)) {
		let type = typeof obj;
		throw new TypeError(`Type mismatch. Expected [${typeDef}] but found [${type}]`);
	}
	return obj;
});

const Tuple = function() {
  // 读取参数作为元组的元素类型
  const typeInfo = Array.prototype.slice.call(arguments, 0);

  // 声明内部类型_T,以保障类型与值匹配
  const _T = function() {
    // 提取参数作为元组内的值
    const values = Array.prototype.slice.call(arguments, 0);
    
    // 检查非空值。函数式数据类型不允许空值
    if(values.some(val => val === null || val === undefined)) {
      throw new ReferenceError('Tuples may not have any null values');
    }

    // 按照定义类型的个数检查元组的元数（参数数量）
    if(values.length !== typeInfo.length) {
      throw new TypeError('Tuple arity does not match its prototype');
    }

    // 使用 checkType 检查每个值都能匹配其类型定义。其中的元素都可以通过 _n 获取，n 为元素的索引（从 1 开始）
    values.map((val, index) => {
      this['_' + (index + 1)] = checkType(typeInfo[index])(val);
    }, this);

    // 让元组实例不可变
    Object.freeze(this);
  }

  // 提取元组中的元素，也可使用 es6 解构赋值把元素赋值到变量上
  _T.prototype.values = function() {
    return Object.keys(this).map(k => this[k], this);
  }

  return _T;
}

/**
 * 验证学生的 SSN
 */
const Status = Tuple(Boolean, String);
const isValid = str => {
  if(str.length === 0) {
    return new Status(false, 'Invalid input. Expected non-empty value!');
  } else {
    return new Status(true, 'Success!');
  }
}
const result1 = isValid(normalize(trim('444-44-4444')));
console.log(result1.values());  // -> {_1: true, _2: "Success!"}

/**
 * 配合 es6 解构赋值，将元组值映射到变量中
 */
const StringPair = Tuple(String, String);
const nameString = new StringPair('Barkley', 'Rosser');
const [first, last] = nameString.values();
console.log(first, last); // -> 'Barkley' 'Rosser'


/**
 * 柯里化（让函数总是输入一个值）
 */
// 手动实现柯里化（返回一个接收后续参数的简单嵌套函数包装器）
function curry2(fn) {
  return function(firstArg) { // 获得第一个参数
    return function(secondArg) { // 获得第二个参数
      return fn(firstArg, secondArg); // 将两个参数应用到函数 fn 上
    }
  }
}

const name2 = curry2((last, first) => new StringPair(last, first));
const [one, two] = name2('Barkley')('Rosser').values();
console.log(one, two); // -> 'Barkley' 'Rosser'

const result2 = name2('Curry');
console.log(result2); // -> Function


const checkType2 = curry2((typeDef, actualType) => {
  if(R.is(typeDef, actualType)) {
    return actualType;
  } else {
    throw new TypeError('Type mismatch. Expected [' + typeDef + '] but found [' + typeof actualType + ']');
  }
});

const result3 = checkType2(String)('Curry');
// const result4 = checkType2(Number)('3');
// console.log(result3, result4); // -> Uncaught TypeError


/**
 * 柯里化的替代方案：部分应用、函数绑定
 */

// 部分应用
// function partial() {
//   let fn = this, boundArgs = Array.prototype.slice.call(arguments);
//   let placeholder = <<partialPlaceholderObj>>;
//   let bound = function() {
//     let position = 0, length = args.length;
//     let args = Array(length);
//     for(let i = 0; i < length; i++) {
//       args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
//     }

//     while(position < arguments.length) {
//       args.push(arguments[position++]);
//     }
//     return fn.apply(this,args);
//   }

//   return bound;
// }

/**
 * 部分应用
 * _.partial()
 * 实际用途：核心语言扩展（在原型上添加方法）
 */
String.prototype.first = _.partial(String.prototype.substring, 0, _);
const result5 = 'Functional Programming'.first(3);
console.log(result5); // -> Fun

String.prototype.asName = _.partial(String.prototype.replace, /(\w+)\s(\w+)/, '$2, $1');
const result6 = 'Alonzo Church'.asName();
console.log(result6); // -> Church, Alonzo

/**
 * 延迟函数绑定
 * _.bind()
 * 实际用途：期望目标函数使用某个特定对象来执行，eg:setTimeout、setTnterval
 */
const Scheduler = (function() {
  const delayedFn = _.bind(setTimeout, undefined, _, _);

  return {
    delay5: _.partial(delayedFn, _, 5000),
    delay10: _.partial(delayedFn, _, 10000),
    delay: _.partial(delayedFn, _, _)
  };
 })();

Scheduler.delay5(function() {
  console.log('executing after 5 seconds!');
});
// 5s 后控制台打印 executing after 5 seconds!
