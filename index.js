import express from 'express';
import http from 'node:http';
import createBareServer from "@tomphttp/bare-server-node";
import path from 'node:path';
import cors from 'cors';

const express = require('express');
const app = express()
const dir = __dirname + "/static/"

app.get("/", (req, res) => {
res.sendFile(dir + "index.html")
})

app.get("/p", (req, res) => {
if(req.query.password === process.env.PASSWORD) {
res.sendFile(dir + "home.html")
} else {
  res.sendFile(dir + "index.html")
}
})

app.listen(process.env.PORT)

const __dirname = process.cwd();
const server = http.createServer();
const app = express(server);
const bareServer = createBareServer('/outerspace/');
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'static')));

const routes = [
  { path: '/', file: 'home.html' },
  { path: '/news', file: 'apps.html' },
  { path: '/algebra', file: 'games.html' },
  { path: '/diagnostic', file: 'settings.html' },
  { path: '/tabs', file: 'tabs.html' },
  { path: '/go', file: 'go.html' },
  { path: '/loading', file: 'loading.html' },
  { path: '/books', file: 'book.html' },
  { path: '/ex', file: 'money.html' },
    { path: '/us', file: 'people.html' },
      { path: '/don', file: 'donate.html' },

];

app.get('/edu/*', cors({ origin: false }), async (req, res, next) => {
  try {
    const reqTarget = `https://raw.githubusercontent.com/InterstellarNetwork/Interstellar-Assets/main/${req.params[0]}`;
    const asset = await fetch(reqTarget);
    
    if (asset.ok) {
      const data = await asset.arrayBuffer();
      res.end(Buffer.from(data));
    } else {
      next();
    }
  } catch (error) {
    console.error('Error fetching:', error);
    next(error);
  }
});

routes.forEach((route) => {
  app.get(route.path, (req, res) => {
    res.sendFile(path.join(__dirname, 'static', route.file));
  });
});

server.on('request', (req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on('upgrade', (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

server.on('listening', () => {
  console.log(`Running at http://localhost:${PORT}`);
});

server.listen({
  port: PORT,
});
