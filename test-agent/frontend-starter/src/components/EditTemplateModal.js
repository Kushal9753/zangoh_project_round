import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Box,
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Icon,
} from '@chakra-ui/react';
import { FiCheck, FiMoreVertical } from 'react-icons/fi';
import { updateTemplate } from '../api';

const EditTemplateModal = ({ isOpen, onClose, template, onTemplateUpdated }) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load template data
  useEffect(() => {
    if (template && isOpen) {
      setName(template.name || '');
      setTitle(template.title || '');
      setCategory(template.category || '');
      setContent(template.content || '');
      setIsShared(template.isShared || false);
    }
  }, [template, isOpen]);

  const handleSave = async () => {
    if (!name || !content || !category) return;
    setIsSubmitting(true);
    try {
      const templateData = { 
        name, 
        title, 
        category, 
        channel: template.channel || 'Chat', 
        content, 
        isShared 
      };
      const updatedTemplate = await updateTemplate(template.id || template._id, templateData);
      if (onTemplateUpdated) {
        onTemplateUpdated(updatedTemplate);
      }
      onClose();
    } catch (error) {
      console.error('Failed to update template', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!template) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" isCentered>
      <ModalOverlay bg="blackAlpha.300" />
      <ModalContent bg="#F5F5F7" borderRadius="3xl" overflow="hidden" boxShadow="2xl">
        <ModalBody p={8} display="flex" gap={8}>
          
          {/* LEFT PANEL - Form */}
          <Box flex="1" display="flex" flexDirection="column">
            <Text fontSize="2xl" fontWeight="600" color="gray.800" mb={4}>
              Edit Template
            </Text>
            
            <Box bg="white" borderRadius="2xl" p={6} flex="1" display="flex" flexDirection="column" boxShadow="sm">
              <Flex direction="column" gap={4} flex="1">
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Name</FormLabel>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Template name"
                    borderRadius="lg"
                    fontSize="sm"
                    _focus={{ borderColor: '#4A3B8F', boxShadow: 'none' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Title</FormLabel>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Say Hi to welcome new visitors!"
                    borderRadius="lg"
                    fontSize="sm"
                    _focus={{ borderColor: '#4A3B8F', boxShadow: 'none' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Category</FormLabel>
                  <Select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    borderRadius="lg"
                    fontSize="sm"
                    _focus={{ borderColor: '#4A3B8F', boxShadow: 'none' }}
                  >
                    <option value="Onboarding">Onboarding</option>
                    <option value="Shipping">Shipping</option>
                    <option value="Return">Return</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Transaction">Transaction</option>
                    <option value="Chat">Chat</option>
                  </Select>
                </FormControl>

                <FormControl flex="1" display="flex" flexDirection="column">
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Content</FormLabel>
                  <Box border="1px solid" borderColor="gray.200" borderRadius="lg" overflow="hidden" flex="1" display="flex" flexDirection="column" _focusWithin={{ borderColor: '#4A3B8F' }}>
                    <Textarea 
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Template content"
                      border="none"
                      resize="none"
                      fontSize="sm"
                      h="120px"
                      _focus={{ boxShadow: 'none' }}
                    />
                    {/* Mock toolbar for rich text styling visually */}
                    <Flex bg="gray.50" px={3} py={2} borderTop="1px solid" borderColor="gray.200" align="center" gap={3}>
                      <Text fontSize="sm" fontWeight="700" color="gray.600" cursor="pointer">B</Text>
                      <Text fontSize="sm" fontStyle="italic" color="gray.600" cursor="pointer">I</Text>
                      <Text fontSize="sm" textDecoration="underline" color="gray.600" cursor="pointer">U</Text>
                      <Text fontSize="xs" color="gray.500" ml={2}>Sans Serif</Text>
                    </Flex>
                  </Box>
                </FormControl>
              </Flex>

              {/* Action Buttons */}
              <Flex justify="space-between" align="center" mt={6}>
                <Button 
                  bg={isShared ? '#4A3B8F' : '#E5E7EB'} 
                  color={isShared ? 'white' : 'gray.600'} 
                  borderRadius="full" 
                  px={5} 
                  size="sm"
                  leftIcon={isShared ? <Icon as={FiCheck} /> : undefined}
                  onClick={() => setIsShared(!isShared)}
                  _hover={{ bg: isShared ? '#3D3178' : '#D1D5DB' }}
                  fontWeight="500"
                >
                  Share with Team
                </Button>

                <Flex gap={3}>
                  <Button 
                    bg="gray.100" 
                    color="gray.700" 
                    borderRadius="full" 
                    px={6} 
                    onClick={onClose}
                    _hover={{ bg: 'gray.200' }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    bg="#4A3B8F" 
                    color="white" 
                    borderRadius="full" 
                    px={6} 
                    isLoading={isSubmitting}
                    onClick={handleSave}
                    _hover={{ bg: '#3D3178' }}
                  >
                    Save
                  </Button>
                </Flex>
              </Flex>
            </Box>
          </Box>

          {/* RIGHT PANEL - Preview */}
          <Box w="340px" display="flex" flexDirection="column">
            <Text fontSize="2xl" fontWeight="600" color="gray.800" mb={4}>
              Preview
            </Text>
            
            <Box bg="white" borderRadius="2xl" p={6} flex="1" boxShadow="sm">
              <Box border="1px solid" borderColor="gray.100" borderRadius="xl" p={4} boxShadow="sm" minH="100px">
                <Flex align="flex-start" gap={3}>
                  <Flex 
                    align="center" gap={1.5} 
                    bg="#EFF6FF" 
                    color="#3B82F6" 
                    px={3} py={1} 
                    borderRadius="full" 
                    fontSize="10px" fontWeight="700" flexShrink={0}
                  >
                    ✦ Chat
                  </Flex>
                  <Text fontSize="sm" color="gray.700" flex="1" lineHeight="base" whiteSpace="pre-wrap">
                    {content}
                  </Text>
                  <Icon as={FiMoreVertical} color="gray.300" boxSize={4} flexShrink={0} />
                </Flex>
              </Box>
            </Box>
          </Box>

        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditTemplateModal;
