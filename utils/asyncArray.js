function asyncMap(array, asyncFn) {
  return Promise.all(array.map(asyncFn));
}

// Callback-based версія
function asyncMapCallback(array, asyncFn, finalCallback) {
  let result = [];
  let completed = 0;
  let hasError = false;

  array.forEach((item, index) => {
    asyncFn(item, (err, data) => {
      if (hasError) return;
      if (err) {
        hasError = true;
        finalCallback(err);
        return;
      }
      result[index] = data;
      completed++;
      if (completed === array.length) {
        finalCallback(null, result);
      }
    });
  });
}

module.exports = { asyncMap, asyncMapCallback };
