"use client";
import Image from "next/image";
import logo from "@/public/logo.png";
import searchIcon from "@/public/search.png";
import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import { ChatSessions, sessionWallpapers, User } from "@/lib/interface";
import { useDispatch } from "react-redux";
import { updateCurrentChat } from "@/store/features/chatSlice";
import { useAppSelector } from "@/store";
import useLocalStorageState from "use-local-storage-state";

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export default function ChatList() {
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.user.user);
  const [chatSessions, setChatSessions] = useLocalStorageState<ChatSessions>(
    "chatSessions",
    {
      defaultValue: {},
    }
  );
  const [, setSessionWallpaper] = useLocalStorageState<sessionWallpapers>(
    "sessionWallapapers",
    {
      defaultValue: {},
    }
  );

  const ChatUser = (chat: User) => {
    const newChatId = user?.name + "-" + chat.name;
    //  If session doesnt already exist create a new one
    if (!(newChatId in chatSessions)) {
      setChatSessions((prevSessions) => ({
        ...prevSessions,
        [newChatId]: [],
      }));

      setSessionWallpaper((prev) => ({
        ...prev,
        [newChatId]: "",
      }));
    }

    dispatch(updateCurrentChat(chat));
  };

  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
      dispatch(updateCurrentChat(userList[`${selectedUser?.name}`]));
    });

    socket.emit("get_offline_messages", user?.name);
    socket.on("receive_offline_messages", (message) => {
      const parsed = JSON.parse(message);
      const newChatId = user?.name + "-" + parsed["sender_name"];
      setChatSessions((prevSessions) => ({
        ...prevSessions,
        [newChatId]: [...prevSessions[newChatId], parsed],
      }));
    });

    return () => {
      socket.off("users_list");
      socket.off("name");
      socket.off("update_users");
      socket.off("receive_offline_messages");
    };
  }, [dispatch, selectedUser?.name, setChatSessions, user?.name]);

  const readMessage = (chat: User) => {
    socket.emit("read_message", chat.name);
  };

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
              className="border-b px-4 py-2 flex justify-between items-center active:bg-gray-100 lg:hover:bg-gray-100 cursor-pointer duration-300"
              onClick={() => {
                setSelectedUser(chat);
                ChatUser(chat);
                readMessage(chat);
              }}
            >
              <div className="flex items-center gap-4">
                <div className="relative capitalize rounded-full flex items-center justify-center size-10 text-white bg-darkBlue">
                  {chat.name.charAt(0)}
                  {/* online green dot notification */}
                  {chat.online && (
                    <div className="size-3 bg-[#15CF74] rounded-full absolute top-0 right-0"></div>
                  )}
                </div>
                <h2 className="capitalize">{chat.name}</h2>
              </div>
              {chat?.unread && (
                <div className="bg-green-500 text-white text-xs text-center font-semibold rounded-full px-2 py-1">
                  <span>{chat.unread}</span>
                </div>
              )}
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
