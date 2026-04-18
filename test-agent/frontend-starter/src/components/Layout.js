// src/components/Layout.js
// MODIFIED - Responsive layout with mobile Drawer
import React from 'react';
import { Box, Flex, Drawer, DrawerOverlay, DrawerContent, useDisclosure, useBreakpointValue } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const isConversationPage = location.pathname.startsWith('/conversation');
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  return (
    <Flex direction={{ base: 'column', md: 'row' }} height="100vh" overflow="hidden" bg="#F5F3FF">
      {/* Sidebar (Only shown on Desktop) */}
      {!isMobile && (
        <Sidebar collapsed={isConversationPage} />
      )}
      
      <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
        <Box px={{ base: 2, md: 4 }} pt={{ base: 2, md: 3 }} pb={0}>
          <Header onOpenSidebar={onOpen} />
        </Box>
        
        <Box 
          as="main" 
          flex="1" 
          overflowY="auto"
          overflowX="hidden"
          p={{ base: 2, md: 4 }}
          pb={{ base: "80px", md: 4 }} // Padding bottom on mobile to accommodate BottomNav
        >
          {children}
        </Box>
      </Box>

      {/* Bottom Navigation Navbar (Only shown on Mobile) */}
      {isMobile && <BottomNav />}
    </Flex>
  );
};

export default Layout;