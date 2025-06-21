const EventEmitter = require('events');

class ForumEventBus extends EventEmitter {}

const forumEvents = new ForumEventBus();

module.exports = forumEvents;