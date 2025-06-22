const { memoize } = require("../utils/memorizer");

function expensiveCalculation(n) {
  console.log(`Calculation ${n}`);
  let result = 0;
  for (let i = 0; i < n * 1000000; i++) {
    result += i;
  }
  return result;
}

const memoizedCalc = memoize(expensiveCalculation, {
  maxSize: 10,
  maxAge: 1000 * 60,
  evictionPolicy: "LRU",
});

console.log(memoizedCalc(5)); // 1
console.log(memoizedCalc(5)); // 2 cash
console.log(memoizedCalc.cache.stats()); //
