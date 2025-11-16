// server.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const https = require('https');

const app = express();

// adjust filenames if yours differ
const options = {
  key: fs.readFileSync(path.join(__dirname, 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'server.cert')),
};

// store latest motion sample in memory
let latestMotion = null;

// body parser for JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// PHONE → send motion
app.post('/motion', (req, res) => {
  latestMotion = {
    x: req.body.x || 0,
    y: req.body.y || 0,
    z: req.body.z || 0,
    t: Date.now(),
  };
  // console.log('[SERVER] motion update', latestMotion);
  res.json({ ok: true });
});

// LAPTOP → ask for latest motion
app.get('/motion', (req, res) => {
  if (!latestMotion) {
    return res.json({ x: 0, y: 0, z: 0, t: null });
  }
  res.json(latestMotion);
});

const server = https.createServer(options, app);
const PORT = 8080;

server.listen(PORT, () => {
  console.log(`[SERVER] HTTPS on https://192.168.4.188:${PORT}`);
});