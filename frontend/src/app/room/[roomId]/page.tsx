"use client";

import { useParams } from "next/navigation";
import { getSocket } from "../../lib/socket";
import { useState, useEffect } from "react";

const page = () => {

  const roomId =  useParams();

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join-room", roomId);

  }, [roomId]);

  return (
    <div>
      <h3>room</h3>
    </div>
  );
}

export default page;
