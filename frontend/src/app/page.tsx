"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "./lib/socket";

const Page = () => {
  const router = useRouter();
  const [inputRoomId, setInputRoomId] = useState<string>("");
  const [activePlayer, setActivePlayer] = useState<number>(0);

  useEffect(() => {

    const socket = getSocket();

    socket.on("connect", () => {
      console.log("connected:", socket.id);
    });

    // count the online player
    socket.on("player-count", (count: number) => {
      setActivePlayer(count);
    });

    socket.on("room-created", (newRoomId: string) => {
      router.push(`/room/${newRoomId}`);
    });

    socket.on("room-joined", (newRoomId: string) => {
      router.push(`/room/${newRoomId}`);
    });

    socket.on("room-error", (msg: string) => {
      alert(msg);
    });

    return () => {
      socket.off("player-count");
      socket.off("room-created");
      socket.off("room-joined");
      socket.off("room-error");
    };
  }, [router]);

  const createRoom = (): void => {
    getSocket().emit("create-room");
  };

  const joinRoom = (targetRoomId: string): void => {
    if (!targetRoomId.trim()) return;
    
    getSocket().emit("join-room", targetRoomId);
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div>
        <h3>{activePlayer}</h3>

        <div>
          <button
            type="button"
            onClick={createRoom}
            className="px-[1%] py-[0.5%] border-[0.1em] border-[#121212]"
          >
            Create Room
          </button>
        </div>

        <div>
          <input
            type="text"
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value)}
            placeholder="Room id"
          />
          <button
            type="button"
            onClick={() => joinRoom(inputRoomId)}
            className="px-[1%] py-[0.5%] border-[0.1em] border-[#121212]"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
