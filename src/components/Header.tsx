import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoChevronBack, IoEllipsisVertical } from "react-icons/io5";
import { motion } from "framer-motion";

interface HeaderProps {
  name: string;
  image: string;
  notificationCount?: number;
}

export function Header({ name, image, notificationCount }: HeaderProps) {
  const router = useRouter();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="fixed top-0 left-0 right-0 backdrop-blur-md bg-black/20 z-20"
    >          
      <div className="flex items-center px-4 py-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="text-white"
          >
            <IoChevronBack size={24} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={image}
                alt={name}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white text-xl">{name}</span>
              {notificationCount && (
                <div className="bg-pink-500 rounded-full w-6 h-6 flex items-center justify-center">
                  <span className="text-white text-sm">{notificationCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <button className="text-white ml-auto">
          <IoEllipsisVertical size={20} />
        </button>
      </div>
    </motion.header>
  );
} 