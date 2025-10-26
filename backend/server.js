import app from "./src/app.js";
import connectDB from "./src/db/db.js";
import { connectRabbitMQ } from "./src/broker/rabbit.js";
import startListener from "./src/broker/listener.js";

connectRabbitMQ().then(() => {
  startListener();
});

connectDB();

app.listen(3000, () => {
  console.log("Auth server is running on port 3000");
});
