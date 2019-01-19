/**
 * 异步
 */

/**
 * 命令式
 */ 
// 使用原生集 XMLHttpRequest 函数实现的 getJSON
const getJSON = function (url, success, error) {
   const req = new XMLHttpRequest();
   req.responseType = 'json';
   req.open('GET', url);

   req.onload = () => {
     if(req.status === 200) {
       const data = JSON.parse(req.responseText);
       success(data);
     } else {
      req.error();
     }
   }

   req.onerror = () => {
    if(error) {
      error(new Error(req.statusText));
    }
   }

   req.send();
};

/**
 * 嵌套的 JSON 调用，分别有自己的成功和错误回调
 * 实现需求：从服务器获取学生列表后，获取居住在美国的学生的成绩，并将学生信息按 SSN 排序显示在 HTML 页面上
 */ 
// 第一层嵌套，用于包含成功和失败回调的 AJAX 请求
getJSON('/students', students => {
  students.sort((a, b) => {
    if(a.ssn < b.ssn) return -1;
    if(a.ssn > b.ssn) return 1;
    return 0;
  });

  // 第二层嵌套
  for(let i = 0; i < students.length; i++) {
    const student = students[i];
    if(student.address.country === 'US') {
      getJSON(`/students/${student.ssn}/grades`, 
        grades => showStudents(student, average(grades)),  // 注意：（函数的闭包不是其封闭环境的一个副本，而是实际的引用）此处的 student 是最后一个学生对象的引用，并非该次循环对应的学生
        error => console.log(error.message)
      );
    }
  }

  // 解决第二层嵌套中 student 对象引用导致的问题（将 student 对象放入产生 AJAX 请求的函数中）
  // 使用柯里化将该函数转化为一元函数
  // appendData 函数用来将行信息添加到 HTML 表格中
  // const showStudentsGrades = R.curry((student, grades) => appendData(student, average(grades)));

  // const handleError = error => console.log(error.message);

  // const processStudent = student => {
  //   if(student.address.country === 'US') {
  //     getJSON(`/students/${student.ssn}/grades`, showStudentsGrades(student), handleError); 
  //   }
  // };

  // for(let i = 0; i < students.length; i++) {
  //   processStudent(students[i]);
  // }


}, error => console.log(error.message));

// 实现：按照 SSN 从服务器检索学生记录
// 用户输入和 AJAX 调用交织在一起，这种一系列的回调使代码形成回调地狱
// 程序依赖于间距和句法组织来提高可读性
const _selector = document.querySelector;
_selector('#search-button').addEventListener('click', event => {
  event.preventDefault();

  const ssn = _selector('#student-ssn').value;

  if(!ssn) {
    console.log('WARN: Valid SSN needed!');
    return;
  } else {
    getJSON(`/students/${ssn}`, info => {
      _selector('#student-info').innerHTML = info;
      _selector('#student-info').addEventListener('mouseover', () => {
        getJSON(`/students/${info.ssn}/grades`, grades => {
          console.log(grades);
        })
      })
    }).fail(() => console.log('Error occurred!'));
  }
});

/**
 * 持续传递式样 CPS
 * 将程序分成单个组件（内部回调 -> 单独的函数或 lambda 表达式）
 * 提高了函数在上下文堆栈方面的效率，如程序完全在 CPS 中，持续计算会清除当前函数的上下文，并准备一个新的函数来支持程序流程的功能----每个函数基本上都是尾部调用形式
 * 打破代码中的时间依懒性，并将异步流程伪装为线性的函数求值
 */
const _selector2 = document.querySelector;

const processGrades = grades => console.log(grades);

const handleMouseMovement = () => getJSON(`/students/${info.ssn}/grades`, processGrades);

const showStudents2 = info => {
  _selector2('#student-info').innerHTML = info;
  _selector2('#student-info').addEventListener('mouseover', handleMouseMovement);
}

const handleError = error => console.log('Error occurred' + error.message);

const handleClickEvent = event => {
  event.preventDefault();

  const ssn = _selector('#student-ssn').value;
  
    if(!ssn) {
      console.log('WARN: Valid SSN needed!');
      return;
    } else {
      getJSON(`/students/${ssn}`, showStudents2).fail(handleError);
    }
};

_selector2('#search-button').addEventListener('click', handleClickEvent);



/**
 * Promise 化
 * 隐藏异步工作流，强调 then 的时间概念
 * 位置透明度
 * 具有 point-free 样式
 */
// 重写 getJSON
const getJSON2 = url => new Promise((resolve, reject) => {
  const req = new XMLHttpRequest();
  req.responseType = 'json';
  req.open('GET', url);

  req.onload = () => {
    if(req.status === 200) {
      const data = JSON.parse(req.responseText);
      resolve(data);
    } else {
     reject(new Error(req.statusText));
    }
  }

  req.onerror = () => {
   if(reject) {
    reject(new Error('IO Error'));
   }
  }

  req.send();
});


getJSON2('/students')
  .then(
    students => console.log(R.map(student => student.name, students)),
    error => console.log(error.message)
  );

getJSON2('/students')
  .then(R.tap(() => console.log('Hiding spinner')))
  .then(R.filter(s => s.address.country === 'US'))
  .then(R.sortBy(R.prop('ssn')))
  .then(R.map(student => {
    return getJSON2('/grades/ssn=' + student.ssn)
            .then(R.compose(Math.ceil, forkJoin(R.divide, R.sum, R.length))) // 使用函数式组合子和 Ramda 函数来计算平均值
            .then(grade => IO.of(R.merge(student, {'grade': grade})) // 使用 IO Monad 将学生和成绩信息添加到 DOM 中
                              .map(R.prop(['ssn', 'firstname', 'lastname', 'grade']))
                              .map(csv)
                              .map(append('#student-info'))
                              .run());
  }))
  .catch(error => console.log('Error occurred: ' + error.message));


// 组合同步和异步行为
const find = (db, ssn) => {
  const trans = db.transaction(['students'], 'readonly');
  const store = trans.objectStore('students');
  return new Promise((resolve, reject) => {
    const request = store.get(ssn);
    request.onerror = () => {
      if(reject) {
        reject(new Error('Student not found!'));
      }
    }

    request.onsuccess = () => {
      resolve(request.result);
    }
  })
}

const fetchStudentDBAsync = R.curry((db, ssn) => find(db, ssn));

const findStudentAsync = fetchStudentDBAsync(db);

const then = R.curry((f, thenable) => thenable.then(f));

const catchP = R.curry((f, promise) => promise.catch(f));

const errorLog = info => console.log('errorLog: ', info);

// const errorLog = _.partial(log);

const showStudentAsync = R.compose(
  // 捕获所有错误
  catchP(errorLog), 
  // then 等价于 Monad 的 map 方法
  then(append('#student-info')),
  then(csv),
  then(R.prop(['ssn', 'firstname', 'lastname', 'grade'])),
  // 将同步操作与异步操作相链接的关键点
  chain(findStudentAsync),
  map(checkLengthSsn),
  lift(cleanInput)
);

// 
Rx.Observable.fromEvent(document.querySelector('#student-ssn'), 'change')
  .map(x => x.target.value) // 提取出事件对象中的值
  .map(cleanInput)
  .map(checkLengthSsn)
  .subscribe(ssn => ssn.isRight ? console.log('Valid') : console.log('Invalid')); // 检查验证后的输出时 Either.Right 还是 Either.Left，从而确定是否合法

Rx.Observable.fromPromise(getJSON('/student'))
  .map(R.sortBy(R.compose(R.toLower, R.prop('firstname')))) // 不区分大小写的根据名字对所有学生对象排序
  .flatMapLatest(student => Rx.Observable.from(student)) // 将学生对象数组转化为可观测的学生序列
  .filter(R.pathEq(['address', 'country'], 'US')) // 过滤不在美国的学生
  .subscribe( // 打印结果
    student => console.log(student.fullname),
    error => console.log(error)
  );
















 