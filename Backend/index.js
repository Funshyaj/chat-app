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

io.on("connection", (socket) => {
  console.log("New user connected: ", socket.id);

  // Saving users on the Sign up
  socket.on("register", ({ name, email, number }) => {
    socket.name = name;
    // checking if user with same name exist
    if (name in users) {
      // bring them back online by updating thier status
      users[name]["online"] = true;
      users[name]["id"] = socket.id;

      console.log(`User ${name} is back online with socket id ${socket.id}`);
      console.log(users);
      socket.emit("registered", users[name]);
      // update all users to tell them this user is back online
      io.emit("update_users", Object.values(users));
    } else {
      // Create a new user
      users[name] = {
        id: socket.id,
        name,
        email,
        number,
        online: true,
      };

      console.log(`User ${name} registered with socket id ${socket.id}`);
      console.log(users);
      socket.emit("registered", users[name]);
      // updated all users to show new user to chat with
      io.emit("update_users", Object.values(users));
    }
  });

  // Fetch all registered users
  socket.on("get_users", () => {
    socket.emit("users_list", Object.values(users));
  });

  // Fetch username
  socket.on("get_name", () => {
    socket.emit("name", socket.name);
  });

  // Read message
  socket.on("read_message", (name) => {
    users[name]["unread"] = "";
  });

  // Sending all offline message held in server to receiver
  socket.on("get_offline_messages", (name) => {
    if (offlineMessages[name] && offlineMessages[name].length > 0) {
      offlineMessages[name].forEach((message) => {
        console.log("sending offline message to:", users[name]["id"]);
        socket.emit("receive_offline_messages", JSON.stringify(message));
      });
      // Clear stored messages for the user once delivered
      delete offlineMessages[name];
    }
  });

  // Sending a message to a specific user by socket ID
  socket.on("send_message", (data) => {
    const { receiver_id, text, sender_id, sender_name, receiver_name, time } =
      data;
    const message = {
      sender_id,
      sender_name,
      receiver_name,
      receiver_id,
      text,
      time,
    };

    // checking if user is online, then sending message and save chat history
    if (users[receiver_name]["online"]) {
      io.to(receiver_id).emit("receive_message", JSON.stringify(message));
      console.log(sender_id + " => " + receiver_id);
    } else {
      // If the recipient is offline, store the message
      if (!offlineMessages[receiver_name]) {
        offlineMessages[receiver_name] = [];
      }

      offlineMessages[receiver_name].push(message);
      users[sender_name]["unread"] = offlineMessages[receiver_name].length;
      console.log(`Stored offline message for ${receiver_name}`);
    }
  });

  // Listen for wallpaper change requests
  socket.on("update_wallpaper", (data) => {
    const { receiver_id, imageData } = data;
    // send the new wallpaper to peer
    console.log(
      `updating wallpaper for both sender: ${socket.id} and receiver: ${receiver_id}`
    );
    io.to(receiver_id).emit("updated_wallpaper", imageData);
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
