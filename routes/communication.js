const express = require("express");
const EventEmitter = require("events");
const router = express.Router();

// Створюємо глобальний message hub
const messageHub = new EventEmitter();

// Зберігаємо активні з'єднання для управління
const activeConnections = new Map();

// SSE endpoint для отримання подій
router.get("/stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  const clientId = Date.now() + Math.random();

  res.write(
    `data: ${JSON.stringify({
      type: "connection",
      message: "Connected to event stream",
      clientId,
    })}`
  );

  const onUserMessage = (data) => {
    res.write(
      `data: ${JSON.stringify({
        type: "userMessage",
        ...data,
        timestamp: new Date().toISOString(),
      })}`
    );
  };

  const onSystemAlert = (data) => {
    res.write(
      `data: ${JSON.stringify({
        type: "systemAlert",
        ...data,
        timestamp: new Date().toISOString(),
      })}`
    );
  };

  const onNotification = (data) => {
    res.write(
      `data: ${JSON.stringify({
        type: "notification",
        ...data,
        timestamp: new Date().toISOString(),
      })}`
    );
  };

  const onBroadcast = (data) => {
    res.write(
      `data: ${JSON.stringify({
        type: "broadcast",
        ...data,
        timestamp: new Date().toISOString(),
      })}`
    );
  };

  messageHub.on("userMessage", onUserMessage);
  messageHub.on("systemAlert", onSystemAlert);
  messageHub.on("notification", onNotification);
  messageHub.on("broadcast", onBroadcast);

  // Зберігаємо інформацію про з'єднання
  activeConnections.set(clientId, {
    response: res,
    listeners: {
      userMessage: onUserMessage,
      systemAlert: onSystemAlert,
      notification: onNotification,
      broadcast: onBroadcast,
    },
  });

  req.on("close", () => {
    console.log(`Client ${clientId} disconnected`);
    messageHub.removeListener("userMessage", onUserMessage);
    messageHub.removeListener("systemAlert", onSystemAlert);
    messageHub.removeListener("notification", onNotification);
    messageHub.removeListener("broadcast", onBroadcast);
    activeConnections.delete(clientId);
  });

  req.on("error", (err) => {
    console.error(`SSE connection error for client ${clientId}:`, err);
    activeConnections.delete(clientId);
  });
});

// Endpoint для відправки повідомлень користувача
router.post("/send/user", (req, res) => {
  const { message, userId, username } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const eventData = {
    message,
    userId: userId || "anonymous",
    username: username || "Anonymous",
    id: Date.now(),
  };

  // Емітимо подію - всі підписники отримають її
  messageHub.emit("userMessage", eventData);

  res.json({
    status: "sent",
    eventType: "userMessage",
    data: eventData,
  });
});

// Endpoint для системних сповіщень
router.post("/send/alert", (req, res) => {
  const { message, level, source } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const eventData = {
    message,
    level: level || "info", // info, warning, error
    source: source || "system",
    id: Date.now(),
  };

  messageHub.emit("systemAlert", eventData);

  res.json({
    status: "sent",
    eventType: "systemAlert",
    data: eventData,
  });
});

// Endpoint для нотифікацій
router.post("/send/notification", (req, res) => {
  const { title, message, userId } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: "Title and message are required" });
  }

  const eventData = {
    title,
    message,
    userId,
    id: Date.now(),
  };

  messageHub.emit("notification", eventData);

  res.json({
    status: "sent",
    eventType: "notification",
    data: eventData,
  });
});

// Endpoint для broadcast повідомлень (всім користувачам)
router.post("/send/broadcast", (req, res) => {
  const { message, title, priority } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const eventData = {
    message,
    title: title || "Broadcast",
    priority: priority || "normal", // low, normal, high
    id: Date.now(),
  };

  messageHub.emit("broadcast", eventData);

  res.json({
    status: "sent",
    eventType: "broadcast",
    data: eventData,
  });
});

// Endpoint для отримання статистики активних з'єднань
router.get("/stats", (req, res) => {
  res.json({
    activeConnections: activeConnections.size,
    totalListeners:
      messageHub.listenerCount("userMessage") +
      messageHub.listenerCount("systemAlert") +
      messageHub.listenerCount("notification") +
      messageHub.listenerCount("broadcast"),
    eventTypes: ["userMessage", "systemAlert", "notification", "broadcast"],
  });
});

// тестування
router.post("/test", (req, res) => {
  const testEvents = [
    {
      type: "userMessage",
      data: {
        message: "Test user message",
        userId: "test",
        username: "TestUser",
      },
    },
    {
      type: "systemAlert",
      data: { message: "Test system alert", level: "info", source: "test" },
    },
    {
      type: "notification",
      data: {
        title: "Test Notification",
        message: "This is a test notification",
      },
    },
    {
      type: "broadcast",
      data: { message: "Test broadcast message", title: "Test Broadcast" },
    },
  ];

  const randomEvent = testEvents[Math.floor(Math.random() * testEvents.length)];
  messageHub.emit(randomEvent.type, { ...randomEvent.data, id: Date.now() });

  res.json({
    status: "test event sent",
    eventType: randomEvent.type,
    data: randomEvent.data,
  });
});

module.exports = router;
