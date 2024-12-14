"use client";
import Image from "next/image";
import logo from "@/public/logo.png";
import searchIcon from "@/public/search.png";
import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import { User } from "@/lib/interface";
import { useDispatch } from "react-redux";
import { updateCurrentChat } from "@/store/features/chatSlice";

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export default function ChatList() {
  const dispatch = useDispatch();

  const ChatUser = (chat: User) => {
    dispatch(updateCurrentChat(chat));
  };

  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    socket.emit("get_users");
    socket.on("users_list", (userList) => {
      setUsers(userList);
    });

    socket.emit("get_name");
    socket.on("name", (name) => {
      setUsername(name);
    });

    // Update users list dynamically
    socket.on("update_users", (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off("users_list");
      socket.off("name");
      socket.off("update_users");
    };
  }, []);

  const [searchContact, setSearchContact] = useState("");

  const regex = new RegExp(escapeRegExp(searchContact), "i");
  const filteredContacts = users
    .filter(({ name }) => name !== username)
    .filter(
      ({ name, email, number }) =>
        regex.test(name) || regex.test(email) || regex.test(number)
    );

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3">
        <Image src={logo} alt="app logo" />
        <h2 className="pt-3 pr-2 text- font-bold">{username}</h2>
      </div>
      <div className="bg-gray-100 rounded-full flex items-center gap-3 mx-6 my-5 px-3 py-1">
        <Image src={searchIcon} alt="search icon" />
        <input
          type="search"
          name="search-user"
          id="search-user"
          placeholder="Search user "
          className="bg-transparent w-full py-2 h-full focus:outline-none"
          value={searchContact}
          onChange={(e) => setSearchContact(e.target.value)}
        />
      </div>
      <div className="mt-2 mb-5 h-full bg-white shadow-lg rounded-b-lg overflow-y-scroll ">
        {users.length < 2 ? (
          <p className="text-center mt-8">
            No contacts yet, login with another tab
          </p>
        ) : filteredContacts?.length > 0 ? (
          filteredContacts.map((chat, index) => (
            <div
              key={`${chat.name}-${index}`}
              className="border-b px-4 py-2 flex justify-between active:bg-gray-100 lg:hover:bg-gray-100 cursor-pointer duration-300"
              onClick={() => ChatUser(chat)}
            >
              <div className="flex items-center gap-4">
                <div className="relative capitalize rounded-full flex items-center justify-center size-10 text-white bg-darkBlue">
                  {chat.name.charAt(0)}
                  {/* online green dot notification */}
                  {chat.online && (
                    <div className="size-3 bg-[#15CF74] rounded-full absolute top-0 right-0"></div>
                  )}
                </div>
                <article className="flex flex-col gap-2">
                  <h2 className="capitalize">{chat.name}</h2>
                </article>
              </div>
              <div className="flex items-end flex-col gap-2"></div>
            </div>
          ))
        ) : (
          <p className="text-center mt-8">
            No contact found for {searchContact}
          </p>
        )}
      </div>
    </>
  );
}
