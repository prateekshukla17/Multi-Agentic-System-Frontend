import { useEffect, useRef, useState } from 'react';
import {
  IconAlertCircle,
  IconBriefcase,
  IconCheck,
  IconDeviceDesktop,
  IconPalette,
  IconSend,
  IconX,
} from '@tabler/icons-react';
import { io, Socket } from 'socket.io-client';
import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Button,
  Container,
  Group,
  Image,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import classes from './ChatInterface.module.css';

const AGENT_CONFIG = {
  'HR Assistant': {
    icon: IconBriefcase,
    color: 'blue',
    emoji: '👔',
  },
  'IT Assistant': {
    icon: IconDeviceDesktop,
    color: 'cyan',
    emoji: '💻',
  },
  'Image-Generator': {
    icon: IconPalette,
    color: 'pink',
    emoji: '🎨',
  },
};

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
  const viewport = useRef<HTMLDivElement>(null);
  const scrollToBottom = () =>
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });

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
      setConnectionError('Failed to connect to server');
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
    if (!input.trim() || !socket || !isConnected) return;

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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const getAgentBadge = (agent?: Message['agent']) => {
    if (!agent || !AGENT_CONFIG[agent]) return null;

    const config = AGENT_CONFIG[agent];
    const Icon = config.icon;

    return (
      <Badge variant="light" color={config.color} leftSection={<Icon size={14} />} size="sm">
        {config.emoji} {agent}
      </Badge>
    );
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="md" h="90vh">
        <Paper shadow="sm" p="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="xl" fw={700} c="white">
                Agentic-System
              </Text>
              <Text size="sm" c="dimmed">
                Multi-Agentic System (HR · IT · ImageGen)
              </Text>
            </div>
            <Group gap="xs">
              {isConnected ? (
                <>
                  <Text size="sm" c="green">
                    Connected
                  </Text>
                </>
              ) : (
                <>
                  <Text size="sm" c="red">
                    Disconnected
                  </Text>
                </>
              )}
            </Group>
          </Group>
        </Paper>

        {connectionError && (
          <Alert icon={<IconAlertCircle size={16} />} title="Connection Error" color="red">
            {connectionError}
          </Alert>
        )}

        <Paper
          shadow="sm"
          p="md"
          withBorder
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <ScrollArea h="100%" viewportRef={viewport} style={{ flex: 1 }}>
            <Stack gap="md" p="sm">
              {messages.length === 0 && (
                <Text c="dimmed" ta="center" mt="xl">
                  HR policies, IT support, or generate images.
                </Text>
              )}

              {messages.map((message) => (
                <Group
                  key={message.id}
                  align="flex-start"
                  gap="sm"
                  justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
                >
                  {message.role === 'assistant' && (
                    <Avatar color="blue" radius="xl">
                      🤖
                    </Avatar>
                  )}

                  <Stack gap="xs" style={{ maxWidth: '70%' }}>
                    {message.agent && getAgentBadge(message.agent)}

                    <Paper
                      shadow="xs"
                      p="sm"
                      withBorder
                      className={
                        message.role === 'user' ? classes.userMessage : classes.assistantMessage
                      }
                    >
                      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Text>

                      {message.imageUrl && (
                        <Image
                          src={`http://localhost:3000${message.imageUrl}`}
                          alt="Generated image"
                          mt="sm"
                          radius="md"
                          style={{ maxWidth: '100%', cursor: 'pointer' }}
                          onClick={() =>
                            window.open(`http://localhost:3000${message.imageUrl}`, '_blank')
                          }
                        />
                      )}
                    </Paper>

                    <Text size="xs" c="dimmed">
                      {message.timestamp.toLocaleTimeString()}
                    </Text>
                  </Stack>

                  {message.role === 'user' && (
                    <Avatar color="pink" radius="xl">
                      👤
                    </Avatar>
                  )}
                </Group>
              ))}

              {isTyping && (
                <Group align="flex-start" gap="sm">
                  <Avatar color="blue" radius="xl">
                    🤖
                  </Avatar>
                  <Paper shadow="xs" p="sm" withBorder className={classes.assistantMessage}>
                    <Loader size="sm" type="dots" />
                  </Paper>
                </Group>
              )}
            </Stack>
          </ScrollArea>
        </Paper>

        <Paper shadow="sm" p="md" withBorder>
          <Group gap="sm" align="flex-end">
            <TextInput
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!isConnected}
              style={{ flex: 1 }}
              size="md"
              rightSection={
                input.trim() && (
                  <ActionIcon variant="subtle" color="gray" onClick={() => setInput('')}>
                    <IconX size={16} />
                  </ActionIcon>
                )
              }
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || !isConnected}
              leftSection={<IconSend size={18} />}
              size="md"
              variant="gradient"
              gradient={{ from: 'pink', to: 'yellow' }}
            >
              Send
            </Button>
          </Group>
        </Paper>
      </Stack>
    </Container>
  );
}
