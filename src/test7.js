/**
 * 函数的管道化
 * 函数组合：函数的描述与求值分开
 */
const str = `We can only see a short distance ahead but we can see plenty there that needs to be done`;

// string -> [string] 切割句子为单词数组
const explode = str => str.split(/\s+/); 

// [] -> number 单词数量
const count = arr => arr.length;

const countWords = R.compose(count, explode);
// ------分隔符（以上是描述，以下是求值）-----
const result = countWords(str);
console.log(result); // -> 19


// compose 的实现
function compose() {
  let args = arguments;
  let start = args.length - 1;
  return function() { // 组合的输出是真正接收实际参数的函数
    let i = start;
    // 动态应用接收的参数到函数
    let result = args[start].apply(this, arguments);
    // 循环调用系列参数，以前一个函数的输出作为下一个函数的输入
    while(i--) {
      result = args[i].call(this, result);
    }
    return result;
  };
}


// 检查 ssn 是否合法
const validLength = (param, str) => str.length === param; // 检查字符串长度
const checkLengthSsn = _.partial(validLength, 9);

const cleanInput = R.compose(normalize, trim);
const isValidSsn = R.compose(checkLengthSsn, cleanInput);
// ------分隔符（以上是描述，以下是求值）-----
console.log(cleanInput('   444-44-4444  ')); // -> 444444444
console.log(isValidSsn('   444-44-4444  ')); // -> true

// 函数链风格实现的同样功能
Function.prototype.compose = R.compose;
const cleanInput2 = checkLengthSsn.compose(normalize).compose(trim);

/**
 * 函数式库的组合
 */
// 找出成绩最高的学生
// R.zip -> 配对两个数组的内容创建一个新数组，并将其返回
// R.prop -> 获取某个对象的指定属性值
// R.pluck -> 抽取指定索引处的元素构建数组
// R.head -> 获取第一个元素
const students = ['Rosser', 'Turing', 'Kleene', 'Church'];
const grades = [80, 100, 90, 99];

const smartestStudent = R.compose(R.head, R.pluck(0), R.reverse, R.sortBy(R.prop(1)), R.zip);
const result2 = smartestStudent(students, grades);
console.log(result2); // -> Turing

/**
 * 函数组合子-->管理程序的控制流
 */
// tap(K-组合子) 将无返回值的函数嵌入函数组合中，而无须创建其他的代码
const debugLog = info => console.log('debugLog: ', info);
R.tap(debugLog, 'test'); // => debugLog:  test
const debug = R.tap(_.partial(debugLog, _));
const smartestStudent2 = R.compose(debug, R.head, debug, R.pluck(0), R.reverse, debug, R.sortBy(R.prop(1)), R.zip);
smartestStudent2(students, grades);
// -> debugLog: [['Rosser', 80], ['Turing', 100], ['Kleene', 90], ['Church', 99]]
// -> debugLog: ["Turing", "Church", "Kleene", "Rosser"]
// -> debugLog: Turing

// alt(OR-组合子) 执行简单的条件逻辑（if-else）
// alt 实现
const alt = function(fun1, fun2) {
  return function(val) {
    return fun1(val) || fun2;
  }
}

const alt2 = R.curry((fun1, fun2, val) => fun1(val) || fun2(val));

// seq(S-组合子) 遍历函数序列
// seq 实现
const seq = function() {
  const funs = Array.prototype.slice.call(arguments);
  return function(val) {
    funs.forEach(fun => {
      fun(val);
    });
  }
};

// fork(join) 组合子
