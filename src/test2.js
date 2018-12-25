/**
 * 写时复制对象，每次调用时返回一个新对象
 */
/* example 1  */
var person = new Person ('Alonzo','Church','444-44-4444');
var lastnameLens = R.lensProp('lastname');

var result = R.view(lastnameLens, person);
console.log('person 的 lastname 属性值是 ', result);


/* example 2  */
var newPerson = R.set(lastnameLens, 'Mourning', person);
console.log('newPerson 的 lastname 属性值是 ', newPerson.lastname, ', person 的 lastname 属性值是 ', person.lastname);
console.log('newPerson：', newPerson);


/* example 3  
Lenses 支持嵌套属性
*/
person.address = new Address('US', 'NJ', 'Princeton', zipCode('08544', '1234'), 'Alexander St.');

// 创建一个包装了 address.zip 属性的 Lens
var zipPath = ['address', 'zip'];
var zipLens = R.lens(R.path(zipPath), R.assocPath(zipPath));
var zipCodeResult = R.view(zipLens, person);
console.log(zipCodeResult);

/* example 4 */
var thirdPerson = R.set(zipLens, zipCode('90210','5678'), person);

console.log(`thirdPerson 的 zip 属性值是: ${R.view(zipLens, thirdPerson)}`);
console.log(`person 的 zip 属性值是: ${R.view(zipLens, person)}`);
console.log(thirdPerson !== person);
