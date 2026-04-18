// src/components/Sidebar.js
// MODIFIED - Complete rewrite to match Figma design exactly
import React from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  Icon,
  useColorMode,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiMessageSquare, 
  FiBriefcase, 
  FiZap,
  FiSettings,
} from 'react-icons/fi';

const Sidebar = ({ collapsed = false, onClose }) => {
  const { colorMode } = useColorMode();
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  // ADDED - Nav items matching Figma exactly
  const navItems = [
    { name: 'Dashboard', icon: FiHome, path: '/' },
    { name: 'Conversations', icon: FiMessageSquare, path: '/conversations' },
    { name: 'AI Agents', icon: FiBriefcase, path: '/agent-config' },
    { name: 'Templates', icon: FiZap, path: '/analysis' },
  ];

  // ADDED - Collapsed sidebar for conversation page (icon-only)
  if (collapsed) {
    return (
      <Box
        w="70px"
        minW="70px"
        bg="white"
        borderRight="1px"
        borderColor="gray.100"
        display="flex"
        flexDirection="column"
        alignItems="center"
        py={6}
        h="100%"
      >
        <VStack spacing={6} flex="1">
          {navItems.map((item) => (
            <Box
              key={item.path}
              as={Link}
              to={item.path}
              p={3}
              borderRadius="xl"
              bg={isActive(item.path) ? '#F0EBFF' : 'transparent'}
              color={isActive(item.path) ? '#4A3B8F' : 'gray.400'}
              _hover={{ bg: '#F0EBFF', color: '#4A3B8F' }}
              transition="all 0.2s"
              onClick={onClose}
            >
              <Icon as={item.icon} boxSize={5} />
            </Box>
          ))}
        </VStack>
        
        <Box
          as={Link}
          to="/settings"
          p={3}
          borderRadius="xl"
          color="gray.400"
          _hover={{ bg: '#F0EBFF', color: '#4A3B8F' }}
          transition="all 0.2s"
          mt="auto"
          onClick={onClose}
        >
          <Icon as={FiSettings} boxSize={5} />
        </Box>
      </Box>
    );
  }

  // MODIFIED - Full sidebar matching Figma Dashboard layout
  return (
    <Box
      w="220px"
      minW="220px"
      bg="white"
      borderRadius={{ base: "none", md: "2xl" }}
      boxShadow="sm"
      my={{ base: 0, md: 4 }}
      ml={{ base: 0, md: 4 }}
      py={6}
      px={4}
      display="flex"
      flexDirection="column"
      h={{ base: '100%', md: 'calc(100vh - 32px)' }}
    >
      <VStack spacing={2} align="stretch" flex="1">
        {navItems.map((item) => (
          <Flex
            key={item.path}
            as={Link}
            to={item.path}
            align="center"
            gap={3}
            py={2.5}
            px={4}
            borderRadius="xl"
            bg={isActive(item.path) ? '#E6E1F0' : 'transparent'}
            color={isActive(item.path) ? '#3E3456' : 'gray.600'}
            fontWeight={isActive(item.path) ? '600' : '500'}
            fontSize="sm"
            _hover={{
              bg: isActive(item.path) ? '#E6E1F0' : '#F4F2F7',
              color: isActive(item.path) ? '#3E3456' : '#3E3456',
            }}
            transition="all 0.2s"
            textDecoration="none"
            onClick={onClose}
          >
            <Icon as={item.icon} boxSize={4} />
            <Text>{item.name}</Text>
          </Flex>
        ))}
      </VStack>
      
      {/* ADDED - Settings at bottom matching Figma */}
      <Flex
        as={Link}
        to="/settings"
        align="center"
        gap={3}
        py={2.5}
        px={4}
        borderRadius="xl"
        color="gray.600"
        fontWeight="500"
        fontSize="sm"
        _hover={{ bg: '#F0EBFF', color: '#4A3B8F' }}
        transition="all 0.2s"
        textDecoration="none"
        mt="auto"
        onClick={onClose}
      >
        <Icon as={FiSettings} boxSize={4} />
        <Text>Settings</Text>
      </Flex>
    </Box>
  );
};

export default Sidebar;