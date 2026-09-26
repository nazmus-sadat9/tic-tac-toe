"use client";
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

const page = () => {

  const [roomId, setRoomId] = useState<string>("");
  const [inputRoomId, setInputRoomId] = useState<string>("");
  const [activePlayer, setActivePlayer] = useState<number>(0);

  useEffect(() => {

    // connect to the socket server
    socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:5000");

    socket.on("connect", () => {
      setActivePlayer(prev => prev + 1);
    });

    socket.on("disconnect", () => {
      setActivePlayer(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };

  }, []);

  // generate a random room id
  const generateRoomId = (): string => {
    return Math.random().toString(36).substring(2, 8);
  }

  const createRoom = (): string => {

    const newRoomId = generateRoomId();

    if (socket) {
      socket.emit("join-room", newRoomId);
      setRoomId(newRoomId);
    }

    return newRoomId;
  }

  const joinExitRoom = (targetRoomId: string): void => {
    if (!targetRoomId.trim()) {
      return;
    }

    if (socket) {
      socket.emit("join-room", targetRoomId);
      setRoomId(targetRoomId);
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div>
        <h3>{activePlayer}</h3>
        <div>
          <p>Current Room: {roomId ? <span>{roomId}</span> : <em>None</em> }</p>
          <button onClick={createRoom} className="px-[1%] py-[0.5%] border-[0.1em] border-[#121212]">Create Room</button>
        </div>

        <form>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)} 
            placeholder="Room id" />
          <button onClick={() => joinExitRoom(roomId)} className="px-[1%] py-[0.5%] border-[0.1em] border-[#121212]" >Join</button>
        </form>
      </div>
    </div>
  );
}

export default page;
