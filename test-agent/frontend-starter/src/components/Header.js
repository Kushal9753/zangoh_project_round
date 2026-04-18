// src/components/Header.js
// MODIFIED - Responsive header with hamburger menu for mobile
import React from 'react';
import {
  Box,
  Flex,
  Text,
  Avatar,
  IconButton,
  useBreakpointValue
} from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';

const Header = ({ onOpenSidebar }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      as="header"
      bg="#4A3B8F"
      px={{ base: 4, md: 6 }}
      py={2.5}
      borderRadius="xl"
      mx={0}
    >
      <Flex justify="space-between" align="center">
        <Flex align="center" gap={3}>
          {/* Hamburger menu replaced by BottomNav on mobile */}
          <Text fontSize="sm" fontWeight="600" color="white">
            ABC Company
          </Text>
        </Flex>
        
        <Avatar
          size="sm"
          name="Supervisor"
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
          border="2px solid"
          borderColor="whiteAlpha.600"
        />
      </Flex>
    </Box>
  );
};

export default Header;
