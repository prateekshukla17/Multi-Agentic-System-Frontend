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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionError('Failed to connect to server. Is the backend running?');
      setIsConnected(false);
    });

    newSocket.on(
      'receive_message',
      (data: { content: string; agent?: string; imageUrl?: string }) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.content,
          agent: data.agent as Message['agent'],
          imageUrl: data.imageUrl,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
        setIsTyping(false);
        setTimeout(scrollToBottom, 100);
      }
    );

    newSocket.on('status', (status: string) => {
      console.log('Status:', status);
      setIsTyping(true);
    });

    newSocket.on('error', (error: { message: string }) => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    });
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (!input.trim() || !socket || isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    socket.emit('send_message', { message: input });
    setInput('');
    setIsTyping(true);
    setTimeout(scrollToBottom, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
}
