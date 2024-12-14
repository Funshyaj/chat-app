"use client";
import PrimaryButton from "@/components/PrimaryButton";
import TextInput from "@/components/TextInput";
import Image from "next/image";
import logo from "@/public/logo.png";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import socket from "@/lib/socket";
import { updateUser } from "@/store/features/userSlice";
import { useDispatch } from "react-redux";

export default function Home() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Registering a new User to store on server with socket ID
    socket.emit("register", { name, email, number });

    // Listening for the registration sucess and saving user data
    socket.on("registered", (data) => {
      dispatch(updateUser(data));
      router.push("/chat");
    });
  };

  return (
    <div className="bg-bgBlue h-screen flex flex-col justify-center items-center">
      <div className="bg-white h-full md:h-[unset] flex flex-col justify-center gap-6 px-5 py-10 rounded-md w-full md:w-2/4 lg:w-2/5 ">
        <div className="flex flex-col items-center gap-3">
          <Image src={logo} alt="app logo" />
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <TextInput
            name="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextInput
            name="nmail"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextInput
            name="phone number"
            placeholder="Phone Number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
          <PrimaryButton label="Sign Up" />
        </form>
      </div>
    </div>
  );
}
