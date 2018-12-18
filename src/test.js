// 找到与给定的学生生活在统一国家的所有朋友
const curry = new Student('Haskell', 'Curry', '111-11-1111', 'Penn State');
curry.address = new Address('US');

const turing = new Student('Alan', 'Turing', '222-22-2222', 'Princeton');
turing.address = new Address('England');

const church = new Student('Alonzo', 'Church', '333-33-3333', 'Princeton');
church.address = new Address('US');

const kleene = new Student('Stephen', 'Kleene', '444-44-4444', 'Princeton');
kleene.address = new Address('US');

function selector(country, school) {
    return function (student) {
        return student.address.country === country && student.school === school;
    }
}

var findStudentsBy = function (friends, selector) {
    return friends.filter(selector);
}

const result = findStudentsBy([curry, turing, church, kleene], selector('US', 'Princeton'));
console.log(result);
