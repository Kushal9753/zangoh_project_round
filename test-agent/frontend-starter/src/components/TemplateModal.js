import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
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
  Badge,
  Spinner,
  FormControl,
  FormLabel,
  VStack,
} from '@chakra-ui/react';
import { 
  FiSearch, 
  FiSliders, 
  FiMoreVertical, 
  FiMessageSquare,
  FiMonitor,
  FiUsers,
  FiCalendar,
} from 'react-icons/fi';
import { getTemplates, seedTemplates } from '../api';

const TemplateModal = ({ isOpen, onClose, onSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [variableValues, setVariableValues] = useState({});

  useEffect(() => {
    if (selectedTemplate?.content) {
      const regex = /{{\s*([^}]+)\s*}}/g;
      let match;
      const vars = {};
      while ((match = regex.exec(selectedTemplate.content)) !== null) {
        vars[match[1]] = '';
      }
      setVariableValues(vars);
    } else {
      setVariableValues({});
    }
  }, [selectedTemplate]);

  const previewText = React.useMemo(() => {
    if (!selectedTemplate) return '';
    let text = selectedTemplate.content;
    Object.keys(variableValues).forEach(key => {
      const value = variableValues[key] || `{{${key}}}`;
      text = text.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value);
    });
    return text;
  }, [selectedTemplate, variableValues]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchTemplates = async () => {
      setLoading(true);
      try {
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
  }, [isOpen]);

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

  const handleInsert = () => {
    if (selectedTemplate) {
      onSelect({ ...selectedTemplate, content: previewText });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay bg="blackAlpha.300" />
      <ModalContent borderRadius="2xl" overflow="hidden" h="85vh">
        <ModalBody p={0} display="flex" h="100%">
          
          {/* ===== LEFT SIDEBAR (Similar to TemplatesPage) ===== */}
          <Box 
            w="220px" 
            bg="white" 
            p={5} 
            borderRight="1px solid"
            borderColor="gray.100"
            overflowY="auto"
          >
            <InputGroup size="xs" mb={6}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input 
                placeholder="Search" 
                borderRadius="full" 
                bg="gray.50" 
                border="none"
              />
              <InputRightElement>
                <Box 
                  as="button" 
                  bg="gray.200" 
                  w={5} 
                  h={5} 
                  borderRadius="full" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  mr={1}
                >
                  <Icon as={FiSliders} color="gray.600" boxSize={2.5} />
                </Box>
              </InputRightElement>
            </InputGroup>

            <VStack align="stretch" spacing={1} mb={6}>
              <Box px={3} py={1.5} borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.50' }}>
                <Text fontSize="xs" color="gray.600" fontWeight="500">All</Text>
              </Box>
              <Box px={3} py={1.5} borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.50' }}>
                <Text fontSize="xs" color="gray.600" fontWeight="500">Popular</Text>
              </Box>
            </VStack>

            <Text fontSize="2xs" color="gray.400" px={3} mb={2} fontWeight="500">Use Cases</Text>
            <VStack align="stretch" spacing={1} mb={6}>
              <Box px={3} py={1.5} bg="#E5E7EB" borderRadius="lg" cursor="pointer">
                <Text fontSize="xs" color="gray.800" fontWeight="600">Onboarding</Text>
              </Box>
              <Box px={3} py={1.5} borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.50' }}>
                <Text fontSize="xs" color="gray.600" fontWeight="500">Return</Text>
              </Box>
              <Box px={3} py={1.5} borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.50' }}>
                <Text fontSize="xs" color="gray.600" fontWeight="500">Engagement</Text>
              </Box>
              <Box px={3} py={1.5} borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.50' }}>
                <Text fontSize="xs" color="gray.600" fontWeight="500">Transaction</Text>
              </Box>
            </VStack>

            <Text fontSize="2xs" color="gray.400" px={3} mb={2} fontWeight="500">Channels</Text>
            <VStack align="stretch" spacing={1}>
              <Box px={3} py={1.5} borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.50' }}>
                <Text fontSize="xs" color="gray.600" fontWeight="500">Website</Text>
              </Box>
              <Box px={3} py={1.5} borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.50' }}>
                <Text fontSize="xs" color="gray.600" fontWeight="500">Mobile</Text>
              </Box>
              <Box px={3} py={1.5} borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.50' }}>
                <Text fontSize="xs" color="gray.600" fontWeight="500">Messenger</Text>
              </Box>
            </VStack>
          </Box>

          {/* ===== MIDDLE AREA (Templates Grid) ===== */}
          <Box flex="1" p={6} overflowY="auto" bg="white">
            <Text fontSize="xl" fontWeight="600" color="gray.800" mb={4}>
              Response Templates
            </Text>
            
            <Flex gap={3} mb={6}>
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

            {loading ? (
              <Flex justify="center" align="center" h="40vh">
                <Spinner size="lg" color="#4A3B8F" />
              </Flex>
            ) : (
              <SimpleGrid columns={2} spacing={6}>
                {templates.map((template) => (
                  <Box
                    key={template.id}
                    bg="white"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={selectedTemplate?.id === template.id ? 'gray.300' : 'gray.100'}
                    p={3}
                    boxShadow={selectedTemplate?.id === template.id ? 'xl' : 'sm'}
                    cursor="pointer"
                    onClick={() => setSelectedTemplate(template)}
                    _hover={{ borderColor: 'gray.300' }}
                    transition="all 0.2s"
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

                      <Flex gap={3} mt="auto">
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
                ))}
              </SimpleGrid>
            )}
          </Box>

          {/* ===== RIGHT AREA (Preview) ===== */}
          <Box 
            w="300px" 
            bg="white" 
            borderLeft="1px solid"
            borderColor="gray.100"
            p={6}
            display="flex"
            flexDirection="column"
          >
            <Text fontSize="lg" fontWeight="600" color="gray.800" mb={6}>
              Preview
            </Text>

            {selectedTemplate ? (
              <>
                <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" p={4} boxShadow="sm" mb={4}>
                  <Flex align="flex-start" gap={2}>
                    <Flex 
                      align="center" gap={1} 
                      bg={`${getChannelColor(selectedTemplate.channel)}15`} 
                      color={getChannelColor(selectedTemplate.channel)} 
                      px={1.5} py={0.5} borderRadius="md" 
                      fontSize="xs" fontWeight="700" flexShrink={0}
                    >
                      <Box w="4px" h="4px" borderRadius="100%" bg={getChannelColor(selectedTemplate.channel)} />
                      {selectedTemplate.channel || 'Chat'}
                    </Flex>
                    <Text fontSize="sm" color="gray.700" flex="1" lineHeight="base" whiteSpace="pre-wrap">
                      {previewText}
                    </Text>
                    <Icon as={FiMoreVertical} color="gray.300" boxSize={4} flexShrink={0} />
                  </Flex>
                </Box>

                {Object.keys(variableValues).length > 0 && (
                  <Box mb={6} maxH="300px" overflowY="auto" pr={1}>
                    <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>Fill Variables</Text>
                    <VStack spacing={3}>
                      {Object.keys(variableValues).map(key => (
                        <FormControl key={key}>
                          <FormLabel fontSize="xs" color="gray.500" mb={1} textTransform="capitalize">
                            {key.replace(/_/g, ' ')}
                          </FormLabel>
                          <Input 
                            size="sm" 
                            borderRadius="lg"
                            placeholder={`Enter ${key}...`} 
                            value={variableValues[key]} 
                            onChange={(e) => setVariableValues(prev => ({ ...prev, [key]: e.target.value }))}
                          />
                        </FormControl>
                      ))}
                    </VStack>
                  </Box>
                )}
              </>
            ) : (
              <Flex align="center" justify="center" flex="1" color="gray.400" fontSize="sm">
                Select a template to preview
              </Flex>
            )}

            <Flex gap={3} mt="auto" justify="flex-end">
              <Button 
                variant="outline" 
                borderRadius="full" 
                onClick={onClose}
                color="gray.600"
                borderColor="gray.300"
                size="sm"
                px={5}
              >
                Cancel
              </Button>
              <Button 
                bg="#4A3B8F" 
                color="white" 
                borderRadius="full" 
                onClick={handleInsert}
                isDisabled={!selectedTemplate}
                _hover={{ bg: '#3D3178' }}
                size="sm"
                px={6}
              >
                Insert
              </Button>
            </Flex>
          </Box>

        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TemplateModal;
