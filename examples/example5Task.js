// Task 5: Async Array Function

const {
  asyncMap,
  asyncMapCallback,
  asyncMapAbortable,
} = require("./utils/asyncArray");

function simulateAsyncOperation(value, delay = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (typeof value === "number" && value < 0) {
        reject(new Error(`Negative value: ${value}`));
      } else {
        resolve(value * 2);
      }
    }, delay);
  });
}

function simulateAsyncOperationCallback(value, index, callback) {
  setTimeout(() => {
    if (typeof value === "number" && value < 0) {
      callback(new Error(`Negative value: ${value}`));
    } else {
      callback(null, value * 2);
    }
  }, 1000);
}

async function demoAsyncAwait() {
  console.log("Async/Await з Promise версією");
  const numbers = [1, 2, 3, 4, 5];
  try {
    const results = await asyncMap(numbers, simulateAsyncOperation);
    console.log("Результат:", results);
  } catch (error) {
    console.error("Помилка:", error.message);
  }
}

function demoCallback() {
  console.log("Callback версія");
  const words = ["async", "map", "is", "cool"];
  asyncMapCallback(
    words,
    (str, index, cb) => {
      setTimeout(() => cb(null, str.toUpperCase()), 500);
    },
    (err, results) => {
      if (err) {
        console.error("Callback error:", err.message);
      } else {
        console.log("Callback result:", results);
      }
    }
  );
}

async function demoWithAbortController() {
  console.log("Скасування операції");
  const controller = new AbortController();
  const numbers = [1, 2, 3, 4, 5];
  setTimeout(() => controller.abort(), 2000);

  try {
    const results = await asyncMapAbortable(
      numbers,
      simulateAsyncOperation,
      controller.signal
    );
    console.log("Результат:", results);
  } catch (error) {
    console.log("Abort:", error.message);
  }
}

async function demoErrorHandling() {
  console.log("бробка помилок");
  const numbers = [1, -2, 3];
  try {
    const results = await asyncMap(numbers, simulateAsyncOperation);
    console.log("Результат:", results);
  } catch (error) {
    console.log("Помилка:", error.message);
  }
}

function demoPromiseChaining() {
  console.log("Promise chaining");
  const numbers = [10, 20, 30];
  asyncMap(numbers, simulateAsyncOperation)
    .then((results) => console.log("Promise result:", results))
    .catch((error) => console.error("Error:", error.message));
}

async function runAllDemos() {
  await demoAsyncAwait();
  demoCallback();
  await demoWithAbortController();
  await demoErrorHandling();
  demoPromiseChaining();
}

runAllDemos();
