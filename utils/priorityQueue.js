class PriorityQueue {
  constructor() {
    this.queue = [];
    this.counter = 0;
  }

  enqueue(item, priority) {
    this.queue.push({ item, priority, timestamp: this.counter++ });
  }

  dequeue(mode = "highest") {
    if (this.queue.length === 0) return null;
    return this._getElement(mode, true);
  }

  peek(mode = "highest") {
    if (this.queue.length === 0) return null;
    return this._getElement(mode, false);
  }

  _getElement(mode, remove) {
    let index = 0;
    if (mode === "highest") {
      index = this.queue.reduce(
        (bestIdx, el, i, arr) =>
          el.priority > arr[bestIdx].priority ? i : bestIdx,
        0
      );
    } else if (mode === "lowest") {
      index = this.queue.reduce(
        (bestIdx, el, i, arr) =>
          el.priority < arr[bestIdx].priority ? i : bestIdx,
        0
      );
    } else if (mode === "oldest") {
      index = this.queue.reduce(
        (oldestIdx, el, i, arr) =>
          el.timestamp < arr[oldestIdx].timestamp ? i : oldestIdx,
        0
      );
    } else if (mode === "newest") {
      index = this.queue.reduce(
        (newestIdx, el, i, arr) =>
          el.timestamp > arr[newestIdx].timestamp ? i : newestIdx,
        0
      );
    }

    const element = this.queue[index];
    if (remove) this.queue.splice(index, 1);
    return element.item;
  }
}

module.exports = { PriorityQueue };
