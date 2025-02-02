require("dotenv").config();
require("express-async-errors");

const EventEmitter = require("events");
EventEmitter.defaultMaxListeners = 20;

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const connectDB = require("./config/connect");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const authMiddleware = require("./middleware/authentication");

// Routers
const authRouter = require("./routes/auth");
const rideRouter = require("./routes/ride");
const profileRouter = require("./routes/profile");
const bookingRouter = require('./routes/booking')
const applicationRouter = require('./routes/application')
// const collectionRouter = require("./routes/collection")
// Import socket handler
const handleSocketConnection = require("./controllers/sockets");

const app = express();
app.use(express.json());

const server = http.createServer(app);

const io = socketIo(server, { cors: { origin: "*" } });

// Attach the WebSocket instance to the request object
app.use((req, res, next) => {
  req.io = io;
  return next();
});

const uri =
  "mongodb+srv://vijaymarka:admin123@cluster0.ivjiolu.mongodb.net/rapido?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Initialize the WebSocket handling logic
handleSocketConnection(io);

// Routes
app.use("/auth", authRouter);
// app.use("/data", collections);
app.use("/ride", authMiddleware, rideRouter);
app.use("/profile", profileRouter);
app.use("/bookings", bookingRouter);
app.use("/applications", applicationRouter);

app.get("/collections", async (req, res) => {
  try {
    const categoriesPromise = db
      .collection("categories")
      .find({ status: true })
      .toArray();
    const citiesPromise = db
      .collection("cities")
      .find({ status: true })
      .toArray();
    const classesPromise = db.collection("classes").find().toArray();
    const subjectsPromise = db.collection("subjects").find().toArray();
    const pincodePromise = db.collection("pincodes").find().toArray();

    // Wait for all promises to resolve
    const [categories, cities, classes, subjects, pincodes] = await Promise.all(
      [
        categoriesPromise,
        citiesPromise,
        classesPromise,
        subjectsPromise,
        pincodePromise,
      ]
    );

    // Send the combined results
    res.json({
      categories,
      cities,
      classes,
      subjects,
      pincodes,
    });
  } catch (error) {
    res
      .status(500)
      .send({ error: "An error occurred while fetching the collections" });
  }
});

// Middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    // Uncomment this and comment below one if you want to run on ip address so that you can
    // access api in physical device

    // server.listen(process.env.PORT || 3000, "0.0.0.0", () =>
    server.listen(process.env.PORT || 3000, () =>
      console.log(
        `HTTP server is running on port http://localhost:${
          process.env.PORT || 3000
        }`
      )
    );
  } catch (error) {
    console.log(error);
  }
};

start();
