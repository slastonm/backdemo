// examples/proxyTest.js

const {
  createAuthProxy,
  createSimpleAuthProxy,
} = require("../utils/authProxy");

async function runAdvancedProxyExample() {
  const proxy = createAuthProxy({
    type: "Bearer",
    token: "1234567890",
    baseURL: "https://jsonplaceholder.typicode.com",
    logRequests: true,
  });

  try {
    const res = await proxy.fetch("/todos/1"); // baseURL + /todos/1
    const data = await res.json();
    console.log("Data from API:", data);
  } catch (err) {
    console.error("Error during proxy fetch:", err.message);
  }
}

async function runSimpleProxyExample() {
  const proxyFetch = createSimpleAuthProxy({
    type: "Bearer",
    token: "test-token",
  });

  try {
    const response = await proxyFetch(
      "https://jsonplaceholder.typicode.com/todos/2"
    );
    const data = await response.json();
    console.log("Data from API:", data);
  } catch (err) {
    console.error("SimpleProxy error:", err.message);
  }
}

(async () => {
  await runAdvancedProxyExample();
  await runSimpleProxyExample();
})();
