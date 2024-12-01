import { 
  IoHome,
  IoChatbubble,
  IoAdd,
  IoCompass,
  IoPerson
} from "react-icons/io5";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <button 
          className={activeTab === 'home' ? 'text-white' : 'text-gray-400'}
          onClick={() => onTabChange('home')}
        >
          <IoHome size={24} />
        </button>
        <button 
          className={activeTab === 'chat' ? 'text-white' : 'text-gray-400'}
          onClick={() => onTabChange('chat')}
        >
          <IoChatbubble size={24} />
        </button>
        <button 
          className={activeTab === 'create' ? 'text-white' : 'text-gray-400'}
          onClick={() => onTabChange('create')}
        >
          <IoAdd size={24} />
        </button>
        <button 
          className={activeTab === 'explore' ? 'text-white' : 'text-gray-400'}
          onClick={() => onTabChange('explore')}
        >
          <IoCompass size={24} />
        </button>
        <button 
          className={activeTab === 'profile' ? 'text-white' : 'text-gray-400'}
          onClick={() => onTabChange('profile')}
        >
          <IoPerson size={24} />
        </button>
      </div>
    </div>
  );
} 