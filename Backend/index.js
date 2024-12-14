const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const PORT = 5000;

let users = {};
let offlineMessages = {};
let chatHistories = {};

io.on("connection", (socket) => {
  console.log("New user connected: ", socket.id);

  // Saving users on the Sign up
  socket.on("register", ({ name, email, number }) => {
    socket.name = name;
    // checking if user with same name exist
    if (name in users) {
      console.log(name);
      users[name]["online"] = true;
      userId = users[name]["id"];

      if (offlineMessages[userId]) {
        offlineMessages[userId].forEach((message) => {
          io.to(socket.id).emit("receive_message", message);
        });
        delete offlineMessages[userId];
        users[name]["id"] = socket.id;
        socket.emit("registered", users[name]);
        console.log(`User ${name} updated with socket ${socket.id}`);
        console.log("All users:", users);
      }
    } else {
      users[name] = {
        id: socket.id,
        name,
        email,
        number,
        online: true,
      };

      console.log(`User ${name} registered with socket ${socket.id}`);
      console.log("All users:", users);
      socket.emit("registered", users[name]);
      // updated all users to show new user to chat with
      io.emit("update_users", Object.values(users));
    }
  });

  // Fetch all registered users
  socket.on("get_users", () => {
    socket.emit("users_list", Object.values(users));
  });

  // Fetch name
  socket.on("get_name", () => {
    socket.emit("name", socket.name);
  });

  // Sending a message to a specific user by socket ID
  socket.on("send_message", (data) => {
    const { receiver_id, text, sender_id, time } = data;
    const message = { sender_id, receiver_id, text, time };

    const chatId = [sender_id, receiver_id].join("_");
    // creating chat array if none existed before
    if (!chatHistories[chatId]) {
      chatHistories[chatId] = [];
    }

    // checking if user is online, then sending message and save chat history
    if (receiver_id) {
      io.to(receiver_id).emit("receive_message", JSON.stringify(message));
      chatHistories[chatId].push(message);
      console.log(sender_id + " => " + receiver_id);
    } else {
      // If the recipient is offline, store the message
      if (!offlineMessages[receiver_id]) {
        offlineMessages[receiver_id] = [];
      }
      offlineMessages[receiver_id].push(message);
      console.log(`Stored offline message for ${receiver_id}`);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.name}`);
    if (socket.name) {
      users[socket.name]["online"] = false; // make user offline
    }
    io.emit("update_users", Object.values(users)); // Notify all clients
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
