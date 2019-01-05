/**
 * 工具方法
 * 
 */
const fullname = p => p.firstname + ' ' + p.lastname;

const isValid = val => !(_.isUndefined(val) || _.isNull(val));

// trim :: string -> string
const trim = str => str.replace(/^\s*|\s*$/g, '');

// normalize :: string -> string
const normalize = str => str.replace(/\-/g, '');
