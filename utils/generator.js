function* roundRobinGenerator(items) {
  let index = 0;
  while (true) {
    yield items[index];
    index = (index + 1) % items.length;
  }
}

async function consumeIteratorWithTimeout(iterator, timeoutSeconds) {
  const timeoutMs = timeoutSeconds * 1000;
  const start = Date.now();

  for await (const value of iterator) {
    console.log('Value:', value);

    if (typeof value === 'number') {
      consumeIteratorWithTimeout.sum = (consumeIteratorWithTimeout.sum || 0) + value;
      consumeIteratorWithTimeout.count = (consumeIteratorWithTimeout.count || 0) + 1;
      console.log('Sum:', consumeIteratorWithTimeout.sum);
      console.log('Average:', (consumeIteratorWithTimeout.sum / consumeIteratorWithTimeout.count).toFixed(2));
    }

    if (Date.now() - start > timeoutMs) {
      console.log(`Timeout ${timeoutSeconds}s reached. Stop consuming iterator.`);
      break;
    }

    await new Promise(r => setTimeout(r, 500));
  }
}

module.exports = {
  roundRobinGenerator,
  consumeIteratorWithTimeout,
};
