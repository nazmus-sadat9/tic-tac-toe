import { WebSocketServer, WebSocket } from "ws";

function initWebSocketServer(server) {

  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Player joined.");

    ws.send(JSON.stringify({ message: "Connected to WebSocket" }));

    // incomming messages
    ws.on("message", (data) => {
      console.log("Received:", data.toString();
    });

    ws.on("close", () => {
      console.log("Player disconnected");
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  });

  return wss;
}

export default initWebSocketServer;
