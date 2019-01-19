/**
 * Monadic 链式调用与组合
 */
const find = (array, path, value) => {
  const l = R.lens(R.path(path), R.assocPath(path));
  return R.head(array.filter(val => R.view(l, val) === value));
};
// safeFindObject :: Store, string -> Either(Object)
const safeFindObj4 = R.curry((array, path, value) => {
  // return Either.fromNullable(find(array, path, value)) // .getOrElseThrow(`Object not found with ID: ${value}`)
  const obj = find(array, path, value);
  return  obj ? Either.right(obj) : Either.left(`Object not found with ID: ${value}`);
});

const validLength = (param, str) => str.length === param; // 检查字符串长度

// checkLengthSsn :: String -> Either(String)
// const checkLengthSsn = ssn => Either.of(ssn).filter(_.bind(validLength, undefined, 11)) // .getOrElseThrow(`Input: ${ssn} is not a valid SSN number`);
const checkLengthSsn = ssn => {
  const result = Either.of(ssn).filter(_.bind(validLength, undefined, 11)).getOrElse();
  return result ? Either.right(result) : Either.left(`Input: ${ssn} is not a valid SSN number`);
}

const cleanInput = R.compose(R.identity, trim);

const safeFindStudent4 = safeFindObj4(people, ['ssn']);

// csv :: Array => String
const csv = arr => arr.join(',');

// For unit testing purposes, this could be replaced with R.tap	
const append = R.curry(function (elementId, info) {
  console.log('Simulating effect. Appending: ' + info)
  return info;
});

const getOrElse = R.curry((message, container) => container.getOrElse(message));

// map :: (ObjectA -> ObjectB), Monad -> Monad[ObjectB]
const map = R.curry((f, container) => container.map(f));
// chain :: (ObjectA -> ObjectB), M -> ObjectB
const chain = R.curry((f, container) => container.chain(f));

const lift = R.curry((f, obj) => Either.fromNullable(f(obj)));

const liftIO = val => IO.of(val);

const trace = R.curry((msg, obj) => console.log(msg, ' : ', obj));

const debugLog = info => console.log('debugLog: ', info);
const debug = _.partial(debugLog, _);

const showStudent = (ssn) =>
                      Maybe.fromNullable(ssn)
                        .map(cleanInput)
                        .chain(checkLengthSsn)
                        .chain(safeFindStudent4)
                        .map(R.props(['ssn', 'firstname', 'lastname']))
                        .map(csv)
                        .map(append('#student-info'))  //-> Using R.tap to simulate the side effect (in the book we write to the DOM)

const result = showStudent('444-44-4444').orElse(debug);
console.log('result:', result); // Right(444-44-4444,Stephen,Kleene)

const result2 = showStudent('xxx-xx-xxxx').orElse(debug);
console.log('result2:', result2); 
// -> debugLog:  Object not found with ID: xxx-xx-xxxx
// -> result2: undefined

const errorResult = showStudent('444-44').orElse(debug);
console.log('errorResult:', errorResult); 
// -> debugLog:  Input: 444-44 is not a valid SSN number
// -> errorResult: undefined


const showStudent2 = R.compose(
  map(append('#student-info')),
  liftIO,
  getOrElse('unable to find student'),
  map(csv),
  map(R.props(['ssn', 'firstname', 'lastname'])),
  chain(safeFindStudent4),
  chain(checkLengthSsn),
  lift(cleanInput)
);

const result3 = showStudent2('333-33-3333').run();
console.log(result3);
// -> Simulating effect. Appending: 333-33-3333,Alonzo,Church
// -> 333-33-3333,Alonzo,Church

const result4 = showStudent2('xxx-xx-xxxx').run();
console.log(result4); 
// -> Simulating effect. Appending: unable to find student
// -> unable to find student
