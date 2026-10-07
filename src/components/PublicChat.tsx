import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getRoleLabel } from '../utils/studentUtils';
import { MessageSquare, Send, CornerUpLeft } from 'lucide-react';

const EMOJIS = ['🔥', '💡', '🚀', '❤️', '📚', '👍'];

export const PublicChat: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    addChatReaction,
    currentUser,
    setIsRegisterModalOpen,
    setViewingStudent,
    students,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; authorName: string; text: string } | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!currentUser || currentUser.status !== 'APPROVED') {
      setIsRegisterModalOpen(true);
      return;
    }

    sendChatMessage(inputText.trim(), replyingTo || undefined);
    setInputText('');
    setReplyingTo(null);
  };

  const handleAuthorClick = (authorId: string) => {
    const student = students.find((s) => s.id === authorId);
    if (student) {
      setViewingStudent(student);
    }
  };

  return (
    <div className="w-full flex flex-col h-[650px] bg-[#150c28]/60 backdrop-blur-xl border-2 border-[#4b2f7e]/80 shadow-[6px_6px_0_rgba(6,4,16,0.65)] overflow-hidden font-mono">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b-2 border-[#4b2f7e]/70 flex items-center justify-between shrink-0 bg-[#1a1030]/70 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 border-2 border-[#f4e6c8] bg-[#f47b5c] text-[#1a1030] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#060410]">
            <MessageSquare className="w-5 h-5 text-[#1a1030]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">
              Class Discussion Lounge
            </h2>
            <p className="text-xs text-[#a08fd4]">
              Real-time peer chat & homework discussions · FE IT Div A
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-[#241548]/80 text-[#f47b5c] border border-[#4b2f7e] text-xs font-bold uppercase backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#f47b5c] animate-pulse" />
          <span>LIVE // SYNCHRONIZED</span>
        </div>
      </div>

      {/* Message Feed Area */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-[#0e0822]/50 backdrop-blur-md">
        {chatMessages.map((msg) => {
          const isOwn = currentUser?.id === msg.authorId;
          const roleTitle = getRoleLabel(msg.authorRole);

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-2xl ${isOwn ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Author Photo */}
              <button
                onClick={() => handleAuthorClick(msg.authorId)}
                className="w-8 h-8 border-2 border-[#f4e6c8] overflow-hidden bg-[#241548] shrink-0 hover:border-[#f9c74f] transition-all cursor-pointer shadow-[2px_2px_0_#060410]"
                title={`View ${msg.authorName}'s ID Card`}
              >
                <img
                  src={msg.authorPhoto}
                  alt={msg.authorName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>

              {/* Message Bubble */}
              <div className={`space-y-1.5 ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                {/* Meta details */}
                <div className={`flex items-center gap-2 text-[11px] text-[#a08fd4] ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <button
                    onClick={() => handleAuthorClick(msg.authorId)}
                    className="font-bold text-white uppercase hover:text-[#f9c74f] transition-colors cursor-pointer"
                  >
                    {msg.authorName}
                  </button>

                  <span className="text-[#f9c74f] font-mono text-[10px]">#{msg.authorRoll}</span>

                  {msg.authorRole !== 'STUDENT' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#241548] text-[#f47b5c] border border-[#4b2f7e]">
                      {roleTitle}
                    </span>
                  )}

                  <span>·</span>
                  <span className="text-[#a08fd4]">
                    {msg.timestamp || 'Just now'}
                  </span>
                </div>

                {/* Replying quote if present */}
                {msg.replyTo && (
                  <div
                    className={`text-xs px-3 py-1.5 border-2 text-[#b9a7e8] backdrop-blur-sm ${
                      isOwn ? 'bg-[#241548]/75 border-[#4b2f7e]' : 'bg-[#150c28]/75 border-[#4b2f7e]'
                    }`}
                  >
                    <span className="font-bold text-[#f9c74f]">@{msg.replyTo.authorName}: </span>
                    <span className="italic truncate">{msg.replyTo.text}</span>
                  </div>
                )}

                {/* Content Box */}
                <div
                  className={`px-4 py-2.5 text-xs leading-relaxed border-2 ${
                    isOwn
                      ? 'bg-[#f47b5c]/95 text-[#1a1030] font-bold border-[#f4e6c8] shadow-[3px_3px_0_#060410] backdrop-blur-sm'
                      : 'bg-[#1a1030]/65 text-[#f4e6c8] border-[#4b2f7e]/80 shadow-[3px_3px_0_#060410] backdrop-blur-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Actions & Reactions */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <button
                    onClick={() => setReplyingTo({ id: msg.id, authorName: msg.authorName, text: msg.content })}
                    className="text-[10px] font-bold uppercase text-[#a08fd4] hover:text-[#f9c74f] flex items-center gap-1 px-1.5 py-0.5 border border-transparent hover:border-[#4b2f7e] hover:bg-[#241548] transition-colors cursor-pointer"
                  >
                    <CornerUpLeft className="w-3 h-3" />
                    <span>Reply</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {EMOJIS.slice(0, 4).map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addChatReaction(msg.id, emoji)}
                        className="text-xs p-1 hover:bg-[#241548] border border-transparent hover:border-[#4b2f7e] transition-colors cursor-pointer"
                        title={`React with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex items-center gap-1 ml-1">
                      {Object.entries(msg.reactions).map(([emoji, count]) => (
                        <span
                          key={emoji}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-[#1a1030] border border-[#4b2f7e] shadow-xs"
                        >
                          <span>{emoji}</span>
                          <span className="font-mono text-[10px] text-[#f9c74f]">{count}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {chatMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#a08fd4] text-xs">
            <MessageSquare className="w-10 h-10 text-[#a08fd4] mb-2" />
            <span className="font-bold text-white uppercase">No messages in chat yet.</span>
            <span className="text-[11px] mt-1 text-[#a08fd4]">Start a discussion with your batchmates below.</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Replying Bar */}
      {replyingTo && (
        <div className="px-5 py-2 bg-[#241548] border-t-2 border-[#4b2f7e] flex items-center justify-between text-xs text-[#f4e6c8]">
          <div className="flex items-center gap-2 truncate">
            <CornerUpLeft className="w-3.5 h-3.5 text-[#f9c74f] shrink-0" />
            <span>Replying to <strong>{replyingTo.authorName}</strong>:</span>
            <span className="text-[#a08fd4] truncate max-w-sm">{replyingTo.text}</span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-[#f9c74f] hover:text-white font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Form Bar */}
      <form onSubmit={handleSendMessage} className="p-4 bg-[#150c28]/70 backdrop-blur-md border-t-2 border-[#4b2f7e]/70 flex items-center gap-2.5 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={currentUser ? 'Send a message to Class Division A...' : 'Register or sign in to participate in the class discussion...'}
          className="flex-1 px-4 py-2 bg-[#1a1030]/80 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410] backdrop-blur-sm"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="pixel-btn text-xs py-2 px-4 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
