// 找到与给定的学生生活在同一国家的所有朋友
function selector(country, school) {
    return function (student) {
        return student.address.country === country && student.school === school;
    }
}

var findStudentsBy = function (friends, selector) {
    return friends.filter(selector);
}

const result = findStudentsBy(people, selector('US', 'Princeton'));
console.log(result);
