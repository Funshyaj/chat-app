"use client";
import ChatList from "./components/ChatList";
import ChatContent from "./components/ChatContent";
import { useAppSelector } from "@/store/index";
import { useState } from "react";
import Image from "next/image";
import cancelIcon from "@/public/canceIcon.png";

export default function ChatPage() {
  const currentChat = useAppSelector((state) => state.chat.currentChat);
  const [modal, setModal] = useState(false);

  const toggleModal = () => setModal(!modal);
  return (
    <main className="flex h-screen">
      <aside className="basis-1/3 bg-white overflow-hidden">
        <ChatList />
      </aside>
      <section className="basis-2/3 bg-[#F5F5F5]">
        <header className="shadow-b-md h-[10vh] bg-white flex items-center pl-5">
          {currentChat && (
            <div
              className="flex gap-3 items-center cursor-pointer"
              onClick={toggleModal}
            >
              <div className="relative capitalize rounded-full flex items-center justify-center size-10 text-white bg-darkBlue">
                {currentChat.name.charAt(0)}
              </div>
              <div className="">
                <p className="font-medium">{currentChat.name}</p>
                <span className="text-xs">
                  {currentChat.online ? "Online" : "offline"}
                </span>
              </div>
            </div>
          )}
        </header>

        {/* chats mapping goes here */}
        {currentChat ? (
          <ChatContent />
        ) : (
          <div className="h-[83vh] flex flex-col items-center justify-center px-6 pt-4 bg-hero-pattern bg-cover">
            Click a user to start chatting
          </div>
        )}
      </section>

      {/* contant profile view */}
      {currentChat && modal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-10 backdrop-blur-sm overflow-y-scroll"
          onClick={toggleModal}
        >
          <div className="space-y-3 flex flex-col items-center pt-20 bg-white p-4 absolute right-0 h-full w-1/3">
            <button className="absolute top-3 left-5" onClick={toggleModal}>
              <Image src={cancelIcon} alt="cancel Icon" />
            </button>
            <div className="relative capitalize rounded-full flex items-center justify-center size-28 text-4xl text-white bg-darkBlue">
              {currentChat.name.charAt(0)}
            </div>

            <h2>{currentChat.name}</h2>
            <p>{currentChat.number}</p>
            <p>{currentChat.email}</p>
          </div>
        </div>
      )}
    </main>
  );
}
