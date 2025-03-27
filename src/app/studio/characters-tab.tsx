'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { IoSearch, IoAdd, IoTrash, IoCreate, IoEye, IoPersonCircle, IoFilter, IoClose } from 'react-icons/io5';
import { User, Character } from '@/lib/types';
import { useCharactersWithFilters, useCharactersWithFiltersCount } from '@/hooks/api';

interface CharactersTabProps {
  user: User | null | undefined;
}

export function CharactersTab({ user }: CharactersTabProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasImage, setHasImage] = useState<boolean | undefined>(undefined);
  const [hasRoleplayEnabled, setHasRoleplayEnabled] = useState<boolean | undefined>(undefined);
  const [offset, setOffset] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const limit = 10;
  
  // Fetch characters with filters
  const { 
    data: characters = [], 
    isLoading: isLoadingCharacters,
    refetch
  } = useCharactersWithFilters(hasImage, hasRoleplayEnabled, limit, offset);
  
  // Fetch total count for pagination
  const {
    data: totalCount = 0,
    isLoading: isLoadingCount
  } = useCharactersWithFiltersCount(hasImage, hasRoleplayEnabled);
  
  // Apply search filter client-side
  const filteredCharacters = characters.filter(character => 
    character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the effective count for pagination when search is applied
  const effectiveCount = totalCount;

  // Handle pagination
  const handleNextPage = () => {
    if (offset + limit < totalCount) {
      setOffset(offset + limit);
      // Reset scroll position when changing pages
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
      // Reset scroll position when changing pages
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    console.log("characters", characters);
  }, [characters]);

  // Reset pagination when search query changes
  useEffect(() => {
    setOffset(0);
  }, [searchQuery, hasImage, hasRoleplayEnabled]);
  
  const handleDeleteCharacter = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/characters/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          refetch();
        } else {
          alert('Failed to delete character');
        }
      } catch (error) {
        console.error('Error deleting character:', error);
        alert('An error occurred while deleting the character');
      }
    }
  };
  
  const isLoading = isLoadingCharacters || isLoadingCount || totalCount === 0;
  const activeFilterCount = (hasImage !== undefined ? 1 : 0) + (hasRoleplayEnabled !== undefined ? 1 : 0);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Character Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white/10 text-white rounded-lg flex items-center gap-2 hover:bg-white/20 transition-colors"
          >
            <IoFilter className="w-5 h-5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-[#FDB777] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            onClick={() => router.push('/studio/create-character')}
            className="px-4 py-2 bg-[#FDB777] text-black rounded-lg flex items-center gap-2 hover:bg-[#fca555] transition-colors"
          >
            <IoAdd className="w-5 h-5" />
            Create New Character
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="mb-6 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Filters</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 text-gray-400 hover:text-white"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasImage === true}
                  onChange={() => setHasImage(hasImage === true ? undefined : true)}
                  className="w-4 h-4 text-[#FDB777] bg-white/5 border-white/10 rounded focus:ring-[#FDB777]/50"
                />
                <span className="text-sm text-gray-300">Has Image</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasRoleplayEnabled === true}
                  onChange={() => setHasRoleplayEnabled(hasRoleplayEnabled === true ? undefined : true)}
                  className="w-4 h-4 text-[#FDB777] bg-white/5 border-white/10 rounded focus:ring-[#FDB777]/50"
                />
                <span className="text-sm text-gray-300">Roleplay Enabled</span>
              </label>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setHasImage(undefined);
                setHasRoleplayEnabled(undefined);
                setOffset(0);
                setSearchQuery('');
              }}
              className="px-3 py-1 text-sm text-gray-300 hover:text-white"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}
      
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IoSearch className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search characters..."
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Pagination moved to top */}
      {!isLoading && filteredCharacters.length > 0 && (
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {searchQuery ? (
              `Showing ${filteredCharacters.length} ${filteredCharacters.length === 1 ? 'result' : 'results'} for "${searchQuery}"`
            ) : (
              `Showing ${offset + 1} to ${Math.min(offset + characters.length, totalCount)} of ${totalCount} characters`
            )}
          </div>
          {totalCount > limit && (
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={offset === 0}
                className={`px-3 py-1 rounded-lg ${
                  offset === 0
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={offset + limit >= totalCount}
                className={`px-3 py-1 rounded-lg ${
                  offset + limit >= totalCount
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-[#FDB777]/20 border-t-[#FDB777] rounded-full" />
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="text-center py-16 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
          <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
            <IoPersonCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-white mb-2">No characters found</h2>
          <p className="text-gray-400 mb-6">
            {searchQuery || activeFilterCount > 0
              ? "No characters match your search criteria"
              : "You haven't created any characters yet"}
          </p>
          <button
            onClick={() => router.push('/studio/create-character')}
            className="px-4 py-2 bg-[#FDB777] text-black rounded-lg inline-flex items-center gap-2 hover:bg-[#fca555] transition-colors"
          >
            <IoAdd className="w-5 h-5" />
            Create Your First Character
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {filteredCharacters.map((character) => (
              <div 
                key={character._id}
                className="flex items-center gap-6 p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="relative w-24 h-24 flex-shrink-0 bg-gray-700 rounded-lg">
                  {character.avatar_image_url ? (
                    <Image
                      src={character.avatar_image_url}
                      alt={character.name}
                      fill
                      className="rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-avatar.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <IoPersonCircle className="w-14 h-14 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-medium text-white truncate">{character.name}</h3>
                  <p className="text-gray-400 text-sm truncate mt-1">{character.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">
                      Created: {new Date(character.created_at * 1000).toLocaleDateString()}
                    </span>
                    {character.metadata.enable_roleplay && (
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                        Roleplay
                      </span>
                    )}
                    {character.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs bg-[#FDB777]/20 text-[#FDB777] px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                    {character.tags.length > 3 && (
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">
                        +{character.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/character/${character._id}`)}
                    className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                    title="View Character"
                  >
                    <IoEye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => router.push(`/studio/edit-character/${character._id}`)}
                    className="p-2 bg-[#FDB777]/20 rounded-lg text-[#FDB777] hover:bg-[#FDB777]/30 transition-colors"
                    title="Edit Character"
                  >
                    <IoCreate className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCharacter(character._id)}
                    className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                    title="Delete Character"
                  >
                    <IoTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 