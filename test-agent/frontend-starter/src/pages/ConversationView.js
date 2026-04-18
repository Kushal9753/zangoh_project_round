// src/pages/ConversationView.js
// MODIFIED - Complete rewrite to match Figma Conversation Screen exactly
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Avatar,
  Badge,
  Input,
  Icon,
  Textarea,
  Divider,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiSend, FiMoreVertical, FiPlus, FiChevronDown, FiMic, FiMicOff, FiStar } from 'react-icons/fi';
import { useAppData } from '../context/AppDataContext';
import { useWebSocket } from '../context/WebSocketContext';
import TemplateModal from '../components/TemplateModal';
import { 
  getConversation, 
  addMessage, 
  updateConversationStatus,
  interveneInConversation,
  releaseIntervention,
} from '../api';

// ADDED - Status badge config matching Figma
const statusConfig = {
  active: { bg: '#DCFCE7', color: '#16A34A', label: 'Active' },
  waiting: { bg: '#FEF3C7', color: '#D97706', label: 'Waiting' },
  resolved: { bg: '#DBEAFE', color: '#2563EB', label: 'Resolved' },
  escalated: { bg: '#FCE7F3', color: '#DB2777', label: 'Escalated' },
};

// ADDED - Templates data
const templates = [
  { id: 1, name: 'Greeting', content: 'Hello! Thank you for reaching out. How can I help you today?' },
  { id: 2, name: 'Apology', content: 'I sincerely apologize for the inconvenience. Let me look into this right away.' },
  { id: 3, name: 'Shipping Update', content: 'I\'ve checked your order status. Your package is currently being processed and should arrive within 3-5 business days.' },
  { id: 4, name: 'Return Info', content: 'To initiate a return, please provide your order number and reason for return. We will process it within 24-48 hours.' },
  { id: 5, name: 'Escalation', content: 'I understand your concern. Let me connect you with a specialist who can better assist you.' },
  { id: 6, name: 'Closing', content: 'Is there anything else I can help you with? Thank you for contacting us!' },
];

// ADDED - Format relative time matching Figma "5m", "6m", "7m"
const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 60000);
  if (diff < 1) return 'now';
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
};

const ConversationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { conversations, updateConversation } = useAppData();
  
  const [conversation, setConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isAiActive, setIsAiActive] = useState(true);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [agentRating, setAgentRating] = useState(0);
  const [loadingConv, setLoadingConv] = useState(true);
  const [sending, setSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { isOpen: isModalOpen, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure();
  
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setMessageText(prev => {
            const newText = prev + (prev && !prev.endsWith(' ') ? ' ' : '') + currentTranscript;
            return newText;
          });
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    return () => {
       if (recognitionRef.current) {
         recognitionRef.current.stop();
       }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Could not start recognition", e);
      }
    }
  };

  // ADDED - Scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Handle redirect if no id is provided
  useEffect(() => {
    if (!id && conversations.length > 0) {
      const defaultConvId = conversations[0].id || conversations[0]._id;
      navigate(`/conversation/${defaultConvId}`, { replace: true });
    }
  }, [id, conversations, navigate]);

  // Load conversation from API when ID changes
  useEffect(() => {
    if (!id) return;
    
    let isMounted = true;
    
    const loadConversation = async () => {
      setLoadingConv(true);
      try {
        const data = await getConversation(id);
        if (!isMounted) return;
        setConversation(data);
        setIsAiActive(!data.humanIntervention?.occurred);
      } catch (err) {
        if (!isMounted) return;
        // Fallback to finding in context
        const conv = conversations.find(c => c.id === id || c._id === id);
        if (conv) {
          setConversation(conv);
          setIsAiActive(!conv.humanIntervention?.occurred);
        }
      } finally {
        if (isMounted) setLoadingConv(false);
      }
    };
    
    loadConversation();
    
    return () => {
      isMounted = false;
    };
  }, [id]); // Only run when ID changes, ignoring conversations updates

  // ADDED - Listen for WebSocket real-time simulated messages (Agent/Customer replies)
  const { lastMessage } = useWebSocket();
  useEffect(() => {
    if (!lastMessage || !conversation) return;

    if (lastMessage.type === 'message_update' && 
        (lastMessage.conversationId === conversation.id || lastMessage.conversationId === conversation._id)) {
      
      setConversation(prev => {
        // Prevent duplicate messages just in case
        const msgExists = prev.messages?.some(m => 
          m.text === lastMessage.message.text && m.sender === lastMessage.message.sender
        );
        
        if (msgExists) return prev;

        return {
          ...prev,
          messages: [...(prev.messages || []), lastMessage.message]
        };
      });
    }
  }, [lastMessage]); // We deliberately exclude conversation object dependency to avoid re-triggering loops

  // ADDED - Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, scrollToBottom]);

  // ADDED - Take Over functionality (aiActive = false)
  const handleTakeOver = async () => {
    try {
      const convId = conversation.id || conversation._id;
      await interveneInConversation(convId, 'supervisor-1', 'Taking over conversation');
      setIsAiActive(false);
      setConversation(prev => ({
        ...prev,
        status: 'escalated',
        humanIntervention: { occurred: true, supervisorId: 'supervisor-1', timestamp: new Date() }
      }));
    } catch (err) {
      // Just toggle locally if API fails
      setIsAiActive(false);
    }
  };

  // ADDED - Return to AI functionality (aiActive = true)
  const handleReturnToAI = async () => {
    try {
      const convId = conversation.id || conversation._id;
      await releaseIntervention(convId, feedbackNotes || 'Returning control to AI', agentRating);
      setIsAiActive(true);
      setConversation(prev => ({
        ...prev,
        status: 'active',
      }));
    } catch (err) {
      setIsAiActive(true);
    }
  };

  // ADDED - Send message as supervisor
  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;
    
    if (isAiActive) {
      await handleTakeOver();
    }
    
    setSending(true);
    const convId = conversation.id || conversation._id;
    
    try {
      const newMessage = await addMessage(convId, { 
        sender: 'supervisor', 
        text: messageText.trim() 
      });
      
      // ADDED - Instant UI update
      setConversation(prev => ({
        ...prev,
        messages: [...(prev.messages || []), {
          sender: 'supervisor',
          text: messageText.trim(),
          timestamp: new Date(),
        }],
      }));
      
      setMessageText('');

      // ADDED - Auto-fetch conversation after 3 seconds to catch the AI auto-reply
      setTimeout(async () => {
        try {
          const updatedConv = await getConversation(convId);
          setConversation(updatedConv);
        } catch (e) {
          console.error("Auto-fetch failed", e);
        }
      }, 3000);

    } catch (err) {
      // ADDED - Optimistic update even if API fails
      setConversation(prev => ({
        ...prev,
        messages: [...(prev.messages || []), {
          sender: 'supervisor',
          text: messageText.trim(),
          timestamp: new Date(),
        }],
      }));
      setMessageText('');
    } finally {
      setSending(false);
    }
  };

  // ADDED - Mark as Resolved
  const handleMarkResolved = async () => {
    try {
      const convId = conversation.id || conversation._id;
      await updateConversationStatus(convId, 'resolved');
      setConversation(prev => ({ ...prev, status: 'resolved' }));
      updateConversation(convId, { status: 'resolved' });
    } catch (err) {
      setConversation(prev => ({ ...prev, status: 'resolved' }));
    }
  };

  // ADDED - Insert template into message input
  const handleTemplateSelect = (template) => {
    setMessageText(template.content);
  };

  // ADDED - Handle Enter key to send
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loadingConv) {
    return (
      <Flex justify="center" align="center" h="80vh">
        <Spinner size="lg" color="#4A3B8F" />
      </Flex>
    );
  }

  if (!conversation) {
    return (
      <Flex justify="center" align="center" h="80vh">
        <Text color="gray.500">Conversation not found</Text>
      </Flex>
    );
  }

  const currentStatus = statusConfig[conversation.status] || statusConfig.active;

  return (
    <Flex h={{ base: 'auto', xl: 'calc(100vh - 80px)' }} direction={{ base: 'column', xl: 'row' }} gap={4} overflow={{ base: 'visible', xl: 'hidden' }}>
      {/* ==================== LEFT PANEL - Conversation List ==================== */}
      <Box
        w={{ base: '100%', xl: '260px' }}
        minW={{ base: '100%', xl: '260px' }}
        h={{ base: '300px', xl: 'auto' }}
        bg="white"
        borderRadius="2xl"
        boxShadow="0 1px 3px rgba(0,0,0,0.04)"
        border="1px solid"
        borderColor="gray.100"
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        {/* ADDED - Left panel header */}
        <Box px={5} pt={5} pb={3}>
          <Text fontSize="md" fontWeight="700" color="gray.800">
            Customer
          </Text>
          <Text fontSize="md" fontWeight="700" color="gray.800">
            Conversations
          </Text>
        </Box>

        {/* ADDED - Conversation list items */}
        <VStack spacing={0} align="stretch" flex="1" overflowY="auto" px={3}>
          {conversations.map((conv) => {
            const isSelected = (conv.id || conv._id) === id;
            const convStatus = statusConfig[conv.status] || statusConfig.active;
            
            return (
              <Box
                key={conv.id || conv._id}
                px={3}
                py={3}
                borderRadius="xl"
                bg={isSelected ? '#F9F8FF' : 'transparent'}
                borderLeft={isSelected ? '3px solid #4A3B8F' : '3px solid transparent'}
                cursor="pointer"
                _hover={{ bg: '#F9F8FF' }}
                transition="all 0.15s"
                onClick={() => navigate(`/conversation/${conv.id || conv._id}`)}
              >
                <Flex align="center" gap={2}>
                  <Avatar
                    size="xs"
                    name={conv.customer?.name}
                    bg="#E9D5FF"
                    color="#6B21A8"
                    fontSize="2xs"
                  />
                  <Box flex="1" minW={0}>
                    <Text fontSize="sm" fontWeight="600" color="gray.800" noOfLines={1}>
                      {conv.customer?.name || 'Unknown'}
                    </Text>
                    <Text fontSize="2xs" color="gray.400">
                      #{conv.id || conv._id}
                    </Text>
                  </Box>
                </Flex>
                
                {/* ADDED - Status badge + time */}
                <Flex align="center" gap={2} mt={1.5} ml={7}>
                  <Badge
                    bg={convStatus.bg}
                    color={convStatus.color}
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    fontWeight="500"
                    fontSize="2xs"
                  >
                    {convStatus.label}
                  </Badge>
                  <Flex align="center" gap={1}>
                    <Icon as={FiClock} boxSize={2.5} color="gray.400" />
                    <Text fontSize="2xs" color="gray.400">
                      {formatRelativeTime(conv.startTime)}
                    </Text>
                  </Flex>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      </Box>

      {/* ==================== CENTER PANEL - Chat Area ==================== */}
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        overflow="hidden"
        minH={{ base: '500px', xl: '0' }}
      >
        {/* ADDED - Chat header with user info + Take Over button */}
        <Box
          bg="white"
          borderRadius="2xl"
          px={5}
          py={3}
          mb={3}
          boxShadow="0 1px 3px rgba(0,0,0,0.04)"
          border="1px solid"
          borderColor="gray.100"
        >
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={3}>
              <Avatar
                size="sm"
                name={conversation.customer?.name}
                bg="#E9D5FF"
                color="#6B21A8"
                fontSize="xs"
              />
              <Box>
                <Flex align="center" gap={2}>
                  <Text fontWeight="700" fontSize="md" color="gray.800">
                    {conversation.customer?.name} - #{conversation.id || conversation._id}
                  </Text>
                </Flex>
                <Flex align="center" gap={2} mt={0.5}>
                  <Badge
                    bg={currentStatus.bg}
                    color={currentStatus.color}
                    px={2.5}
                    py={0.5}
                    borderRadius="full"
                    fontWeight="500"
                    fontSize="xs"
                  >
                    {isAiActive ? currentStatus.label : 'Supervisor Active'}
                  </Badge>
                  <Flex align="center" gap={1}>
                    <Icon as={FiClock} boxSize={3} color="gray.400" />
                    <Text fontSize="xs" color="gray.400">
                      {formatRelativeTime(conversation.startTime)}
                    </Text>
                  </Flex>
                </Flex>
              </Box>
            </Flex>
            
            {/* ADDED - Take Over / Return to AI button */}
            {isAiActive ? (
              <Button
                bg="#4A3B8F"
                color="white"
                size="sm"
                borderRadius="lg"
                px={5}
                fontWeight="600"
                _hover={{ bg: '#3D3178' }}
                onClick={handleTakeOver}
              >
                Take Over
              </Button>
            ) : (
              <Button
                bg="green.500"
                color="white"
                size="sm"
                borderRadius="lg"
                px={5}
                fontWeight="600"
                _hover={{ bg: 'green.600' }}
                onClick={handleReturnToAI}
              >
                Return to AI
              </Button>
            )}
          </Flex>
        </Box>

        {/* ADDED - Chat messages area */}
        <Box
          flex="1"
          bg="white"
          borderRadius="2xl"
          boxShadow="0 1px 3px rgba(0,0,0,0.04)"
          border="1px solid"
          borderColor="gray.100"
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          {/* Messages */}
          <VStack
            flex="1"
            overflowY="auto"
            spacing={4}
            px={5}
            py={4}
            align="stretch"
          >
            {(conversation.messages || []).map((msg, index) => {
              const isCustomer = msg.sender === 'customer';
              const isSupervisor = msg.sender === 'supervisor';
              const isAgent = msg.sender === 'agent';
              
              return (
                <Flex
                  key={index}
                  justify={isCustomer ? 'flex-start' : 'flex-end'}
                  align="flex-start"
                  gap={2}
                >
                  {/* ADDED - Customer avatar on left */}
                  {isCustomer && (
                    <Avatar
                      size="sm"
                      name={conversation.customer?.name}
                      bg="#E9D5FF"
                      color="#6B21A8"
                      fontSize="xs"
                      mt={1}
                    />
                  )}
                  
                  <Box maxW="70%">
                    {/* ADDED - Chat label matching Figma "+ Chat" */}
                    {(isAgent || isSupervisor) && (
                      <Flex justify="flex-end" mb={1}>
                        <Flex align="center" gap={1}>
                          <Icon as={FiPlus} boxSize={2.5} color="gray.400" />
                          <Text fontSize="2xs" color="gray.400">
                            {isSupervisor ? 'Supervisor' : 'Chat'}
                          </Text>
                        </Flex>
                      </Flex>
                    )}
                    
                    <Box
                      bg={isCustomer ? 'white' : '#FEF3C7'}
                      border={isCustomer ? '1px solid' : 'none'}
                      borderColor="gray.200"
                      px={4}
                      py={3}
                      borderRadius={isCustomer ? '2xl' : '2xl'}
                      borderTopLeftRadius={isCustomer ? '4px' : '2xl'}
                      borderTopRightRadius={isCustomer ? '2xl' : '4px'}
                      position="relative"
                    >
                      <Flex justify="space-between" align="flex-start">
                        <Text fontSize="sm" color="gray.700" lineHeight="1.5">
                          {msg.text}
                        </Text>
                        {(isAgent || isSupervisor) && (
                          <Icon 
                            as={FiMoreVertical} 
                            color="gray.400" 
                            boxSize={3.5} 
                            ml={2} 
                            mt={0.5}
                            cursor="pointer"
                            flexShrink={0}
                          />
                        )}
                      </Flex>
                    </Box>
                  </Box>
                </Flex>
              );
            })}
            <div ref={chatEndRef} />
          </VStack>

          {/* ADDED - Message input area matching Figma */}
          <Box px={4} py={3} borderTop="1px solid" borderColor="gray.100">
            <Flex
              bg="gray.50"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.200"
              align="center"
              px={4}
              py={2}
            >
              <Input
                variant="unstyled"
                placeholder="Respond"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                fontSize="sm"
                color="gray.600"
                _placeholder={{ color: 'gray.400' }}
                flex="1"
              />
              
              {/* ADDED - Mic Button */}
              <Box
                as="button"
                onClick={toggleListening}
                color={isListening ? 'red.500' : 'gray.400'}
                mr={3}
                cursor="pointer"
                _hover={{ color: isListening ? 'red.600' : 'gray.600' }}
                transition="color 0.15s"
                display="flex"
                alignItems="center"
              >
                <Icon as={isListening ? FiMic : FiMicOff} boxSize={4} />
              </Box>
              
              {/* ADDED - New Template Button opening the Modal */}
              <Button
                size="xs"
                bg="#F0F0F8"
                color="gray.600"
                borderRadius="full"
                fontWeight="500"
                px={2}
                py={4}
                mr={3}
                onClick={onOpenModal}
                _hover={{ bg: '#E2E2F0' }}
                display="flex"
                alignItems="center"
                gap={1.5}
              >
                <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" size="2xs" />
                <Text fontSize="xs">Template</Text>
                <Icon as={FiChevronDown} boxSize={3} color="gray.500" />
              </Button>

              <TemplateModal 
                isOpen={isModalOpen} 
                onClose={onCloseModal} 
                onSelect={(template) => handleTemplateSelect(template)} 
              />
              
              {/* ADDED - Send button */}
              <Box
                as="button"
                onClick={handleSendMessage}
                color={messageText.trim() ? '#4A3B8F' : 'gray.400'}
                cursor={messageText.trim() ? 'pointer' : 'not-allowed'}
                _hover={{ color: messageText.trim() ? '#3D3178' : 'gray.400' }}
                transition="color 0.15s"
                disabled={sending}
              >
                <Icon as={FiSend} boxSize={5} strokeWidth="2" />
              </Box>
            </Flex>
          </Box>
        </Box>
      </Box>

      {/* ==================== RIGHT PANEL - Customer Details ==================== */}
      <Box
        w={{ base: '100%', xl: '280px' }}
        minW={{ base: '100%', xl: '280px' }}
        display="flex"
        flexDirection="column"
        gap={0}
        overflow="hidden"
      >
        <Box
          bg="white"
          borderRadius="2xl"
          boxShadow="0 1px 3px rgba(0,0,0,0.04)"
          border="1px solid"
          borderColor="gray.100"
          flex="1"
          display="flex"
          flexDirection="column"
          overflow="auto"
          px={5}
          py={5}
        >
          {/* ADDED - Customer Details header */}
          <Text fontSize="md" fontWeight="700" color="gray.800" mb={4}>
            Customer Details
          </Text>
          
          {/* ADDED - Customer avatar + info matching Figma */}
          <Flex direction="column" align="center" mb={5}>
            <Avatar
              size="lg"
              name={conversation.customer?.name}
              bg="#E9D5FF"
              color="#6B21A8"
              fontSize="md"
              mb={2}
            />
            <Text fontWeight="700" fontSize="md" color="gray.800">
              {conversation.customer?.name}
            </Text>
            <Text fontSize="sm" color="gray.400">
              #{conversation.customer?.id || conversation.id}
            </Text>
          </Flex>
          
          {/* ADDED - Address info */}
          <Text fontSize="xs" color="gray.500" lineHeight="1.6" mb={5}>
            1234 Elm Street, Suite 567,{'\n'}
            Springfield, IL, 62704 ,United{'\n'}
            States
          </Text>

          <Divider mb={4} />
          
          {/* ADDED - Conversation Metrics */}
          <Text fontSize="xs" color="gray.400" fontWeight="500" mb={2}>
            Conversation Metrics
          </Text>
          <Flex align="center" gap={2} mb={4}>
            <Badge
              bg={currentStatus.bg}
              color={currentStatus.color}
              px={3}
              py={1}
              borderRadius="full"
              fontWeight="500"
              fontSize="xs"
            >
              {currentStatus.label}
            </Badge>
            <Flex align="center" gap={1}>
              <Icon as={FiClock} boxSize={3} color="gray.400" />
              <Text fontSize="xs" color="gray.400">
                {formatRelativeTime(conversation.startTime)}
              </Text>
            </Flex>
          </Flex>

          <Divider mb={4} />

          {/* ADDED - Tags matching Figma */}
          <Text fontSize="xs" color="gray.400" fontWeight="500" mb={2}>
            Tags
          </Text>
          <Flex gap={2} mb={5} flexWrap="wrap">
            {(conversation.tags || []).slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                bg="gray.100"
                color="gray.600"
                px={3}
                py={1}
                borderRadius="md"
                fontWeight="500"
                fontSize="xs"
              >
                #{tag}
              </Badge>
            ))}
          </Flex>

          <Divider mb={4} />

          {/* ADDED - Agent Performance Feedback */}
          <Text fontSize="xs" color="gray.400" fontWeight="500" mb={2}>
            Agent Performance Rating
          </Text>
          <Flex gap={1} mb={4}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                as={FiStar}
                boxSize={5}
                cursor="pointer"
                fill={star <= agentRating ? '#F59E0B' : 'transparent'}
                color={star <= agentRating ? '#F59E0B' : 'gray.300'}
                onClick={() => setAgentRating(star)}
                _hover={{ color: '#F59E0B' }}
                transition="all 0.15s"
              />
            ))}
          </Flex>

          <Divider mb={4} />

          {/* ADDED - Feedback Notes matching Figma yellow textarea */}
          <Text fontSize="xs" color="gray.400" fontWeight="500" mb={2}>
            Feedback Notes
          </Text>
          <Textarea
            placeholder="Write here..."
            value={feedbackNotes}
            onChange={(e) => setFeedbackNotes(e.target.value)}
            bg="#FEF3C7"
            border="none"
            borderRadius="xl"
            fontSize="sm"
            color="gray.600"
            _placeholder={{ color: 'gray.400' }}
            _focus={{ border: 'none', boxShadow: 'none' }}
            rows={4}
            resize="none"
            mb={4}
          />
          
          {/* ADDED - Mark as Resolved button matching Figma */}
          <Button
            bg="#4A3B8F"
            color="white"
            w="100%"
            borderRadius="xl"
            size="md"
            fontWeight="600"
            _hover={{ bg: '#3D3178' }}
            onClick={handleMarkResolved}
            mt="auto"
          >
            Mark as Resolved
          </Button>
        </Box>
      </Box>
    </Flex>
  );
};

export default ConversationView;
