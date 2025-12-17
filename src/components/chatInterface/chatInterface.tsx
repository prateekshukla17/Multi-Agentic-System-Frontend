import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: 'HR Assistant' | 'IT Assistant' | 'Image-Generator';
  imageUrl?: string;
  timestamp: Date;
}

export function ChatInterface() {
  const [socket, setSocket] = useState<Socket | null>;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    transport: ['websocket'];
  });
}
