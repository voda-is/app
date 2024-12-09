import React, { useEffect, useState } from "react";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  image: string;
  roleName: string;
}

const mockUsers: User[] = [
  { id: "1", name: "Nana", image: "/header/avatar1.png", roleName: "Host" },
  { id: "2", name: "Alan", image: "/header/avatar2.png", roleName: "Guest" },
  { id: "3", name: "Amrith", image: "/header/avatar3.png", roleName: "Guest" },
  { id: "4", name: "Amrith", image: "/header/avatar4.png", roleName: "Guest" },
  { id: "5", name: "Amrith", image: "/header/avatar5.png", roleName: "Guest" },
  { id: "6", name: "Amrith", image: "/header/avatar6.png", roleName: "Guest" },
];

const OnLineUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [count, setCount] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    // TODO: get online users
    setTimeout(() => {
      setUsers(mockUsers);
      setCount(mockUsers.length);
    }, 3000);
  }, []);

  const loadHistoryCount = () => {
    // TODO: get history count
    setTimeout(() => {
      setHistoryCount(100);
    }, 1000);
  };

  const handleShowMore = () => {
    setShowMore(!showMore);
    loadHistoryCount();
  };

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {users.slice(0, 3).map((user) => (
          <div key={user.id} className="w-6 h-6 rounded-full overflow-hidden">
            <Image
              src={user.image}
              alt={user.name}
              width={24}
              height={24}
              className="object-cover border border-[#10B981]"
            />
          </div>
        ))}
        {count > 3 && (
          <div
            className="bg-[#383938] flex items-center justify-center border border-[#10B981] rounded-full h-[24px] text-white ml-2 cursor-pointer"
            onClick={handleShowMore}
            style={{ width: 48 }}
          >
            <div className="text-[10px] mr-1">{count}</div>
            <Image
              src="/header/down.png"
              alt="plus"
              width={10}
              height={10}
              className="object-cover"
            />
          </div>
        )}
      </div>
      {showMore && (
        <div className="absolute bg-[#1C1D1D] left-0 right-0 p-4 rounded-ss-lg rounded-se-lg top-[65px] h-[calc(100vh-153px)] overflow-y-auto">
          <div className="border w-[85px] h-[30px] border-[#10B981] rounded-full flex items-center justify-center">
            <div className="text-[#10B981] text-[12px] text-center">
              Online: {count}
            </div>
          </div>
          <div className="text-[#8C8C8C] text-[12px] text-left mb-4 mt-2">
            {`Historical total: ${historyCount}`}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col items-center mb-2">
                <Image
                  src={user.image}
                  alt={user.name}
                  width={60}
                  height={60}
                  className="object-cover rounded-full"
                />
                <div className="text-white text-[12px] font-medium text-center mt-2">
                  {user.name}
                </div>
                <div className="text-[rgba(255, 255, 255, 0.6)] text-[12px] text-center">
                  {user.roleName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnLineUsers;
