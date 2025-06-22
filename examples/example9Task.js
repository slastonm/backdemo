const { log } = require("../utils/logger");

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

function crash() {
  throw new Error("Simulated failure");
}

function conditionalLog(a) {
  return a * 2;
}

const loggedMultiply = log({
  level: "INFO",
  structured: true,
  profile: true,
})({}, "multiply", { value: multiply }).value;

const loggedDivide = log({
  level: "DEBUG",
  formatter: (entry) =>
    `[${entry.timestamp}] ${entry.function} returned ${entry.result}`,
})({}, "divide", { value: divide }).value;

const loggedCrash = log({
  level: "ERROR",
})({}, "crash", { value: crash }).value;

const loggedConditionalLog = log({
  level: "INFO",
  condition: (lvl, entry) => entry.args[0] > 10,
})({}, "conditionalLog", { value: conditionalLog }).value;

try {
  console.log("=== Testing logged functions ===");

  console.log("Multiply:", loggedMultiply(5, 6));
  console.log("Divide:", loggedDivide(12, 3));
  console.log("Conditional (5):", loggedConditionalLog(5)); // не залогується
  console.log("Conditional (15):", loggedConditionalLog(15)); // залогується

  console.log("\n=== Testing error handling ===");
  loggedCrash(); // залогує помилку
} catch (err) {
  console.error("Caught error:", err.message);
}

module.exports = {
  loggedMultiply,
  loggedDivide,
  loggedCrash,
  loggedConditionalLog,
};
