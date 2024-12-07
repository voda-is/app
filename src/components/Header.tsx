import Image from "next/image";
import { motion } from "framer-motion";
import OnLineUsers from "@/app/chat/components/onLineUsers";
import { useEffect, useState } from "react";

interface HeaderProps {
  name: string;
  image: string;
  className?: string;
}

export function Header({ name, image, className = "" }: HeaderProps) {
  const [comingUser, setComingUser] = useState<{
    name: string;
    time: string;
  } | null>(null);

  useEffect(() => {
    // TODO: get coming user, timer
    setTimeout(() => {
      setComingUser({
        name: "John",
        time: "10:00",
      });
    }, 1000);
  }, []);
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-20 backdrop-blur-md bg-[#1D1F20] h-16 ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <OnLineUsers />
        <div className="flex items-center gap-2">
          <Image
            src={image}
            alt={name}
            width={41}
            height={41}
            className="object-cover rounded-full"
          />
          <span className="text-white text-xl">{name}</span>
        </div>
        {comingUser && (
          <div className="text-white/60 text-sm">
            <span className="text-[#10B981]">{comingUser.name}</span> coming
          </div>
        )}
      </div>
    </div>
  );
}
