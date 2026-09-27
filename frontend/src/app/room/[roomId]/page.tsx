"use client";

import { useParams } from "next/navigation";
import { getSocket } from "../../lib/socket";
import { useState, useEffect } from "react";

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function checkWinner(board) {
  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

const Page = () => {
  const { roomId } = useParams();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [mySymbol, setMySymbol] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState("X");

  useEffect(() => {
    const socket = getSocket();
    
    socket.on("player-symbol", (symbol) => {
      setMySymbol(symbol);
    });

    // share the status to oponent 
    socket.on("move-made", ({ index, symbol }) => {
      setBoard((prev) => {
        const next = [...prev];
        next[index] = symbol;
        return next;
      });
      setCurrentPlayer(symbol === "X" ? "O" : "X");
    });

    socket.on("game-reset", () => {
      setBoard(Array(9).fill(null));
      setCurrentPlayer("X");
    });

    return () => {
      socket.off("player-symbol");
      socket.off("move-made");
      socket.off("game-reset");
    };
  }, [roomId]);

  const winner = checkWinner(board);
  const isDraw = !winner && board.every((cell) => cell !== null);

  function handleClick(index) {
    if (board[index] || winner || mySymbol !== currentPlayer) return;

    const socket = getSocket();
    socket.emit("make-move", { roomId, index, symbol: mySymbol });
  }

  function handleReset() {
    const socket = getSocket();
    socket.emit("reset-game", roomId);
  }

  return (
    <div>
      <h3>Room: {roomId}</h3>
      <p>You are: {mySymbol || "..."}</p>
      <p>
        {winner
          ? `Winner: ${winner}`
          : isDraw
          ? "Draw!"
          : `Turn: ${currentPlayer}`}
      </p>

      <div className="w-full flex flex-col justify-evenly">
      <div className="grid grid-cols-3 h-64 p-[10%]">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className="w-full h-full border-[0.1em] border-[#121212] text-[3rem]">
            {cell}
          </button>
        ))}
      </div>

      <button onClick={handleReset} className="">
        Reset
      </button>
      </div>
    </div>
  );
};

export default Page;
