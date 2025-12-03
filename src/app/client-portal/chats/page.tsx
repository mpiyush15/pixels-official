'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Clock, CheckCheck } from 'lucide-react';
import { ChatMessage } from '@/types/chat';

interface ProjectWithMessages {
  projectId: string;
  projectName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  lastSender: 'client' | 'admin';
}

export default function ClientChatsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithMessages[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWithMessages | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [clientInfo, setClientInfo] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/client-auth/session');
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/client-portal/login');
        return;
      }

      setClientInfo({
        id: data.client.id,
        name: data.client.name,
        email: data.client.email,
      });

      fetchProjectChats();
    } catch (error) {
      router.push('/client-portal/login');
    }
  };

  const fetchProjectChats = async () => {
    try {
      // Fetch all conversations for this client in one API call
      const response = await fetch('/api/chat/client-conversations');
      const data = await response.json();

      if (response.status === 401) {
        router.push('/client-portal/login');
        return;
      }

      if (data.success && data.conversations) {
        setProjects(data.conversations);
        
        // Update selected project if it exists
        if (selectedProject) {
          const updated = data.conversations.find((p: ProjectWithMessages) => p.projectId === selectedProject.projectId);
          if (updated) {
            setSelectedProject(updated);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching project chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (projectId: string) => {
    try {
      // NOW mark as read when actually viewing the conversation
      const response = await fetch(`/api/chat/messages?projectId=${projectId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
        // Don't call fetchProjectChats here - let the polling handle it
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedProject || !clientInfo || sending) return;

    setSending(true);
    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.projectId,
          projectName: selectedProject.projectName,
          clientId: clientInfo.id,
          clientName: clientInfo.name,
          clientEmail: clientInfo.email,
          sender: 'client',
          senderName: clientInfo.name,
          message: newMessage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        fetchMessages(selectedProject.projectId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      fetchMessages(selectedProject.projectId);
      // DISABLED: Poll for new messages every 5 seconds when viewing a conversation
      // const interval = setInterval(() => {
      //   fetchMessages(selectedProject.projectId);
      // }, 5000);
      // return () => clearInterval(interval);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (!loading && projects.length > 0) {
      // DISABLED: Poll for new messages in conversations list every 10 seconds
      // const interval = setInterval(fetchProjectChats, 10000);
      // return () => clearInterval(interval);
    }
  }, [loading]); // Only depend on loading, not projects.length

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-light text-black">Project Chats</h2>
          <p className="text-sm text-gray-500 font-light mt-1">
            {projects.length} conversation{projects.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {projects.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-light">No conversations yet</p>
              <p className="text-xs mt-2 font-light">
                Start a chat from your projects page
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <motion.div
                key={project.projectId}
                whileHover={{ backgroundColor: '#f9fafb' }}
                onClick={() => setSelectedProject(project)}
                className={`p-4 cursor-pointer border-b border-gray-100 ${
                  selectedProject?.projectId === project.projectId
                    ? 'bg-purple-50 border-l-4 border-l-purple-600'
                    : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-light text-gray-800 text-sm truncate">
                    {project.projectName}
                  </h3>
                  {project.unreadCount > 0 && (
                    <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1 ml-2 font-light">
                      {project.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate font-light">
                  {project.lastSender === 'client' ? 'You: ' : '💼 Team: '}
                  {project.lastMessage}
                </p>
                <p className="text-xs text-gray-400 mt-1 font-light">
                  {new Date(project.lastMessageTime).toLocaleString()}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedProject ? (
          <>
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
              <h3 className="font-light text-lg">{selectedProject.projectName}</h3>
              <p className="text-xs opacity-90 font-light">Chat with Pixels Digital Team</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-light">No messages yet</p>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-3 rounded-lg ${
                          msg.sender === 'client'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <p className="text-xs font-light mb-1 opacity-80">
                          {msg.senderName}
                        </p>
                        <p className="text-sm whitespace-pre-wrap font-light">{msg.message}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <p
                            className={`text-xs font-light ${
                              msg.sender === 'client' ? 'text-purple-200' : 'text-gray-500'
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {msg.sender === 'client' && msg.read && (
                            <CheckCheck className="w-3 h-3 text-purple-200" />
                          )}
                          {msg.sender === 'client' && !msg.read && (
                            <Clock className="w-3 h-3 text-purple-200" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex space-x-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none font-light"
                  rows={2}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-purple-600 text-white px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-light flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-light">Select a conversation to start chatting</p>
              <p className="text-sm text-gray-400 mt-2 font-light">
                Choose a project from the left to view messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
