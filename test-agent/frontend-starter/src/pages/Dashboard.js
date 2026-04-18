// src/pages/Dashboard.js
// MODIFIED - Complete rewrite to match Figma Dashboard design exactly
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  Button,
  Icon,
  SimpleGrid,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Select,
  Stack,
  FormLabel,
  FormControl,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FiArrowUp, FiArrowDown, FiSliders, FiArrowUpRight } from 'react-icons/fi';
import { useAppData } from '../context/AppDataContext';
import ConversationList from '../components/ConversationList';
import MetricsCard from '../components/MetricsCard';

// ADDED - Simple CSAT Bar Chart component matching Figma
const CSATBarChart = ({ csat }) => {
  // ADDED - Bar data matching Figma visual (5 bars with varying heights)
  const bars = [
    { height: 45, label: '' },
    { height: 65, label: '' },
    { height: 55, label: '' },
    { height: 80, label: '' },
    { height: 90, label: 'Today' },
  ];

  return (
    <Box>
      <Flex align="flex-end" gap={3} h="120px" px={2}>
        {bars.map((bar, i) => (
          <Box key={i} flex="1" display="flex" flexDirection="column" alignItems="center" h="100%" justifyContent="flex-end">
            {/* ADDED - "Today" label on last bar */}
            {bar.label && (
              <Text fontSize="2xs" color="gray.400" mb={1} fontWeight="500">
                {bar.label}
              </Text>
            )}
            <Box
              w="100%"
              maxW="35px"
              h={`${bar.height}%`}
              bg={i === bars.length - 1 ? '#4A3B8F' : '#C4B5FD'}
              borderRadius="md"
              transition="height 0.3s"
            />
          </Box>
        ))}
      </Flex>
      {/* MODIFIED - Live Score label at bottom */}
      <Text fontSize="xs" color="gray.400" mt={2} textAlign="right" fontWeight="500">
        {csat}
      </Text>
    </Box>
  );
};

const Dashboard = () => {
  const { conversations, agents, loading, error } = useAppData();
  const [activeTab, setActiveTab] = useState('all');
  
  // ADDED - Filter states for the popover
  const [statusFilter, setStatusFilter] = useState('all');
  const [alertFilter, setAlertFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');

  // ADDED - State to store real-time SSE metrics
  const [liveMetrics, setLiveMetrics] = useState({
    activeConversations: 0,
    escalationRate: 0,
    avgResponseTime: "01:24",
    csat: "7.9"
  });

  // ADDED - Set up EventSource for 2-second real-time metrics stream
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    const eventSource = new EventSource(`${apiUrl}/api/analytics/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLiveMetrics(data);
      } catch (err) {
        console.error('Error parsing SSE data', err);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      // Optional: Close on error to prevent constant retrying if server is down
      // eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);
  
  // ADDED - Filter conversations based on active tab and popover filters
  const getFilteredConversations = () => {
    let filtered = conversations;

    // Apply tab filter
    if (activeTab === 'attention') {
      filtered = filtered.filter(conv => conv.alertLevel === 'high' || conv.alertLevel === 'medium');
    }

    // Apply specific metrics filters
    if (statusFilter !== 'all') {
      filtered = filtered.filter(conv => conv.status === statusFilter);
    }

    if (alertFilter !== 'all') {
      filtered = filtered.filter(conv => conv.alertLevel === alertFilter);
    }

    if (agentFilter !== 'all') {
      filtered = filtered.filter(conv => (conv.agent?.id === agentFilter || conv.agent?._id === agentFilter));
    }

    return filtered;
  };

  // ADDED - Tab items matching Figma
  const tabs = [
    { id: 'all', label: 'All Conversations' },
    { id: 'attention', label: 'Needs Attention', dot: true },
    { id: 'performance', label: 'Agent Performance' },
  ];

  return (
    <Box>
      {/* MODIFIED - Metrics section matching Figma layout: CSAT (large), Avg Response Time, Active + Escalation stacked */}
      <Grid
        templateColumns={{ base: '1fr', lg: '1fr 1fr 1fr' }}
        gap={4}
        mb={6}
      >
        {/* ADDED - CSAT Card with bar chart matching Figma */}
        <GridItem>
          <Box
            bg="white"
            borderRadius="2xl"
            p={5}
            boxShadow="0 1px 3px rgba(0,0,0,0.04)"
            border="1px solid"
            borderColor="gray.100"
            h="100%"
          >
            <Text fontSize="md" fontWeight="600" color="gray.700" mb={1}>
              Customer Satisfaction
            </Text>
            <Text fontSize="sm" color="gray.400" mb={4}>
              Score (CSAT)
            </Text>
            <CSATBarChart csat={liveMetrics.csat} />
          </Box>
        </GridItem>

        {/* ADDED - Avg Response Time card matching Figma "01:24" */}
        <GridItem>
          <Box
            bg="white"
            borderRadius="2xl"
            p={5}
            boxShadow="0 1px 3px rgba(0,0,0,0.04)"
            border="1px solid"
            borderColor="gray.100"
            h="100%"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Text fontSize="sm" color="gray.500" fontWeight="500" mb={3}>
              Avg. Response Time
            </Text>
            <Text fontSize="5xl" fontWeight="700" color="gray.800" lineHeight="1">
              {liveMetrics.avgResponseTime}
            </Text>
            {/* ADDED - Red indicator icon */}
            <Box
              mt={3}
              w={8}
              h={8}
              borderRadius="full"
              bg="red.50"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiArrowDown} color="red.500" boxSize={4} />
            </Box>
          </Box>
        </GridItem>

        {/* ADDED - Right column with Active Conversations + Escalation Rate stacked */}
        <GridItem>
          <Flex direction="column" gap={4} h="100%">
            {/* Active Conversations card */}
            <Box
              bg="white"
              borderRadius="2xl"
              p={5}
              boxShadow="0 1px 3px rgba(0,0,0,0.04)"
              border="1px solid"
              borderColor="gray.100"
              flex="1"
            >
              <Text fontSize="sm" color="gray.500" fontWeight="500" mb={1}>
                Active Conversations
              </Text>
              <Flex justify="space-between" align="center">
                <Text fontSize="3xl" fontWeight="700" color="gray.800">
                  {liveMetrics.activeConversations}
                </Text>
                <Box
                  w={8}
                  h={8}
                  borderRadius="full"
                  bg="green.50"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiArrowUp} color="green.500" boxSize={4} />
                </Box>
              </Flex>
            </Box>
            
            {/* Escalation Rate card */}
            <Box
              bg="white"
              borderRadius="2xl"
              p={5}
              boxShadow="0 1px 3px rgba(0,0,0,0.04)"
              border="1px solid"
              borderColor="gray.100"
              flex="1"
            >
              <Text fontSize="sm" color="gray.500" fontWeight="500" mb={1}>
                Escalation Rate
              </Text>
              <Flex justify="space-between" align="center">
                <Text fontSize="3xl" fontWeight="700" color="gray.800">
                  {liveMetrics.escalationRate}%
                </Text>
                <Box
                  w={8}
                  h={8}
                  borderRadius="full"
                  bg="red.50"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiArrowDown} color="red.500" boxSize={4} />
                </Box>
              </Flex>
            </Box>
          </Flex>
        </GridItem>
      </Grid>
      
      {/* ADDED - Tab bar matching Figma exactly with light gray pill container */}
      <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'center' }} justify="space-between" mb={6} gap={{ base: 4, md: 0 }}>
        <Flex gap={1} p={1} bg="#F4F4F5" borderRadius="full" overflowX="auto" whiteSpace="nowrap" className="hide-scroll">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              borderRadius="full"
              bg={activeTab === tab.id ? '#4A3B8F' : 'transparent'}
              color={activeTab === tab.id ? 'white' : 'gray.500'}
              fontWeight="500"
              fontSize="sm"
              px={5}
              py={2}
              border="none"
              _hover={{
                bg: activeTab === tab.id ? '#3D3178' : 'gray.200',
              }}
              onClick={() => setActiveTab(tab.id)}
              leftIcon={tab.dot ? (
                <Box w={2} h={2} borderRadius="full" bg={activeTab === tab.id ? 'white' : 'red.500'} />
              ) : undefined}
            >
              {tab.label}
            </Button>
          ))}
        </Flex>
        
        {/* ADDED - Action icons matching Figma (filter + arrow link) */}
        <Flex gap={3} justify={{ base: 'flex-end', md: 'flex-start' }}>
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Box
                as="button"
                w={10}
                h={10}
                borderRadius="full"
                bg="#F4F4F5"
                display="flex"
                alignItems="center"
                justifyContent="center"
                _hover={{ bg: 'gray.200' }}
                transition="all 0.2s"
              >
                <Icon as={FiSliders} color="gray.800" boxSize={4} />
              </Box>
            </PopoverTrigger>
            <PopoverContent w="300px" borderRadius="xl" boxShadow="xl" _focus={{ outline: 'none' }}>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader fontWeight="600" borderBottomWidth="1px">Filters</PopoverHeader>
              <PopoverBody p={4}>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.600">Status</FormLabel>
                    <Select size="sm" borderRadius="md" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="waiting">Waiting</option>
                      <option value="resolved">Resolved</option>
                      <option value="escalated">Escalated</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.600">Alert Level</FormLabel>
                    <Select size="sm" borderRadius="md" value={alertFilter} onChange={(e) => setAlertFilter(e.target.value)}>
                      <option value="all">All</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.600">Agent</FormLabel>
                    <Select size="sm" borderRadius="md" value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)}>
                      <option value="all">All Agents</option>
                      {agents.map(agent => (
                        <option key={agent.id || agent._id} value={agent.id || agent._id}>
                          {agent.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          <Box
            as={Link}
            to="/conversations"
            w={10}
            h={10}
            borderRadius="full"
            bg="#F4F4F5"
            display="flex"
            alignItems="center"
            justifyContent="center"
            _hover={{ bg: 'gray.200' }}
            transition="all 0.2s"
            cursor="pointer"
          >
            <Icon as={FiArrowUpRight} color="gray.800" boxSize={5} />
          </Box>
        </Flex>
      </Flex>
      
      {/* MODIFIED - Conversations table */}
      <ConversationList 
        conversations={getFilteredConversations()}
        loading={loading.conversations}
        error={error.conversations}
      />
    </Box>
  );
};

export default Dashboard;