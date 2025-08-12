import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe, X, Settings, User, Shield } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderRole: 'admin' | 'consultant' | 'client';
  originalText: string;
  originalLanguage: string;
  translatedText?: string;
  targetLanguage?: string;
  timestamp: Date;
  isTranslated: boolean;
}

interface MultilingualChatProps {
  isOpen: boolean;
  onClose: () => void;
  chatType: 'admin-consultant' | 'consultant-client';
  currentUserId: string;
  currentUserRole: 'admin' | 'consultant' | 'client';
  targetUserId?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' }
];

// Mock DeepL translation function
const translateText = async (text: string, targetLang: string): Promise<string> => {
  // In real implementation, this would call DeepL API
  // For demo purposes, we'll simulate translation
  await new Promise(resolve => setTimeout(resolve, 500));
  return `[${targetLang.toUpperCase()}] ${text}`;
};

const MultilingualChat: React.FC<MultilingualChatProps> = ({
  isOpen,
  onClose,
  chatType,
  currentUserId,
  currentUserRole,
  targetUserId
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock messages for demo
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let mockMessages: Message[] = [];
      
      if (chatType === 'admin-consultant') {
        mockMessages = [
          {
            id: '1',
            senderId: 'admin-1',
            senderRole: 'admin',
            originalText: 'Hello! How are your clients doing this week?',
            originalLanguage: 'en',
            translatedText: 'Merhaba! Bu hafta müşterileriniz nasıl gidiyor?',
            targetLanguage: 'tr',
            timestamp: new Date(Date.now() - 3600000),
            isTranslated: true
          },
          {
            id: '2',
            senderId: currentUserId,
            senderRole: currentUserRole,
            originalText: 'Everything is going well. I have 3 new clients from Georgia this week.',
            originalLanguage: selectedLanguage,
            timestamp: new Date(Date.now() - 1800000),
            isTranslated: false
          }
        ];
      } else if (chatType === 'consultant-client') {
        mockMessages = [
          {
            id: '1',
            senderId: 'client-1',
            senderRole: 'client',
            originalText: 'Hello, I need help with my company registration documents.',
            originalLanguage: 'en',
            translatedText: 'Merhaba, şirket kayıt belgelerim konusunda yardıma ihtiyacım var.',
            targetLanguage: 'tr',
            timestamp: new Date(Date.now() - 7200000),
            isTranslated: true
          },
          {
            id: '2',
            senderId: currentUserId,
            senderRole: currentUserRole,
            originalText: 'Merhaba! Tabii ki yardımcı olabilirim. Hangi belgeler eksik?',
            originalLanguage: 'tr',
            translatedText: 'Hello! Of course I can help. Which documents are missing?',
            targetLanguage: 'en',
            timestamp: new Date(Date.now() - 6900000),
            isTranslated: true
          },
          {
            id: '3',
            senderId: 'client-1',
            senderRole: 'client',
            originalText: 'I need the bank account opening documents and tax registration forms.',
            originalLanguage: 'en',
            translatedText: 'Banka hesabı açma belgeleri ve vergi kayıt formlarına ihtiyacım var.',
            targetLanguage: 'tr',
            timestamp: new Date(Date.now() - 3600000),
            isTranslated: true
          }
        ];
      }
      
      setMessages(mockMessages);
    }
  }, [isOpen, chatType, currentUserId, currentUserRole, selectedLanguage]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageId = Date.now().toString();
    const originalMessage: Message = {
      id: messageId,
      senderId: currentUserId,
      senderRole: currentUserRole,
      originalText: newMessage,
      originalLanguage: selectedLanguage,
      timestamp: new Date(),
      isTranslated: false
    };

    setMessages(prev => [...prev, originalMessage]);
    setNewMessage('');

    // Auto-translate for the recipient
    if (selectedLanguage !== 'en') {
      setIsTranslating(true);
      try {
        const translatedText = await translateText(newMessage, 'en');
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, translatedText, targetLanguage: 'en', isTranslated: true }
            : msg
        ));
      } catch (error) {
        console.error('Translation failed:', error);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getChatTitle = () => {
    switch (chatType) {
      case 'admin-consultant':
        return 'Admin Chat';
      case 'consultant-client':
        return 'Client Messages';
      default:
        return 'Chat';
    }
  };

  const getRecipientInfo = () => {
    switch (chatType) {
      case 'admin-consultant':
        return { name: 'System Admin', role: 'Administrator', avatar: '👑' };
      case 'consultant-client':
        return { name: 'Tech Startup LLC', role: 'Client', avatar: '👤' };
      default:
        return { name: 'User', role: 'User', avatar: '👤' };
    }
  };

  if (!isOpen) return null;

  const recipientInfo = getRecipientInfo();
  const selectedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg">
              {recipientInfo.avatar}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{getChatTitle()}</h3>
              <p className="text-sm text-gray-500">{recipientInfo.name} • {recipientInfo.role}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Globe className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">{selectedLang?.flag} {selectedLang?.name}</span>
              </button>
              
              {showLanguageSelector && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        setShowLanguageSelector(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 ${
                        selectedLanguage === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="text-sm">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.senderId === currentUserId;
            
            return (
              <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isOwnMessage 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {/* Role indicator */}
                  <div className={`flex items-center space-x-1 mb-1 ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.senderRole === 'admin' && <Shield className="h-3 w-3" />}
                    {message.senderRole === 'consultant' && <User className="h-3 w-3" />}
                    {message.senderRole === 'client' && <User className="h-3 w-3" />}
                    <span className="text-xs font-medium capitalize">{message.senderRole}</span>
                  </div>
                  
                  {/* Original message */}
                  <p className="text-sm">{message.originalText}</p>
                  
                  {/* Translation */}
                  {message.isTranslated && message.translatedText && (
                    <div className={`mt-2 pt-2 border-t ${
                      isOwnMessage ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      <div className={`flex items-center space-x-1 mb-1 ${
                        isOwnMessage ? 'text-blue-200' : 'text-gray-400'
                      }`}>
                        <Globe className="h-3 w-3" />
                        <span className="text-xs">Auto-translated</span>
                      </div>
                      <p className={`text-sm ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {message.translatedText}
                      </p>
                    </div>
                  )}
                  
                  <p className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          
          {isTranslating && (
            <div className="flex justify-center">
              <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Translating...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Type your message in ${selectedLang?.name}...`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isTranslating}
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 flex items-center space-x-2">
            <Globe className="h-3 w-3" />
            <span>Messages will be auto-translated for the recipient</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultilingualChat;