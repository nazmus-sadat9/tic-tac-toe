import http from "http";
import app from "./src/app.js";
import initWebSocket from "./src/webSockets/socket.js";

const PORT = process.env.PORT || 8080;

// wrap the app using http
const server = http.createServer(app);
initWebSocketServer(server);

// run the server
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
});

