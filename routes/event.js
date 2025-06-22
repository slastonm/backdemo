const express = require("express");
const router = express.Router();
const {
  eventGenerator,
  collectEventsWithTimeout,
} = require("../utils/eventGenerator");

const events = [
  {
    start: "2025.05.29",
    end: "2025.07.03",
    title: "The main part of the “Folie et Déraison” event is now open.",
    priority: 10,
  },
  {
    start: "2025.05.29",
    end: "2025.06.19",
    title: "Character banner “A Writing Writer Written” available.",
    priority: 7,
  },
  {
    start: "2025.05.29",
    end: "2025.06.19",
    title: "“Dialogues behind bars |” is now open.",
    priority: 6,
  },
  {
    start: "2025.05.29",
    end: "2025.06.19",
    title: "“Ruinas Gloriosas y Directices de Metáforas” is open.",
    priority: 5,
  },
  {
    start: "2025.06.03",
    end: "2025.07.03",
    title: "“Mane Bulletin” event is open.",
    priority: 6,
  },
  {
    start: "2025.06.05",
    end: "2025.06.19",
    title: "“Bette: The last film” event is open.",
    priority: 9,
  },
  {
    start: "2025.06.19",
    end: "2025.07.03",
    title: "Character banner “The Shattered Product” available.",
    priority: 7,
  },
  {
    start: "2025.06.19",
    end: null,
    title:
      "“The Answering Machine, The Butterfly and The Literaly Critic” is open.",
    priority: 4,
  },
  {
    start: "2025.06.20",
    end: "2025.07.03",
    title: "The rerun of event “Farewell, Rayashki” is open.",
    priority: 6,
  },
  {
    start: "2025.06.28",
    end: "2025.07.03",
    title: "Event “Labs Snapshots” is open.",
    priority: 3,
  },
  {
    start: "2025.06.19",
    end: "2025.07.03",
    title: "“Dialogues behind bars ||” is open.",
    priority: 8,
  },
];

// /generator/events?duration=5
router.get("/events", async (req, res) => {
  const duration = parseInt(req.query.duration) || 5;
  const gen = eventGenerator(events);
  const collected = await collectEventsWithTimeout(gen, duration);
  res.json({ duration, collected });
});

module.exports = router;
