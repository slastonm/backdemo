//Demonstration of Generators and Timeout Iterator
const {
  roundRobinGenerator,
  consumeIteratorWithTimeout,
} = require("./utils/generator");
const {
  eventGenerator,
  collectEventsWithTimeout,
} = require("./utils/eventGenerator");

// 1. Round Robin Generator Demo
const rr = roundRobinGenerator(["A", "B", "C"]);
console.log("Round Robin Generator:");
for (let i = 0; i < 6; i++) {
  console.log(rr.next().value);
}

// 2.Event Generator with Timeout
const events = [
  { title: "Login", type: "auth" },
  { title: "Post Created", type: "forum" },
  { title: "Logout", type: "auth" },
];
const gen = eventGenerator(events);

console.log("Event Generator:");
collectEventsWithTimeout(gen, 2).then((result) => {
  console.log("Collected Events:", result);
});

// 3. Number Generator with Timeout (simulated)
async function* numberGenerator() {
  let i = 1;
  while (true) yield i++;
}
const numGen = numberGenerator();

console.log("Number Generator with timeout:");
consumeIteratorWithTimeout(numGen, 500).then(() => {
  const sum = consumeIteratorWithTimeout.sum || 0;
  const count = consumeIteratorWithTimeout.count || 0;
  console.log(
    `Total: ${sum}, Count: ${count}, Avg: ${(sum / count).toFixed(2)}`
  );
});
