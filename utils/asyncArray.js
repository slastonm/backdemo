function asyncMap(array, asyncFn, options = {}) {
  const { signal } = options;
  return Promise.all(
    array.map(async (item, index) => {
      if (signal?.aborted) {
        throw new Error("Operation was aborted");
      }
      return await asyncFn(item, index);
    })
  );
}

function asyncMapCallback(array, asyncFn, finalCallback) {
  let result = [];
  let completed = 0;
  let hasError = false;

  if (array.length === 0) {
    finalCallback(null, []);
    return;
  }

  array.forEach((item, index) => {
    asyncFn(item, index, (err, data) => {
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

function asyncMapAbortable(array, asyncFn, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("aborted"));
      return;
    }

    const abortHandler = () => reject(new Error("aborted"));
    signal?.addEventListener("abort", abortHandler);

    asyncMap(array, asyncFn, { signal })
      .then((result) => {
        signal?.removeEventListener("abort", abortHandler);
        resolve(result);
      })
      .catch((error) => {
        signal?.removeEventListener("abort", abortHandler);
        reject(error);
      });
  });
}

module.exports = { asyncMap, asyncMapCallback, asyncMapAbortable };
