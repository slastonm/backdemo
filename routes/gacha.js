const router = require('express').Router();
const GachaCounter = require('../models/GachaCounter');
const { memoize } = require('../utils/memorizer');
const { log } = require('../utils/logger');


const getUserPulls = log({
  level: 'INFO',
  logTo: 'logger',
  profile: true,
  condition: (type) => type !== 'DEBUG'
})(async function getUserPulls(userId) {
  return await GachaCounter.find({ userId }).lean();
});


const memoizedGetUserPulls = memoize(getUserPulls, {
  maxSize: 500,
  evictionPolicy: 'LFU',
  maxAge: 1000 * 60 * 60 * 24 * 90
});


router.post('/add', async (req, res) => {
  const { userId, name, banner, pull } = req.body;
  if (!userId || !name || !banner || !pull) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newEntry = new GachaCounter({ userId, name, banner, pull });
  await newEntry.save();


  memoizedGetUserPulls.clear?.([userId]);

  res.status(201).json({ message: 'Saved!' });
});


router.get('/my/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const pulls = await memoizedGetUserPulls(userId);
    res.json(pulls);
  } catch (err) {
    console.error('Gacha fetch error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;