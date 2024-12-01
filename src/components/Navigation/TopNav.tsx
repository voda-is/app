interface TopNavProps {
  activeTab: 'featured' | 'popular';
  onTabChange: (tab: 'featured' | 'popular') => void;
}

export function TopNav({ activeTab, onTabChange }: TopNavProps) {
  return (
    <div className="flex gap-4 mb-6 text-xl">
      <h2 
        className={`font-bold cursor-pointer ${activeTab === 'featured' ? 'text-white' : 'text-gray-400'}`}
        onClick={() => onTabChange('featured')}
      >
        Featured
      </h2>
      <h2 
        className={`cursor-pointer ${activeTab === 'popular' ? 'text-white' : 'text-gray-400'}`}
        onClick={() => onTabChange('popular')}
      >
        Popular
      </h2>
    </div>
  );
} 