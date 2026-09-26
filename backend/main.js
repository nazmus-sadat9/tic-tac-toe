import dotenv from "dotenv";
import http from "http";
import app from "./src/app.js";
import { initSocket } from "./src/webSockets/socket.js";

dotenv.config();

const PORT = process.env.PORT || 8080;

// wrap the app using http
const server = http.createServer(app);

initSocket(server);

// run the server
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
});

