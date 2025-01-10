"use client";
import { useState, useRef, useEffect, FormEvent, ChangeEvent } from "react";
import useLocalStorageState from "use-local-storage-state";
import sendIcon from "@/public/sendIcon.png";
import Image from "next/image";
import { timeStampGenerator } from "@/lib/timeStampGenerator";
import { useAppSelector } from "@/store/index";
import socket from "@/lib/socket";
import { Chat, ChatSessions, sessionWallpapers } from "@/lib/interface";
import Popover from "./Popover";

const ChatContent = () => {
  const currentChat = useAppSelector((state) => state.chat.currentChat);
  const user = useAppSelector((state) => state.user.user);
  const chatId = user?.name + "-" + currentChat?.name;

  const [chatSessions, setChatSessions] = useLocalStorageState<ChatSessions>(
    "chatSessions",
    {
      defaultValue: {},
    }
  );

  const [inputText, setInputText] = useState("");
  const [sessionWallpaper, setSessionWallpaper] =
    useLocalStorageState<sessionWallpapers>("sessionWallapapers", {
      defaultValue: {},
    });

  useEffect(() => {
    // Listen for incoming messages
    socket.on("receive_message", (data) => {
      const parsed = JSON.parse(data);
      setChatSessions((prevSessions) => ({
        ...prevSessions,
        [chatId]: [...prevSessions[chatId], parsed],
      }));
    });

    // Listening for wallpaper updates from the server
    socket.on("updated_wallpaper", (wallpaperUrl) => {
      setSessionWallpaper((prev) => ({ ...prev, [chatId]: wallpaperUrl }));
    });

    return () => {
      socket.off("receive_message");
      socket.off("updated_wallpaper");
    };
  }, [chatId, setChatSessions, setSessionWallpaper]);

  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  });

  const handleMessageSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newMessageObject: Chat = {
      text: inputText,
      receiver_id: currentChat?.id,
      sender_id: user?.id,
      sender_name: user?.name,
      receiver_name: currentChat?.name,
      time: timeStampGenerator(new Date()),
    };

    if (inputText.trim()) {
      socket.emit("send_message", newMessageObject);
      // setMessages((prev) => ([...prev ?? [], newMessageObject]));
      setChatSessions((prevSessions) => ({
        ...prevSessions,
        [chatId]: [...prevSessions[chatId], newMessageObject],
      }));
      setInputText("");
    }
  };

  // Function to handle file input change (image upload)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile); // Convert file to base64
      reader.onloadend = () => {
        // Store base 64 on client
        setSessionWallpaper((prev) => ({
          ...prev,
          [chatId]: reader.result,
        }));

        // Send the base64 string to peer
        socket.emit("update_wallpaper", {
          imageData: reader.result,
          receiver_id: currentChat?.id,
        });
      };
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const triggerImageUpload = () => {
    fileInputRef.current?.click(); // Trigger the hidden input
  };

  // Set background dynamically
  const chatStyle = {
    backgroundImage: `url(${sessionWallpaper[chatId]})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div
      style={chatStyle}
      className="h-[90vh] flex flex-col px-6 pb-3 bg-cover"
    >
      <div className="flex-1 overflow-y-auto">
        {/* Mapping the messages */}
        {chatSessions[chatId]?.map((message, index) => (
          <div
            ref={
              index === chatSessions[chatId].length - 1 ? lastMessageRef : null
            }
            key={index}
            className={`flex ${
              message.sender_name === user?.name
                ? "justify-end"
                : "justify-start"
            } mb-4 ${index === 0 && "pt-3"}`}
          >
            <div
              className={`pl-2 pr-10 pt-1 pb-6 rounded-lg max-w-96 relative ${
                message.sender_name === user?.name
                  ? "bg-[#DEE9FF] text-black"
                  : "bg-white"
              }`}
            >
              {message.text}
              <span className="absolute bottom-1 right-1 text-xs">
                {message.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Message input form */}
      <div className="flex gap-2 items-center w-2/3 mx-auto">
        {/* Change background popover */}
        <Popover>
          <div className="flex">
            <p onClick={triggerImageUpload}>change background image</p>
            <input
              type="file"
              name="image"
              id="image"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </Popover>

        {/* Message fomr */}
        <form
          id="chatForm"
          onSubmit={handleMessageSubmit}
          className="flex items-center w-full pl-3 pr-2 bg-white rounded-lg"
        >
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onSubmit={handleMessageSubmit}
            placeholder="Message"
            className="w-full py-3 bg-transparent focus:outline-none"
          />
          <button
            form="chatForm"
            type="submit"
            disabled={Boolean(!inputText.trim())}
            className="cursor-pointer enabled:active:scale-90 enabled:hover:shadow-lg duration-300 disabled:opacity-75"
          >
            <Image src={sendIcon} alt="send icon" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatContent;
