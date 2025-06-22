// Безкінечний генератор подій із циклічним перебором
function* eventGenerator(events) {
  let index = 0;
  while (true) {
    yield events[index];
    index = (index + 1) % events.length;
  }
}

// Тайм-аутний ітератор — видає події протягом N секунд
async function collectEventsWithTimeout(generator, timeoutSeconds) {
  const result = [];
  const timeoutMs = timeoutSeconds * 1000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const next = generator.next();
    if (next.done) break;
    result.push(next.value);
    await new Promise((r) => setTimeout(r, 500));
  }

  return result;
}

module.exports = {
  eventGenerator,
  collectEventsWithTimeout,
};
