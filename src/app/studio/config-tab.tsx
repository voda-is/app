'use client';

import { useState } from 'react';
import { IoSave, IoRefresh, IoAdd, IoTrash } from 'react-icons/io5';
import { User, SystemConfig, FunctionObject } from '@/lib/types';
import { useSystemConfigs, useCreateSystemConfig, useUpdateSystemConfig, useDeleteSystemConfig } from '@/hooks/api';

interface ConfigTabProps {
  user: User | null | undefined;
}

export function ConfigTab({ user }: ConfigTabProps) {
  const [selectedConfig, setSelectedConfig] = useState<SystemConfig | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  // API hooks
  const { data: configs, isLoading, refetch } = useSystemConfigs();
  const createMutation = useCreateSystemConfig();
  const updateMutation = useUpdateSystemConfig();
  const deleteMutation = useDeleteSystemConfig();
  
  // Create a new empty config template
  const createNewConfig = () => {
    const newConfig: SystemConfig = {
      _id: "0000000000000000000000000000000000000000000000000000000000000000",
      updated_at: 0,
      
      name: "New Configuration",
      system_prompt: "You are a helpful AI assistant.",
      system_prompt_version: 1,
      openai_base_url: "https://openrouter.ai/api/v1",
      openai_model: "x-ai/grok-beta",
      openai_temperature: 1,
      openai_max_tokens: 2000,
      functions: []
    };
    
    setIsCreatingNew(true);
    createMutation.mutate(newConfig as SystemConfig, {
      onSuccess: (createdConfig) => {
        setSelectedConfig(createdConfig);
        setIsCreatingNew(false);
      },
      onError: (error) => {
        console.error('Failed to create config:', error);
        alert('Failed to create new configuration');
        setIsCreatingNew(false);
      }
    });
  };
  
  // Save the current config
  const handleSaveConfig = async () => {
    if (!selectedConfig) return;
    
    updateMutation.mutate(selectedConfig, {
      onSuccess: (updatedConfig) => {
        setSelectedConfig(updatedConfig);
      },
      onError: (error) => {
        console.error('Failed to update config:', error);
        alert('Failed to save configuration');
      }
    });
  };
  
  // Delete a config
  const handleDeleteConfig = async (configId: string) => {
    if (window.confirm('Are you sure you want to delete this configuration? This action cannot be undone.')) {
      deleteMutation.mutate(configId, {
        onSuccess: () => {
          if (selectedConfig?._id === configId) {
            setSelectedConfig(null);
          }
        },
        onError: (error) => {
          console.error('Failed to delete config:', error);
          alert('Failed to delete configuration');
        }
      });
    }
  };
  
  // Update a field in the selected config
  const handleInputChange = (key: keyof SystemConfig, value: any) => {
    if (!selectedConfig) return;
    
    setSelectedConfig({
      ...selectedConfig,
      [key]: value,
      updated_at: Math.floor(Date.now() / 1000)
    });
  };
  
  // Add a new function to the selected config
  const handleAddFunction = () => {
    if (!selectedConfig) return;
    
    const newFunction: FunctionObject = {
      name: "new_function",
      description: "Description of the new function",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    };
    
    setSelectedConfig({
      ...selectedConfig,
      functions: [...selectedConfig.functions, newFunction],
      updated_at: Math.floor(Date.now() / 1000)
    });
  };
  
  // Remove a function from the selected config
  const handleRemoveFunction = (index: number) => {
    if (!selectedConfig) return;
    
    const updatedFunctions = [...selectedConfig.functions];
    updatedFunctions.splice(index, 1);
    
    setSelectedConfig({
      ...selectedConfig,
      functions: updatedFunctions,
      updated_at: Math.floor(Date.now() / 1000)
    });
  };
  
  // Update a function in the selected config
  const handleFunctionChange = (index: number, key: keyof FunctionObject, value: any) => {
    if (!selectedConfig) return;
    
    const updatedFunctions = [...selectedConfig.functions];
    updatedFunctions[index] = {
      ...updatedFunctions[index],
      [key]: value
    };
    
    setSelectedConfig({
      ...selectedConfig,
      functions: updatedFunctions,
      updated_at: Math.floor(Date.now() / 1000)
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#FDB777]/20 border-t-[#FDB777] rounded-full" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Configuration</h1>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-white/10 text-white rounded-lg flex items-center gap-2 hover:bg-white/20 transition-colors"
          >
            <IoRefresh className="w-5 h-5" />
            Refresh
          </button>
          <button
            onClick={createNewConfig}
            disabled={isCreatingNew}
            className="px-4 py-2 bg-[#FDB777] text-black rounded-lg flex items-center gap-2 hover:bg-[#fca555] transition-colors"
          >
            {isCreatingNew ? (
              <div className="animate-spin w-5 h-5 border-2 border-black/20 border-t-black rounded-full" />
            ) : (
              <IoAdd className="w-5 h-5" />
            )}
            New Config
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Config List */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4">
            <h2 className="text-lg font-medium mb-4">Configurations</h2>
            
            {configs && configs.length > 0 ? (
              <div className="space-y-2">
                {configs.map((config) => (
                  <div 
                    key={config._id}
                    className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${
                      selectedConfig?._id === config._id
                        ? 'bg-[#FDB777]/20 border border-[#FDB777]/30'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedConfig(config)}
                  >
                    <div>
                      <h3 className="font-medium text-white">{config.name}</h3>
                      <p className="text-xs text-gray-400">
                        {new Date(config.updated_at * 1000).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConfig(config._id);
                      }}
                      className="p-1 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                    >
                      <IoTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No configurations found</p>
                <button
                  onClick={createNewConfig}
                  disabled={isCreatingNew}
                  className="px-4 py-2 bg-[#FDB777]/20 text-[#FDB777] rounded-lg inline-flex items-center gap-2 hover:bg-[#FDB777]/30 transition-colors"
                >
                  {isCreatingNew ? (
                    <div className="animate-spin w-5 h-5 border-2 border-[#FDB777]/20 border-t-[#FDB777] rounded-full" />
                  ) : (
                    <IoAdd className="w-5 h-5" />
                  )}
                  Create First Config
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Config Editor */}
        <div className="lg:col-span-3">
          {!selectedConfig ? (
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 text-center py-16">
              <h2 className="text-xl font-medium text-white mb-2">No configuration selected</h2>
              <p className="text-gray-400 mb-6">Select a configuration from the list or create a new one</p>
              <button
                onClick={createNewConfig}
                disabled={isCreatingNew}
                className="px-4 py-2 bg-[#FDB777] text-black rounded-lg inline-flex items-center gap-2 hover:bg-[#fca555] transition-colors"
              >
                {isCreatingNew ? (
                  <div className="animate-spin w-5 h-5 border-2 border-black/20 border-t-black rounded-full" />
                ) : (
                  <IoAdd className="w-5 h-5" />
                )}
                Create New Config
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  disabled={updateMutation.isPending}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    updateMutation.isSuccess
                      ? 'bg-green-500 text-white'
                      : 'bg-[#FDB777] text-black hover:bg-[#fca555]'
                  }`}
                >
                  {updateMutation.isPending ? (
                    <div className="animate-spin w-5 h-5 border-2 border-black/20 border-t-black rounded-full" />
                  ) : updateMutation.isSuccess ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Saved!
                    </>
                  ) : (
                    <>
                      <IoSave className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
              
              {/* Basic Info */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-medium mb-4">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Configuration Name
                    </label>
                    <input
                      type="text"
                      value={selectedConfig.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      System Prompt
                    </label>
                    <textarea
                      value={selectedConfig.system_prompt}
                      onChange={(e) => handleInputChange('system_prompt', e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      System Prompt Version
                    </label>
                    <input
                      type="number"
                      value={selectedConfig.system_prompt_version}
                      onChange={(e) => handleInputChange('system_prompt_version', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
                    />
                  </div>
                </div>
              </div>
              
              {/* OpenAI Settings */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-medium mb-4">OpenAI Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Base URL
                    </label>
                    <input
                      type="text"
                      value={selectedConfig.openai_base_url}
                      onChange={(e) => handleInputChange('openai_base_url', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
                      placeholder="e.g. https://openrouter.ai/api/v1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      value={selectedConfig.openai_model}
                      onChange={(e) => handleInputChange('openai_model', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
                      placeholder="e.g. x-ai/grok-beta"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Temperature ({selectedConfig.openai_temperature})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={selectedConfig.openai_temperature}
                      onChange={(e) => handleInputChange('openai_temperature', parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      value={selectedConfig.openai_max_tokens}
                      onChange={(e) => handleInputChange('openai_max_tokens', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
                    />
                  </div>
                </div>
              </div>
              
              {/* Functions */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">Functions</h2>
                  <button
                    onClick={handleAddFunction}
                    className="px-3 py-1 bg-[#FDB777]/20 text-[#FDB777] rounded-lg flex items-center gap-1 hover:bg-[#FDB777]/30 transition-colors"
                  >
                    <IoAdd className="w-4 h-4" />
                    Add Function
                  </button>
                </div>
                
                {selectedConfig.functions.length === 0 ? (
                  <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-gray-400">No functions defined</p>
                    <button
                      onClick={handleAddFunction}
                      className="mt-4 px-4 py-2 bg-[#FDB777]/20 text-[#FDB777] rounded-lg inline-flex items-center gap-2 hover:bg-[#FDB777]/30 transition-colors"
                    >
                      <IoAdd className="w-5 h-5" />
                      Add Your First Function
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedConfig.functions.map((func, index) => (
                      <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium text-white">Function #{index + 1}</h3>
                          <button
                            onClick={() => handleRemoveFunction(index)}
                            className="p-1 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                          >
                            <IoTrash className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={func.name}
                              onChange={(e) => handleFunctionChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={func.description}
                              onChange={(e) => handleFunctionChange(index, 'description', e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Parameters (JSON)
                            </label>
                            <textarea
                              value={JSON.stringify(func.parameters, null, 2)}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value);
                                  handleFunctionChange(index, 'parameters', parsed);
                                } catch (error) {
                                  // Don't update if JSON is invalid
                                }
                              }}
                              rows={5}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB777]/50 focus:border-[#FDB777]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 