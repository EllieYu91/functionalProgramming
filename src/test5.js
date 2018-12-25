/**
 * 代码推理
 */

const names = ['alonzo church', 'Haskell curry', 'stephen_kleene', 'John Von Neumann', 'stephen_kleene'];

/**
 * 对数组进行一系列操作(读取、规范化、去重、排序)——命令式风格
 */
var result = [];
for(let i = 0; i < names.length; i++) {
  const n = names[i];
  if(n !== undefined && n !== null) {
    const ns = n.replace(/_/, ' ').split(' ');
    for(let j = 0; j < ns.length; j++) {
      let p = ns[j];
      p = p.charAt(0).toUpperCase() + p.slice(1);
      ns[j] = p;
    }
    if(result.indexOf(ns.join(' ')) < 0) {
      result.push(ns.join(' '));
    }
  }
}
result.sort();
console.log(result); // -> ["Alonzo Church", "Haskell Curry", "John Von Neumann", "Stephen Kleene"]

// 函数式
const result2 = _.chain(names) // 初始化函数链
                  .filter(isValid) // 去掉非法值
                  .map(s => s.replace(/_/, ' ')) // 规范化值
                  .uniq() // 去掉重复元素
                  .map(_.startCase) // 大写首字母
                  .sort()
                  .value();
console.log(result2); // -> ["Alonzo Church", "Haskell Curry", "John Von Neumann", "Stephen Kleene"]


// 统计学生列表中各国人数
const countryPath = ['address', 'country'];
const countryLens = R.lens(R.path(countryPath), R.assocPath(countryPath));
const gatherStats2 = (stat, country) => {
  if(!isValid(stat[country])){
    stat[country] = { 'name': country, 'count': 0};
  }
  stat[country].count++;
  return stat;
}
const result3 = _(people).map(R.view(countryLens)).reduce(gatherStats2, {});
console.log(result3); // -> {US:{ name: "US", count: 3}, England:{ name: "England", count: 1}}

// 找出学生列表中人数最多的国家
const result4 = _.chain(people)
                  .filter(isValid)
                  // Ramda 的 R.view() 的 Lodash 对应版本，抽取 person 对象的 address.country 属性
                  .map(_.property('address.country')) 
                  .reduce(gatherStats2, {})
                  .values()
                  .sortBy('count')
                  .reverse()
                  .first()
                  .value()
                  .name;
console.log(result4); // -> 'US' 
/**
 * value, values 的区别？    
 * values()：Creates an array of the own enumerable string keyed property values of object
 * value()：Executes the chain sequence to resolve the unwrapped value
 */  

/**
 * mixin
 * 创建关键字到对应别名函数的映射
 */
_.mixin({'select': _.map,
          'from': _.chain,
          'where': _.filter,
          'groupBy': _.sortBy});
const result5 = _.from(people)
                  .where(p => p.birthYear > 1990 && p.address.country !== 'US')
                  .groupBy(['firstname', 'birthYear'])
                  // .select('firstname') // -> ["Alan"]
                  .map(p => _.pick(p, ['firstname', 'birthYear']))
                  // ->  {firstname: "Alan", birthYear: 1997}
                  .value();
console.log(result5); 


// function sum(arr) {
//   if(_.isEmpty(arr)){
//     return 0;
//   }
//   return _.first(arr) + sum(...arr);
// }

// console.log(sum([]));
// const data = [1,2,3,4,5,6,7,8,9];
// const result6 = sum(data);
// console.log(result6);

// function sum2(arr, acc = 0){
//   if(_.isEmpty(arr)){
//     return 0;
//   }
//   return sum2(...arr, acc + _.first(arr));
// }
// const result7 = sum2(data);
// console.log(result7);
