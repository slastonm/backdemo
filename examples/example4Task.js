// Bi-Directional Priority Queue (Task 4)
const { PriorityQueue } = require("./utils/priorityQueue");
const pq = new PriorityQueue();
pq.enqueue("Task A", 5);
pq.enqueue("Task B", 2);
pq.enqueue("Task C", 9);
pq.enqueue("Task D", 7);

console.log("Peek by priority:");
console.log("Highest:", pq.peek("highest")); // Task C
console.log("Lowest:", pq.peek("lowest")); // Task B

console.log("Peek by insertion:");
console.log("Oldest:", pq.peek("oldest")); // Task A
console.log("Newest:", pq.peek("newest")); // Task D

console.log("Dequeue operations:");
console.log("Dequeue highest:", pq.dequeue("highest")); // Task C
console.log("Dequeue oldest:", pq.dequeue("oldest")); // Task A

console.log("Remaining (peek highest):", pq.peek("highest"));
