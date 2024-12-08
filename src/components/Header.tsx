import Image from "next/image";
import { motion } from "framer-motion";

interface HeaderProps {
  name: string;
  image: string;
  className?: string;
}

export function Header({ name, image, className }: HeaderProps) {

  return (
    <motion.header
      className={`${className}`}
    >          
      <div className="flex items-center justify-center px-4 py-3">
        {/* <button 
          onClick={() => router.back()} 
          className="text-white flex items-center justify-center w-10 h-10"
        >
          <IoChevronBack size={24} />
        </button> */}
        
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
          </div>
        </div>

        {/* <button className="text-white flex items-center justify-center w-10 h-10">
          <IoEllipsisVertical size={20} />
        </button> */}
      </div>
    </motion.header>
  );
} 