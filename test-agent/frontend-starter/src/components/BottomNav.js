import React from 'react';
import { Box, Flex, Text, Icon } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiZap, 
  FiBriefcase, 
  FiMessageSquare,
} from 'react-icons/fi';

const BottomNav = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  // Array of sidebar nav items
  const navItems = [
    { name: 'Dashboard', icon: FiHome, path: '/' },
    { name: 'Templates', icon: FiZap, path: '/analysis' },
    { name: 'Agents', icon: FiBriefcase, path: '/agent-config' },
    { name: 'Chats', icon: FiMessageSquare, path: '/conversations', isAccent: true },
  ];

  return (
    <Flex 
      as="nav"
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      bg="white"
      h="70px"
      px={3}
      boxShadow="0 -2px 10px rgba(0,0,0,0.05)"
      borderTop="1px solid"
      borderColor="gray.100"
      zIndex="1000"
      justify="space-between"
      align="center"
    >
      {navItems.map((item) => {
        const active = isActive(item.path);

        // Render the special accented "Connect" style button for the last item exactly as in the image
        if (item.isAccent) {
          return (
            <Flex
              key={item.path}
              as={Link}
              to={item.path}
              direction="column"
              align="center"
              justify="center"
              bg="#4A3B8F" // Project's primary purple
              h="55px"
              w="24%"
              borderRadius="xl"
              color="white"
              textDecoration="none"
              _hover={{ bg: '#3D3178' }}
              transition="background 0.2s"
            >
              <Icon as={item.icon} boxSize={5} mb={1} strokeWidth="2.5" />
              <Text fontSize="10px" fontWeight="500">{item.name}</Text>
            </Flex>
          );
        }

        // Standard nav item (Home, Courses, Profile styling)
        return (
          <Flex
            key={item.path}
            as={Link}
            to={item.path}
            position="relative"
            direction="column"
            align="center"
            justify="center"
            w="24%"
            h="100%"
            textDecoration="none"
            color={active ? "#4A3B8F" : "gray.400"} // Purple when active, grey when inactive
          >
            {active && (
              <Box 
                position="absolute"
                top="0" 
                w="32px"
                h="3px"
                bg="#4A3B8F" // Purple indicator
                borderBottomRadius="md"
              />
            )}
            <Icon 
               as={item.icon} 
               boxSize={6} 
               mb={1} 
               color={active ? "#4A3B8F" : "gray.400"} 
               strokeWidth={active ? "2.5" : "1.5"} // Slightly bolder when active
            />
            <Text fontSize="12px" fontWeight={active ? "500" : "400"}>
              {item.name}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
};

export default BottomNav;
