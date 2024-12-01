'use client';

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatBubble } from "@/components/ChatBubble";
import { InputBar } from "@/components/InputBar";
import { TypingIndicator } from "@/components/TypingIndicator";
import { LoadingScreen } from "@/components/LoadingScreen";

interface Message {
  id: number;
  text: string;
  type: 'narrative' | 'dialogue' | 'user';
  timestamp?: string;
  status?: 'error' | 'sent';
}

export default function ChatPage() {
  const params = useParams();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [character, setCharacter] = useState({
    name: params.name as string,
    image: "/bg2.png",
    notificationCount: 6
  });

  // Helper function to get time X minutes ago
  const getTimeAgo = (minutesAgo: number) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - minutesAgo);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Simulate loading of chat history and character data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Set initial messages
        setMessages([
          {
            id: 1,
            text: "Some people from her gang notice you and point you out. Mia looks over at you and raises an eyebrow, she gets off her motorcycle and walks towards you with her hands in her leather jacket pockets.",
            type: 'narrative',
            timestamp: getTimeAgo(5) // 5 minutes ago
          },
          {
            id: 2,
            text: "Hey",
            type: 'user',
            timestamp: getTimeAgo(4) // 4 minutes ago
          },
          {
            id: 3,
            text: "So you're the little brat we've been hearing about huh?",
            type: 'dialogue',
            timestamp: getTimeAgo(3) // 3 minutes ago
          }
        ]);

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading chat data:', error);
        // Handle error appropriately
      }
    };

    loadData();
  }, [params.name]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage: Message = {
        id: messages.length + 1,
        text: message,
        type: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage("");
      setIsTyping(true);

      try {
        // Simulate API call with 10% chance of failure
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Randomly fail 10% of the time
            if (Math.random() < 0.1) {
              reject(new Error('Failed to send message'));
            } else {
              resolve(true);
            }
          }, 3000);
        });

        // If successful, add response message
        const responseMessage: Message = {
          id: messages.length + 2,
          text: "You got some nerve showing up here like this.",
          type: 'dialogue',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, responseMessage]);
        setIsTyping(false);

      } catch (error) {
        // Update message status to error
        console.error(error);
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
        ));
        setIsTyping(false);
      }
    }
  };

  const handleRetry = async (messageId: number) => {
    setIsTyping(true);
    
    try {
      // Same 50% chance of failure for retries
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.5) {
            reject(new Error('Failed to send message'));
          } else {
            resolve(true);
          }
        }, 3000);
      });
      
      // If successful, add response message
      const responseMessage: Message = {
        id: messages.length + 1,
        text: "You got some nerve showing up here like this.",
        type: 'dialogue',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'sent' } : msg
      ));
      setMessages(prev => [...prev, responseMessage]);
      setIsTyping(false);
      
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'error' } : msg
      ));
      setIsTyping(false);
    }
  };

  const handleRegenerate = async () => {
    setIsTyping(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Remove the last system message and add a new one
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop(); // Remove last message
        return [...newMessages, {
          id: messages.length + 1,
          text: "Here's a regenerated response for you.",
          type: 'dialogue',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      });
      
      setIsTyping(false);
    } catch (error) {
      setIsTyping(false);
      // Handle error
    }
  };

  const handleRate = (rating: number) => {
    console.log(`Rated: ${rating} stars`);
    // Handle rating logic
  };

  // Scroll to bottom when new messages are added or typing indicator appears
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative bg-black h-screen fixed inset-0"
        >
          {/* Background Image */}
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-0"
          >
            <Image
              src={character.image}
              alt="background"
              fill
              className="object-cover"
            />
          </motion.div>

          <Header {...character} />

          {/* Main Content Area */}
          <div className="relative z-10 flex flex-col h-full pt-[68px] pb-[60px]">
            <div 
              ref={scrollRef} 
              className="flex-1 overflow-y-auto"
            >
              <div className="flex flex-col justify-end min-h-full">
                <div className="p-4 space-y-4">
                  {messages.map((msg, index) => (
                    <ChatBubble 
                      key={msg.id}
                      {...msg}
                      index={index}
                      isLatestReply={index === messages.length - 1 && msg.type !== 'user'}
                      onRetry={() => msg.id && handleRetry(msg.id)}
                      onRegenerate={handleRegenerate}
                      onRate={handleRate}
                    />
                  ))}
                  <AnimatePresence mode="wait">
                    {isTyping && (
                      <TypingIndicator key="typing-indicator" />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Input Bar */}
            <div 
              className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent"
            >
              <InputBar
                message={message}
                onChange={setMessage}
                onSend={handleSendMessage}
                placeholder={`Message ${character.name}`}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
