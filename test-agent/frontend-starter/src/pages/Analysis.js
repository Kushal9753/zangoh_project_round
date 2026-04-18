import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
  Input,
  InputRightElement,
  Icon,
  VStack,
  Badge,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import { 
  FiSearch, 
  FiSliders, 
  FiMoreVertical, 
  FiTrash2, 
  FiEdit2, 
  FiArrowRight,
  FiMessageSquare,
  FiMonitor,
  FiUsers,
  FiCalendar,
} from 'react-icons/fi';
import { getTemplates, seedTemplates, deleteTemplate } from '../api';
import CreateTemplateModal from '../components/CreateTemplateModal';
import EditTemplateModal from '../components/EditTemplateModal';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const { isOpen: isCreateModalOpen, onOpen: onOpenCreateModal, onClose: onCloseCreateModal } = useDisclosure();
  const [editingTemplate, setEditingTemplate] = useState(null);
  const { isOpen: isEditModalOpen, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();

  const handleDeleteTemplate = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id && t._id !== id));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleEditTemplateClick = (e, template) => {
    e.stopPropagation();
    setEditingTemplate(template);
    onOpenEditModal();
  };

  const handleTemplateUpdated = (updatedTemplate) => {
    setTemplates(prev => prev.map(t => (t.id === updatedTemplate.id || t._id === updatedTemplate._id) ? updatedTemplate : t));
  };


  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // Automatically try to seed templates first so they exist if the DB is fresh
        await seedTemplates();
        const data = await getTemplates();
        setTemplates(data || []);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const getChannelIcon = (channel) => {
    switch (channel?.toLowerCase()) {
      case 'website': return FiMonitor;
      default: return FiMessageSquare;
    }
  };

  const getChannelColor = (channel) => {
    switch (channel?.toLowerCase()) {
      case 'website': return '#8B5CF6'; // Purple
      case 'message': return '#10B981'; // Green
      default: return '#3B82F6'; // Blue
    }
  };

  return (
    <Flex gap={6} h={{ base: 'auto', md: 'calc(100vh - 100px)' }} direction={{ base: 'column', md: 'row' }}>
      {/* ===== INNER LEFT SIDEBAR ===== */}
      <Box 
        w={{ base: '100%', md: '240px' }} 
        minW={{ base: '100%', md: '240px' }} 
        bg="white" 
        borderRadius="2xl" 
        p={5} 
        boxShadow="0 1px 3px rgba(0,0,0,0.04)"
        border="1px solid"
        borderColor="gray.100"
        overflowY="auto"
      >
        <InputGroup size="sm" mb={6}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input 
            placeholder="Search" 
            borderRadius="full" 
            bg="gray.50" 
            border="none"
            _focus={{ ring: 2, ringColor: '#4A3B8F' }}
          />
          <InputRightElement>
            <Box 
              as="button" 
              bg="gray.200" 
              w={6} 
              h={6} 
              borderRadius="full" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              mr={1}
            >
              <Icon as={FiSliders} color="gray.600" boxSize={3} />
            </Box>
          </InputRightElement>
        </InputGroup>

        <VStack align="stretch" spacing={1} mb={6}>
          <Box px={3} py={2} borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.50' }}>
            <Text fontSize="sm" color="gray.600" fontWeight="500">All</Text>
          </Box>
          <Box px={3} py={2} borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.50' }}>
            <Text fontSize="sm" color="gray.600" fontWeight="500">Popular</Text>
          </Box>
        </VStack>

        <Text fontSize="xs" color="gray.400" px={3} mb={2} fontWeight="500">Use Cases</Text>
        <VStack align="stretch" spacing={1} mb={6}>
          <Box px={3} py={2} bg="#E5E7EB" borderRadius="lg" cursor="pointer">
            <Text fontSize="sm" color="gray.800" fontWeight="600">Onboarding</Text>
          </Box>
          <Box px={3} py={2} borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.50' }}>
            <Text fontSize="sm" color="gray.600" fontWeight="500">Return</Text>
          </Box>
          <Box px={3} py={2} borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.50' }}>
            <Text fontSize="sm" color="gray.600" fontWeight="500">Engagement</Text>
          </Box>
          <Box px={3} py={2} borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.50' }}>
            <Text fontSize="sm" color="gray.600" fontWeight="500">Transaction</Text>
          </Box>
        </VStack>

        <Text fontSize="xs" color="gray.400" px={3} mb={2} fontWeight="500">Channels</Text>
        <VStack align="stretch" spacing={1}>
          <Box px={3} py={2} borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.50' }}>
            <Text fontSize="sm" color="gray.600" fontWeight="500">Website</Text>
          </Box>
          <Box px={3} py={2} borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.50' }}>
            <Text fontSize="sm" color="gray.600" fontWeight="500">Mobile</Text>
          </Box>
          <Box px={3} py={2} borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.50' }}>
            <Text fontSize="sm" color="gray.600" fontWeight="500">Messenger</Text>
          </Box>
        </VStack>
      </Box>

      {/* ===== MAIN CONTENT AREA ===== */}
      <Box 
        flex="1" 
        bg="white" 
        borderRadius="2xl" 
        p={8} 
        boxShadow="0 1px 3px rgba(0,0,0,0.04)"
        border="1px solid"
        borderColor="gray.100"
        overflowY="auto"
      >
        {/* Header */}
        <Flex justify="space-between" align={{ base: 'start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={4} mb={6}>
          <Text fontSize="2xl" fontWeight="600" color="gray.700">
            Response Templates
          </Text>
          <Button 
            bg="#4A3B8F" 
            color="white" 
            borderRadius="full" 
            px={6}
            _hover={{ bg: '#3D3178' }}
            fontWeight="600"
            onClick={onOpenCreateModal}
          >
            Create Template
          </Button>
        </Flex>

        <CreateTemplateModal 
          isOpen={isCreateModalOpen} 
          onClose={onCloseCreateModal} 
          onTemplateCreated={(newTemplate) => setTemplates(prev => [newTemplate, ...prev])} 
        />

        {/* Pills */}
        <Flex gap={3} mb={8}>
          <Button 
            bg="#4A3B8F" 
            color="white" 
            borderRadius="full" 
            px={6} 
            size="sm"
            _hover={{ bg: '#3D3178' }}
          >
            My Templates
          </Button>
          <Button 
            bg="gray.100" 
            color="gray.600" 
            borderRadius="full" 
            px={6} 
            size="sm"
            fontWeight="500"
            _hover={{ bg: 'gray.200' }}
          >
            Shared Templates
          </Button>
        </Flex>

        {/* Templates Grid */}
        {loading ? (
          <Flex justify="center" align="center" h="40vh">
            <Spinner size="lg" color="#4A3B8F" />
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, xl: 3 }} spacingMax={10} spacingX={8} spacingY={14} position="relative">
            {templates.map((template, idx) => (
              <Box position="relative" key={template.id || idx}>
                {/* Card */}
                <Box
                  bg="white"
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor={hoveredCard === template.id ? 'gray.300' : 'gray.100'}
                  p={3}
                  boxShadow={hoveredCard === template.id ? 'xl' : 'sm'}
                  transition="all 0.2s"
                  onMouseEnter={() => setHoveredCard(template.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  position="relative"
                  zIndex={2}
                  h="100%"
                  display="flex"
                  flexDirection="column"
                  gap={3}
                >
                  {/* Mock Message Container (Top Grey Box) */}
                  <Box 
                    bg="#F3F4F6" 
                    borderRadius="xl" 
                    p={4} 
                    pb={6}
                  >
                    <Flex bg="white" p={3} borderRadius="lg" align="flex-start" gap={3} boxShadow="sm">
                      <Flex 
                        align="center" 
                        gap={1.5} 
                        bg="#EFF6FF" 
                        color="#3B82F6" 
                        px={3} 
                        py={1} 
                        borderRadius="full" 
                        fontSize="xs" 
                        fontWeight="600"
                        flexShrink={0}
                      >
                        ✦ Chat
                      </Flex>
                      <Text fontSize="sm" color="gray.600" flex="1" noOfLines={3} lineHeight="tall">
                        {template.content.split(/(<[^>]+>)/).map((part, i) => 
                          part.startsWith('<') && part.endsWith('>') ? 
                            <Text as="span" color="gray.400" key={i}>{part}</Text> : part
                        )}
                      </Text>
                      <Icon as={FiMoreVertical} color="gray.400" boxSize={4} mt={1} flexShrink={0} />
                    </Flex>
                  </Box>

                  {/* Title & Badges Box (Bottom Grey Box) */}
                  <Box 
                    bg="#F3F4F6" 
                    borderRadius="xl" 
                    p={5} 
                    display="flex" 
                    flexDirection="column"
                    flex="1"
                  >
                    <Text fontWeight="500" fontSize="lg" mb={6} color="black" lineHeight="short">
                      {template.name}
                    </Text>

                    <Flex gap={3} mt="auto" flexWrap="wrap">
                      <Flex bg="#E5E7EB" color="gray.600" borderRadius="full" px={3} py={1.5} alignItems="center" gap={1.5} fontSize="xs" fontWeight="500">
                        <Icon as={getChannelIcon(template.channel)} /> {template.channel || 'Chat'}
                      </Flex>
                      <Flex bg="#E5E7EB" color="gray.600" borderRadius="full" px={3} py={1.5} alignItems="center" gap={1.5} fontSize="xs" fontWeight="500">
                        <Icon as={FiUsers} /> {template.audience || 1234}
                      </Flex>
                      <Flex bg="#E5E7EB" color="gray.600" borderRadius="full" px={3} py={1.5} alignItems="center" gap={1.5} fontSize="xs" fontWeight="500">
                        <Icon as={FiCalendar} /> {template.dateString || 'Feb 7'}
                      </Flex>
                    </Flex>
                  </Box>
                </Box>

                {/* Floating Action Buttons (Visual representation matching Figma 'connected' UI or shown on hover) */}
                <Flex 
                  position="absolute"
                  bottom="-45px"
                  bg="transparent"
                  left="10%"
                  gap={3}
                  opacity={hoveredCard === template.id || idx === 0 ? 1 : 0}
                  transform={hoveredCard === template.id || idx === 0 ? 'translateY(0)' : 'translateY(-10px)'}
                  transition="all 0.3s ease"
                  zIndex={1}
                >
                  {/* Decorative curved line exactly mimicking Figma for the very first item */}
                  {(hoveredCard === template.id || idx === 0) && (
                    <Box 
                      position="absolute" 
                      top="-45px" 
                      left="-15px" 
                      w="35px" 
                      h="55px" 
                      borderLeft="2px solid" 
                      borderBottom="2px solid" 
                      borderColor="gray.300"
                      borderBottomLeftRadius="xl"
                      zIndex={0}
                    />
                  )}
                  
                  <Flex 
                    align="center" 
                    justify="center" 
                    w="32px" 
                    h="32px" 
                    bg="#FEE2E2" 
                    color="#EF4444" 
                    borderRadius="full" 
                    cursor="pointer"
                    _hover={{ bg: '#FECACA' }}
                    zIndex={2}
                    ml={4}
                    onClick={(e) => handleDeleteTemplate(e, template.id || template._id)}
                  >
                    <Icon as={FiTrash2} boxSize={3.5} />
                  </Flex>
                  <Flex 
                    align="center" 
                    justify="center" 
                    w="32px" 
                    h="32px" 
                    bg="#EFF6FF" 
                    color="#3B82F6" 
                    borderRadius="full" 
                    cursor="pointer"
                    _hover={{ bg: '#DBEAFE' }}
                    zIndex={2}
                    onClick={(e) => handleEditTemplateClick(e, template)}
                  >
                    <Icon as={FiEdit2} boxSize={3} />
                  </Flex>
                  <Flex 
                    align="center" 
                    justify="center" 
                    w="32px" 
                    h="32px" 
                    bg="#DCFCE7" 
                    color="#22C55E" 
                    borderRadius="full" 
                    cursor="pointer"
                    _hover={{ bg: '#BBF7D0' }}
                    zIndex={2}
                  >
                    <Icon as={FiArrowRight} boxSize={4} />
                  </Flex>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        )}

        <EditTemplateModal 
          isOpen={isEditModalOpen} 
          onClose={onCloseEditModal} 
          template={editingTemplate}
          onTemplateUpdated={handleTemplateUpdated}
        />
      </Box>
    </Flex>
  );
};

export default TemplatesPage;
