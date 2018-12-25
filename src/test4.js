/**
 * Lodash 
 */

/**
 * map
 * 从学生列表中提取每个人的全名
 */ 
// before
const result = [];
for(let i = 0; i < people.length; i++){
  const p = people[i];
  if(p !== null && p !== undefined){
    result.push(fullname(p));
  }
}
console.log(result); // -> ["Haskell Curry", "Alan Turing", "Alonzo Church", "Stephen Kleene"]

// after
const result2 = _.map(people, p => (p !== null && p !== undefined) ? fullname(p) : '');
console.log(result2); // -> ["Haskell Curry", "Alan Turing", "Alonzo Church", "Stephen Kleene"]

// after2
const result4 = _(people)
                  .reverse()
                  .map(p => (p !== null && p !== undefined) ? fullname(p) : '')
                  .value();
console.log(JSON.stringify(people), result4); 
// ->["Stephen Kleene", "Alonzo Church", "Alan Turing", "Haskell Curry"]
// people 被改变了


/**
 * reduce
 * 从学生列表中计算人数最多的国家
 */
const result5 = _(people).reduce((stat, person) => {
  const country = person.address.country;
  stat[country] = _.isUndefined(stat[country]) ? 1 : stat[country] + 1;
  return stat;
}, {});
console.log(result5); // -> {US: 3, England: 1}

//改进1-业务函数与控制流分离
const getCountry = person => person.address.country;
const gatherStats = (stat, criteria) => {
  stat[criteria] = _.isUndefined(stat[criteria]) ? 1 : stat[criteria] + 1;
  return stat;
};
const result6 = _(people).map(getCountry).reduce(gatherStats, {});
console.log(result6); // -> {US: 3, England: 1}

// 改进2-避免直接访问对象属性
const countryPath = ['address', 'country'];
const countryLens = R.lens(R.path(countryPath), R.assocPath(countryPath));

const result7 = _(people).map(R.view(countryLens)).reduce(gatherStats, {});
console.log(result7); // -> {US: 3, England: 1}

// 改进3-使用 groupBy
const result8 = _.groupBy(people, R.view(countryLens));
console.log(result8);
// -> {England: [Student], US: [Student, Student, Student]}
 

/**
 * some
 */
const isNotValid = val => _.isUndefined(val) || _.isNull(val);
const notAllValid = args => (_(args).some(isNotValid));
const validate = args => !notAllValid(args);
const result9 = validate(['string', 0, null, undefined]);
const result10 = validate(['string', 0, {}]);
console.log(result9, result10); // -> false true

/**
 * filter
 * 从学生列表中提取生于1993年的人
 */
const birth1993 = person => person.birthYear === 1993;
const result11 = _(people).filter(birth1993).map(p => fullname(p)).join(' and ');
console.log(result11); // -> 'Stephen Kleene and Alonzo Church'
