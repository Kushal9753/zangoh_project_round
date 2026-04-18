// src/components/MetricsCard.js
// MODIFIED - Rewritten to match Figma metrics cards exactly
import React from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
} from '@chakra-ui/react';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

const MetricsCard = ({ title, value, icon, iconColor, change, changeType }) => {
  return (
    <Box
      bg="white"
      borderRadius="2xl"
      p={5}
      boxShadow="0 1px 3px rgba(0,0,0,0.04)"
      border="1px solid"
      borderColor="gray.100"
      position="relative"
      overflow="hidden"
    >
      {/* MODIFIED - Title */}
      <Text fontSize="sm" color="gray.500" fontWeight="500" mb={2}>
        {title}
      </Text>
      
      {/* MODIFIED - Value + Icon row */}
      <Flex justify="space-between" align="center">
        <Text fontSize="3xl" fontWeight="700" color="gray.800" lineHeight="1">
          {value}
        </Text>
        
        {/* ADDED - Circular icon matching Figma */}
        {icon && (
          <Box
            w={10}
            h={10}
            borderRadius="full"
            bg={iconColor === 'green' ? 'green.50' : iconColor === 'red' ? 'red.50' : 'gray.50'}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon
              as={icon}
              boxSize={5}
              color={iconColor === 'green' ? 'green.500' : iconColor === 'red' ? 'red.500' : 'gray.500'}
            />
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default MetricsCard;