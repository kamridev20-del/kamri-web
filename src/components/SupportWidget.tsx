'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'support'; time: Date }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Vérifier la disponibilité du support (simulation)
  useEffect(() => {
    const checkAvailability = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      // Support disponible Lun-Ven 9h-18h
      setIsOnline(day >= 1 && day <= 5 && hour >= 9 && hour < 18);
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 60000); // Vérifier chaque minute
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage = {
      text: message,
      sender: 'user' as const,
      time: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Simuler une réponse automatique après 2 secondes
    setTimeout(() => {
      const supportMessage = {
        text: isOnline
          ? 'Merci pour votre message ! Notre équipe vous répondra dans les plus brefs délais. En attendant, vous pouvez consulter notre FAQ ou nous contacter par email.'
          : 'Merci pour votre message ! Notre équipe est actuellement hors ligne. Nous vous répondrons dès notre retour (Lun-Ven, 9h-18h).',
        sender: 'support' as const,
        time: new Date(),
      };
      setMessages(prev => [...prev, supportMessage]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[45] w-12 h-12 sm:w-14 sm:h-14 bg-[#4CAF50] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#2E7D32] transition-colors"
        aria-label="Ouvrir le chat de support"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        {isOnline && (
          <motion.div
            className="absolute top-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Widget de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 z-[45] w-[calc(100vw-2rem)] sm:w-72 md:w-80 max-w-[calc(100vw-2rem)] h-[300px] sm:h-[340px] bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#4CAF50] text-white p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  {isOnline && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-[#4CAF50]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs sm:text-sm md:text-base truncate">Support KAMRI</div>
                  <div className="text-[10px] sm:text-xs text-white/80 flex items-center gap-1">
                    {isOnline ? (
                      <>
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                        <span className="truncate">En ligne</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                        <span className="truncate">Hors ligne</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                aria-label="Fermer le chat"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-xs sm:text-sm py-6 sm:py-8">
                  <MessageCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
                  <p>Bonjour ! Comment pouvons-nous vous aider ?</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 ${
                        msg.sender === 'user'
                          ? 'bg-[#4CAF50] text-white'
                          : 'bg-white text-gray-800 shadow-sm'
                      }`}
                    >
                      <p className="text-xs sm:text-sm leading-relaxed break-words">{msg.text}</p>
                      <p
                        className={`text-[10px] sm:text-xs mt-1 ${
                          msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                        }`}
                      >
                        {msg.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-2 sm:p-3 bg-white flex-shrink-0">
              <div className="flex gap-1.5 sm:gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-xs sm:text-sm"
                  disabled={!isOnline}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !isOnline}
                  className="p-1.5 sm:p-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#2E7D32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  aria-label="Envoyer le message"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              {!isOnline && (
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2 text-center">
                  Support disponible Lun-Ven, 9h-18h
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

