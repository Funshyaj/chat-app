'use client'
import { useState, useRef, useEffect } from "react";
import sendIcon from '@/public/sendIcon.png'
import Image from "next/image";
import { timeStampGenerator } from "@/lib/timeStampGenerator";
import { useAppSelector } from "@/store/index";
import socket from "@/lib/socket";

const ChatContent = () => {

  const currentChat = useAppSelector((state) => state.chat.currentChat);
  const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    // Listen for incoming messages
    socket.on('receive_message', (data) => {
      let parsed = JSON.parse(data)
      setMessages((prev) => [...prev, parsed]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    const newMessageObject = {
      text: inputText,
      receiver_id: currentChat?.id,
      sender_id: user.id,
      time: timeStampGenerator(new Date())
    }

    if (inputText.trim()) {
      socket.emit('send_message', newMessageObject);
      setMessages((prev) => ([...prev, newMessageObject]));
      setInputText("")
    }
  }

  return (
    <div className="h-[83vh] flex flex-col px-6 pt-4 bg-hero-pattern bg-cover">
      <div className="flex-1 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            ref={index === messages.length - 1 ? lastMessageRef : null}
            key={index}
            className={`flex ${message.sender_id === user.id ? "justify-end" : "justify-start"
              } mb-4`}
          >
            <div
              className={`pl-2 pr-10 pt-1 pb-6 rounded-lg max-w-96 relative ${message.sender_id === user.id
                ? "bg-[#DEE9FF] text-black"
                : "bg-white"
                }`}
            >
              {message.text}
              <span className="absolute bottom-1 right-1 text-xs">{message.time}</span>
            </div>
          </div>
        ))}
      </div>
      <form id="chatForm" onSubmit={handleMessageSubmit} className='flex items-center w-2/3 mx-auto pl-3 pr-2 bg-white rounded-lg'>

        <input value={inputText} onChange={(e) => setInputText(e.target.value)}
          onSubmit={handleMessageSubmit}
          placeholder="Message"
          className="w-full py-3 bg-transparent focus:outline-none" />
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
  );
};

export default ChatContent;
