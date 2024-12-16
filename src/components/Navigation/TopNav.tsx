import { isOnTelegram } from "@/lib/telegram";

interface TopNavProps {
  activeTab: 'all' | 'male' | 'female' | 'zh' | 'en' | 'kr' | 'jp';
  onTabChange: (tab: 'all' | 'male' | 'female' | 'zh' | 'en' | 'kr' | 'jp') => void;
}

export function TopNav({ activeTab, onTabChange }: TopNavProps) {
  const genderTabs = [
    { id: 'all', label: 'All' },
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
  ];

  const languageTabs = [
    { id: 'en', label: 'English' },
    { id: 'zh', label: '中文' },
    { id: 'kr', label: '한국어' },
    { id: 'jp', label: '日本語' },
  ];

  return (
    <div className={`fixed top-0 left-0 right-0 z-10 backdrop-blur-md bg-gray-800/70 ${
      isOnTelegram() ? 'h-48' : 'h-28'
    }`}>
      <div className="overflow-x-auto">
        {/* Points and user info would go here */}
      {isOnTelegram() && <div className="h-20" />}
        <div className="flex flex-col gap-2 p-2">
          {/* Gender Row */}
          <div className="flex gap-2">
            {genderTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as 'all' | 'male' | 'female' | 'zh' | 'en' | 'kr' | 'jp')}
                className={`flex-shrink-0 px-4 py-2 rounded-full transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-emerald-400 text-gray-900'
                    : 'bg-gray-700/50 text-gray-200 hover:bg-gray-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Language Row */}
          <div className="flex gap-2">
            {languageTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as 'all' | 'male' | 'female' | 'zh' | 'en' | 'kr' | 'jp')}
                className={`flex-shrink-0 px-4 py-2 rounded-full transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-emerald-400 text-gray-900'
                    : 'bg-gray-700/50 text-gray-200 hover:bg-gray-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 