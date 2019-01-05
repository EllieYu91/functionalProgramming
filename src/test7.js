import { normalize } from "path";

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
