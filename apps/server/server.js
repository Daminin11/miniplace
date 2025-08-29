const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let pixels = {}; // { "x,y": "#FFFFFF" }

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "init", pixels }));

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type === "pixel") {
        const key = `${data.x},${data.y}`;
        pixels[key] = data.color;
        // Broadcast
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "pixel", x: data.x, y: data.y, color: data.color }));
          }
        });
      }
    } catch (e) { console.error(e); }
  });
});

server.listen(3001, () => console.log("Server on http://localhost:3001"));
