// src/components/ConversationList.js
// MODIFIED - Rewritten to match Figma conversations table exactly
import React, { useState, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stack,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// ADDED - Status badge color mapping matching Figma exactly (Red/Yellow/Green/Blue outlined)
const statusConfig = {
  active: { bg: '#FFE4E6', color: '#E11D48', border: '1px solid #FDA4AF', label: 'Active' },
  waiting: { bg: '#FEF3C7', color: '#D97706', border: '1px solid #FCD34D', label: 'Waiting' },
  resolved: { bg: '#DCFCE7', color: '#16A34A', border: '1px solid #86EFAC', label: 'Resolved' },
  escalated: { bg: '#E0F2FE', color: '#0284C7', border: '1px solid #7DD3FC', label: 'Escalated' },
};

// ADDED - Format time to HH:MM AM/PM matching Figma
const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

const ConversationList = ({ conversations, loading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alertFilter, setAlertFilter] = useState('all');

  const navigate = useNavigate();

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const matchesSearch = searchTerm === '' || 
        conv.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.tags && conv.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
      const matchesAlert = alertFilter === 'all' || conv.alertLevel === alertFilter;
      
      return matchesSearch && matchesStatus && matchesAlert;
    });
  }, [conversations, searchTerm, statusFilter, alertFilter]);

  const handleConversationClick = (id) => {
    navigate(`/conversation/${id}`);
  };

  if (loading) {
    return <Box p={4}>Loading conversations...</Box>;
  }

  if (error) {
    return <Box p={4} color="red.500">Error loading conversations: {error}</Box>;
  }

  return (
    <Box>
      {/* ADDED - Table view matching Figma exactly */}
      <Box bg="white" borderRadius="2xl" overflowX="auto" boxShadow="0 1px 3px rgba(0,0,0,0.04)">
        {filteredConversations.length === 0 ? (
          <Box p={6} textAlign="center" color="gray.500">
            No conversations match your filters
          </Box>
        ) : (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th 
                  color="gray.400" 
                  fontWeight="500" 
                  fontSize="xs" 
                  textTransform="capitalize"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  py={3}
                >
                  Name
                </Th>
                <Th 
                  color="gray.400" 
                  fontWeight="500" 
                  fontSize="xs" 
                  textTransform="capitalize"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  py={3}
                >
                  Message
                </Th>
                <Th 
                  color="gray.400" 
                  fontWeight="500" 
                  fontSize="xs" 
                  textTransform="capitalize"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  py={3}
                >
                  Status
                </Th>
                <Th 
                  color="gray.400" 
                  fontWeight="500" 
                  fontSize="xs" 
                  textTransform="capitalize"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  py={3}
                >
                  Time
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredConversations.map((conversation) => {
                const status = statusConfig[conversation.status] || statusConfig.active;
                const lastMessage = conversation.messages?.length > 0 
                  ? conversation.messages[conversation.messages.length - 1]?.text 
                  : 'No messages yet';
                
                return (
                  <Tr
                    key={conversation.id || conversation._id}
                    _hover={{ bg: '#F9F8FF', cursor: 'pointer' }}
                    onClick={() => handleConversationClick(conversation.id || conversation._id)}
                    transition="background 0.15s"
                  >
                    {/* ADDED - Name column with avatar */}
                    <Td borderBottom="1px solid" borderColor="gray.50" py={3}>
                      <Flex align="center" gap={3}>
                        <Avatar 
                          size="sm" 
                          name={conversation.customer?.name || 'Unknown'}
                          bg="#E9D5FF"
                          color="#6B21A8"
                          fontSize="xs"
                          fontWeight="600"
                        />
                        <Text fontWeight="600" fontSize="sm" color="gray.700">
                          {conversation.customer?.name || 'Unknown'}
                        </Text>
                      </Flex>
                    </Td>
                    
                    {/* ADDED - Message preview column */}
                    <Td borderBottom="1px solid" borderColor="gray.50" py={3} maxW="300px">
                      <Text fontSize="sm" color="gray.500" noOfLines={2}>
                        {lastMessage?.substring(0, 60)}...
                      </Text>
                    </Td>
                    
                    {/* ADDED - Status badge column matching Figma colors */}
                    <Td borderBottom="1px solid" borderColor="gray.50" py={3}>
                      <Flex align="center">
                        <Box
                          bg={status.bg}
                          color={status.color}
                          border={status.border}
                          px={8}
                          py={1}
                          borderRadius="full"
                          fontWeight="500"
                          fontSize="xs"
                          textTransform="capitalize"
                          textAlign="center"
                          minW="100px"
                        >
                          {status.label}
                        </Box>
                      </Flex>
                    </Td>
                    
                    {/* ADDED - Time column */}
                    <Td borderBottom="1px solid" borderColor="gray.50" py={3}>
                      <Text fontSize="sm" color="gray.400">
                        {formatTime(conversation.startTime)}
                      </Text>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
};

export default ConversationList;