
import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  text: string;
  timestamp: number;
  author: string;
}

interface SessionMessagingProps {
  messages: Message[];
  isTeacher: boolean;
  onSendMessage: (message: string) => void;
}

const SessionMessaging: React.FC<SessionMessagingProps> = ({
  messages,
  isTeacher,
  onSendMessage
}) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="bg-black/20 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="h-3 w-3 text-blue-400" />
        <h4 className="text-xs font-medium text-white">Class Messages</h4>
      </div>
      
      <div className="space-y-1 max-h-20 overflow-y-auto scrollbar-hide">
        {messages.length > 0 ? messages.slice(-3).map((message) => (
          <div key={message.id} className="text-xs text-white/80 bg-blue-500/10 rounded p-1">
            <span className="text-blue-400">[{message.author}]</span> {message.text}
          </div>
        )) : (
          <div className="text-xs text-white/50 text-center py-1">
            No messages yet
          </div>
        )}
      </div>
      
      {isTeacher && (
        <div className="flex gap-1 mt-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Send message to class..."
            className="text-xs h-7 bg-black/20 border-white/10 text-white"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button 
            size="sm" 
            onClick={handleSendMessage}
            className="h-7 px-2 bg-purple-500 hover:bg-purple-600"
            disabled={!newMessage.trim()}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SessionMessaging;
