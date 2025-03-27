'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { IoSave, IoArrowBack, IoPersonCircle, IoCloudUpload, IoTrash, IoImage } from 'react-icons/io5';
import { Character, CharacterSchema } from '@/lib/types';
import { useUser, useUpdateCharacter, useUpload, useCharacter } from '@/hooks/api';

interface EditCharacterPageProps {
  params: {
    id: string;
  };
}

export default function EditCharacterPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { data: user } = useUser();
  
  // Use the hooks from api.ts
  const { data: character, isLoading: characterLoading } = useCharacter(id);
  const { mutate: updateCharacter, isPending: isUpdatingCharacter } = useUpdateCharacter();
  const { mutate: uploadFile, isPending: isUploading } = useUpload();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enableRoleplay, setEnableRoleplay] = useState(false);
  const [enableVoice, setEnableVoice] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Avatar handling
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Background image handling
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  
  // Advanced properties
  const [firstMessage, setFirstMessage] = useState('');
  const [personalityPrompt, setPersonalityPrompt] = useState('');
  const [scenarioPrompt, setScenarioPrompt] = useState('');
  const [exampleDialogue, setExampleDialogue] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  
  const isUpdating = isUpdatingCharacter || isUploading || isUploadingAvatar || isUploadingBackground;

  // Set form values when character data is loaded
  useEffect(() => {
    if (character) {
      setName(character.name);
      setDescription(character.description || '');
      setEnableRoleplay(character.metadata?.enable_roleplay || false);
      setEnableVoice(character.metadata?.enable_voice || false);
      setTags(character.tags || []);
      setAvatarPreview(character.avatar_image_url || null);
      setAvatarUrl(character.avatar_image_url || null);
      setBackgroundPreview(character.background_image_url || null);
      setBackgroundUrl(character.background_image_url || null);
      
      // Set advanced properties
      setFirstMessage(character.prompts?.first_message || '');
      setPersonalityPrompt(character.prompts?.personality_prompt || '');
      setScenarioPrompt(character.prompts?.scenario_prompt || '');
      setExampleDialogue(character.prompts?.example_dialogue || '');
    }
  }, [character]);

  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const uploadAvatar = (file: File) => {
    setIsUploadingAvatar(true);
    setError(null);
    
    uploadFile(
      { 
        file: file,
        filename: `character/avatar/${Date.now()}.${file.name.split('.').pop()}`
      },
      {
        onSuccess: (result) => {
          setAvatarUrl(result.url);
          setIsUploadingAvatar(false);
        },
        onError: (err) => {
          setError(`Failed to upload avatar: ${err.message}`);
          setIsUploadingAvatar(false);
        }
      }
    );
  };
  
  const uploadBackground = (file: File) => {
    setIsUploadingBackground(true);
    setError(null);
    
    uploadFile(
      { 
        file: file,
        filename: `character/background/${Date.now()}.${file.name.split('.').pop()}`
      },
      {
        onSuccess: (result) => {
          setBackgroundUrl(result.url);
          setIsUploadingBackground(false);
        },
        onError: (err) => {
          setError(`Failed to upload background: ${err.message}`);
          setIsUploadingBackground(false);
        }
      }
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload avatar immediately
      uploadAvatar(file);
    }
  };
  
  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload background immediately
      uploadBackground(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name.trim()) {
      setError('Character name is required');
      return;
    }
    
    if (isUploadingAvatar || isUploadingBackground) {
      setError('Please wait for image uploads to complete');
      return;
    }
    
    try {
      // Prepare character data
      const characterData = CharacterSchema.parse({
        _id: character?._id || id,
        name,
        description,
        tags,
        avatar_image_url: avatarUrl || character?.avatar_image_url || '',
        background_image_url: backgroundUrl || character?.background_image_url || '',
        metadata: {
          creator: character?.metadata?.creator || '',
          version: character?.metadata?.version || 1,
          enable_roleplay: enableRoleplay,
          enable_voice: enableVoice
        },
        prompts: {
          first_message: firstMessage,
          personality_prompt: personalityPrompt,
          scenario_prompt: scenarioPrompt,
          example_dialogue: exampleDialogue
        },
        voice_model_id: character?.voice_model_id || null,
        created_at: character?.created_at || 1,
        updated_at: 1, // server will update this
        published_at: character?.published_at || 1
      });

      console.log(characterData);
      
      // Update the character
      updateCharacter(characterData, {
        onSuccess: () => {
          router.push('/studio');
        },
        onError: (updateError) => {
          setError(`Failed to update character: ${updateError.message}`);
        }
      });
    } catch (err) {
      console.error('Error updating character:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const handleDeleteCharacter = async () => {
    if (window.confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/characters/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          router.push('/studio');
        } else {
          setError('Failed to delete character');
        }
      } catch (err) {
        console.error('Error deleting character:', err);
        setError('An error occurred while deleting the character');
      }
    }
  };

  if (characterLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-[#FDB777]/20 border-t-[#FDB777] rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
            aria-label="Go back"
          >
            <IoArrowBack className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-white">Edit Character</h1>
        </div>
        <button
          onClick={handleDeleteCharacter}
          className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg flex items-center gap-2 hover:bg-red-500/30 transition-colors"
        >
          <IoTrash className="w-5 h-5" />
          Delete Character
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Character Name*
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
                placeholder="Enter character name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
                placeholder="Describe your character"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-[#FDB777]/20 text-[#FDB777]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-1 text-[#FDB777]/70 hover:text-[#FDB777]"
                      aria-label={`Remove tag ${tag}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={handleTagAdd}
                  className="px-4 py-2 bg-white/10 text-white rounded-r-lg hover:bg-white/20 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableRoleplay}
                    onChange={(e) => setEnableRoleplay(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#FDB777]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FDB777]"></div>
                  <span className="ml-3 text-sm font-medium text-gray-300">Enable Roleplay</span>
                </label>
              </div>
              
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableVoice}
                    onChange={(e) => setEnableVoice(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#FDB777]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FDB777]"></div>
                  <span className="ml-3 text-sm font-medium text-gray-300">Enable Voice</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Character Avatar
              </label>
              <div className="mb-4">
                <div className="relative w-full aspect-square bg-gray-800 rounded-lg overflow-hidden border-2 border-dashed border-white/20 flex items-center justify-center">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-avatar.png';
                      }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <IoPersonCircle className="w-16 h-16 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-400">No image selected</p>
                    </div>
                  )}
                  
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
              <label className="block w-full">
                <span className="sr-only">Choose avatar</span>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={isUploadingAvatar}
                  className="w-full px-4 py-2 bg-white/10 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingAvatar ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <IoCloudUpload className="w-5 h-5" />
                      {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
                    </>
                  )}
                </button>
              </label>
              {avatarUrl && avatarUrl !== character?.avatar_image_url && (
                <p className="mt-1 text-xs text-green-400">
                  Avatar uploaded successfully
                </p>
              )}
            </div>
            
            {/* Background Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Background Image (Optional)
              </label>
              <div className="mb-4">
                <div className="relative w-full h-32 bg-gray-800 rounded-lg overflow-hidden border-2 border-dashed border-white/20 flex items-center justify-center">
                  {backgroundPreview ? (
                    <Image
                      src={backgroundPreview}
                      alt="Background preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <IoImage className="w-12 h-12 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-400">No background selected</p>
                    </div>
                  )}
                  
                  {isUploadingBackground && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
              <label className="block w-full">
                <span className="sr-only">Choose background</span>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundChange}
                  className="hidden"
                  id="background-upload"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('background-upload')?.click()}
                  disabled={isUploadingBackground}
                  className="w-full px-4 py-2 bg-white/10 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingBackground ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <IoImage className="w-5 h-5" />
                      {backgroundPreview ? 'Change Background' : 'Upload Background'}
                    </>
                  )}
                </button>
              </label>
              {backgroundUrl && backgroundUrl !== character?.background_image_url && (
                <p className="mt-1 text-xs text-green-400">
                  Background uploaded successfully
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <button
            type="button"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="text-[#FDB777] hover:text-[#fca555] transition-colors text-sm font-medium"
          >
            {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </button>
          
          {showAdvancedOptions && (
            <div className="mt-4 space-y-6 border-t border-white/10 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstMessage" className="block text-sm font-medium text-gray-300 mb-1">
                    First Message
                  </label>
                  <textarea
                    id="firstMessage"
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
                    placeholder="How your character introduces themselves"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    The first message your character will send when starting a conversation
                  </p>
                </div>
                
                <div>
                  <label htmlFor="personalityPrompt" className="block text-sm font-medium text-gray-300 mb-1">
                    Personality Prompt
                  </label>
                  <textarea
                    id="personalityPrompt"
                    value={personalityPrompt}
                    onChange={(e) => setPersonalityPrompt(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
                    placeholder="Instructions for the AI on how to behave as this character"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Define your character's personality, traits, and behavior
                  </p>
                </div>
              </div>
              
              <div>
                <label htmlFor="scenarioPrompt" className="block text-sm font-medium text-gray-300 mb-1">
                  Scenario Prompt
                </label>
                <textarea
                  id="scenarioPrompt"
                  value={scenarioPrompt}
                  onChange={(e) => setScenarioPrompt(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
                  placeholder="Describe the scenario or context for interactions with this character"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Set the scene, world, or situation where conversations with this character take place
                </p>
              </div>
              
              <div>
                <label htmlFor="exampleDialogue" className="block text-sm font-medium text-gray-300 mb-1">
                  Example Dialogue
                </label>
                <textarea
                  id="exampleDialogue"
                  value={exampleDialogue}
                  onChange={(e) => setExampleDialogue(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
                  placeholder="Example dialogue to help define your character's personality"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Format: Human: [message] Character: [response]
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2 bg-[#FDB777] text-black rounded-lg flex items-center gap-2 hover:bg-[#fca555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingCharacter ? (
              <>
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <IoSave className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 