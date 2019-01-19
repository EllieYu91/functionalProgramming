/**
 * 优化
 * 上下文 堆栈
 * executionContextData = {
 *    scopeChain, // 包含当前函数的 variableObject 以及父执行上下文的 variableObject
 *    variableObject, // 包括当前函数的参数、内部变量以及函数声明
 *    this // 函数对象的引用（任何函数在系统中都是对象）
 * }
 * 
 */

/**
 * 记忆化
 * 遇到相同的输入会立即触发内部缓存命中直接返回结果
 */
let rot13 = (s => 
  s.replace(/[a-zA-Z]/g, 
    c => String.fromCharCode(
      (c <= 'z' ? 90 : 122) >= ( c = c.charCodeAt(0) + 13)
       ? c 
       : c - 26
    )
  )
);

// 内部工具方法负责为当前函数实例创建缓存逻辑
Function.prototype.memoized = function() {
  // 将参数字符串化以获得对当前函数调用的键值。可以通过检测输入类型来创建更加鲁棒的键值生成方法。此处仅作示例
  const key = JSON.stringify(arguments);
  // 为当前函数实例创建一个内部的缓存
  this._cache = this._cache || {}; 
  // 先试图读取缓存，通过输入来判断是否计算过。如果找到对应的值，则跳过函数调用直接返回；否则，执行计算
  this._cache[key] = this._cache[key] || this.apply(this, arguments);
  return this._cache[key];
}

// 激活函数的记忆化
Function.prototype.memoize = function () {
  const fn = this;
  // 只尝试记忆化一元函数
  if(fn.length === 0 || fn.length > 1) {
    return fn;
  }

  return function() {
    // 将函数实体包裹在记忆化函数中
    return fn.memoized.apply(fn, arguments);
  }
}

// 记忆化方式一：通过调用函数对象上的方法
// rot13 = rot13.memoize();

// 记忆化方式二：通过包裹函数
rot13 = (s => 
  s.replace(/[a-zA-Z]/g, 
    c => String.fromCharCode(
      (c <= 'z' ? 90 : 122) >= ( c = c.charCodeAt(0) + 13)
       ? c 
       : c - 26
    )
  )
).memoize();


// 调用 tap 调用性能时间戳函数
// 使用 start 和 end 函数来测量时间
const start = function () {
  return performance.now();
}
const runs = [];
const end = function (begin) {
  const end = performance.now();
  console.log(begin, end);
  const result = (end - begin).toFixed(3);
  runs.push(result);
  return result;
};

const test = function (fn, input) {
  return () => fn(input);
};

const testRot13 = IO.of(start)
                    .map(start)
                    // .map(R.tap(start('rot13')))
                    .map(R.tap(test(
                      rot13,
                      'functional_js_50_off'
                    )))
                    .map(end);

testRot13.run();
setTimeout(() => {
  testRot13.run();
  // 使用同一参数 functional_js_50_off 两次执行 rot13，第一次调用，缓存为空，需计算 rot13 ，并以参数为键存储在缓存中；第二次调用会命中缓存，没有发生计算就直接返回结果
  console.log(runs[0] >= runs[1]); // -> true
  console.log(runs);
}, 1000);

