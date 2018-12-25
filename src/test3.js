/**
 * 高阶函数
 */
function applyOperation(a, b, opt){
  return opt(a, b);
}

var multiplier = (a, b) => a * b;

const result = applyOperation(2, 3, multiplier);
console.log(result);


function add(a) {
  return function(b){
    return a + b;
  }
}
const result2 = add(2)(3);
console.log(result2);


/**
 * 打印住在美国的人员名单
 */
// before
function printPeopleInUS(people) {
  people.forEach(person => {
    if(person.address.country === 'US'){
      console.log(person);
    }
  });
}

// after1
function printPeople(people, selector, printer){
  people.forEach(person => {
    if(selector(person)){
      printer(person);
    }
  })
}

var inUs = person => person.address.country === 'US';

printPeople(people, inUs, console.log);
// people.filter(inUs).map(console.log);

// after2
const countryPath = ['address', 'country'];
const countryLens = R.lens(R.path(countryPath), R.assocPath(countryPath));
const inCountry = R.curry((country, person) => R.equals(R.view(countryLens, person), country));

people.filter(inCountry('US')).map(console.log);

