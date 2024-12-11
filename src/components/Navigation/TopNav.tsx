interface TopNavProps {
  activeTab: 'all' | 'male' | 'female' | 'roleplay' | 'chatroom';
  onTabChange: (tab: 'all' | 'male' | 'female' | 'roleplay' | 'chatroom') => void;
}

export function TopNav({ activeTab, onTabChange }: TopNavProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-10 backdrop-blur-md bg-gray-800/70 h-40">
      {/* Points and user info would go here */}
      <div className="h-20" />
      
      {/* Filter tabs at bottom */}
      <div className="flex space-x-2 overflow-x-auto p-4 no-scrollbar">
        <button
          onClick={() => onTabChange('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-full transition-colors ${
            activeTab === 'all' ? 'bg-emerald-400 text-gray-900' : 'bg-gray-700/50 text-gray-200 hover:bg-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onTabChange('male')}
          className={`flex-shrink-0 px-4 py-2 rounded-full transition-colors ${
            activeTab === 'male' ? 'bg-emerald-400 text-gray-900' : 'bg-gray-700/50 text-gray-200 hover:bg-gray-700'
          }`}
        >
          Male
        </button>
        <button
          onClick={() => onTabChange('female')}
          className={`flex-shrink-0 px-4 py-2 rounded-full transition-colors ${
            activeTab === 'female' ? 'bg-emerald-400 text-gray-900' : 'bg-gray-700/50 text-gray-200 hover:bg-gray-700'
          }`}
        >
          Female
        </button>
        <button
          onClick={() => onTabChange('roleplay')}
          className={`flex-shrink-0 px-4 py-2 rounded-full transition-colors ${
            activeTab === 'roleplay' ? 'bg-emerald-400 text-gray-900' : 'bg-gray-700/50 text-gray-200 hover:bg-gray-700'
          }`}
        >
          Roleplay
        </button>
        <button
          onClick={() => onTabChange('chatroom')}
          className={`flex-shrink-0 px-4 py-2 rounded-full transition-colors ${
            activeTab === 'chatroom' ? 'bg-emerald-400 text-gray-900' : 'bg-gray-700/50 text-gray-200 hover:bg-gray-700'
          }`}
        >
          Chatroom
        </button>
      </div>
    </div>
  );
} 