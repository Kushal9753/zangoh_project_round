import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Checkbox,
  VStack,
  Text,
  Box,
} from '@chakra-ui/react';
import { createTemplate } from '../api';

const CreateTemplateModal = ({ isOpen, onClose, onTemplateCreated }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [channel, setChannel] = useState('Chat');
  const [content, setContent] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!name || !category || !content) {
      setErrorMsg('Please fill in all required fields (Name, Category, Content).');
      return;
    }

    setIsSubmitting(true);
    try {
      const templateData = { name, category, channel, content, isShared };
      const newTemplate = await createTemplate(templateData);
      
      // Reset form
      setName('');
      setCategory('');
      setChannel('Chat');
      setContent('');
      setIsShared(false);
      
      if (onTemplateCreated) {
        onTemplateCreated(newTemplate);
      }
      onClose();
    } catch (error) {
      console.error('Failed to create template:', error);
      setErrorMsg('Failed to create template. Please check the backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Create Response Template</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4}>
            {errorMsg && (
              <Box w="100%" p={3} bg="red.50" color="red.500" borderRadius="md" fontSize="sm">
                {errorMsg}
              </Box>
            )}
            <FormControl isRequired>
              <FormLabel>Template Name</FormLabel>
              <Input 
                placeholder="e.g. Welcome Message" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select 
                placeholder="Select category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="Onboarding">Onboarding</option>
                <option value="Shipping">Shipping</option>
                <option value="Return">Return</option>
                <option value="Engagement">Engagement</option>
                <option value="Transaction">Transaction</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Channel</FormLabel>
              <Select 
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <option value="Chat">Chat</option>
                <option value="Message">Message</option>
                <option value="Website">Website</option>
                <option value="Mobile">Mobile</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Content</FormLabel>
              <Text fontSize="xs" color="gray.500" mb={2}>
                Use {'{{variable_name}}'} to insert dynamic variables (e.g. Hi {'{{user_name}}'}!).
              </Text>
              <Textarea 
                placeholder="Enter template message..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                required
              />
            </FormControl>

            <FormControl>
              <Checkbox 
                isChecked={isShared} 
                onChange={(e) => setIsShared(e.target.checked)}
              >
                Share template with team
              </Checkbox>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            bg="#4A3B8F" 
            color="white" 
            type="submit" 
            isLoading={isSubmitting}
            _hover={{ bg: '#3D3178' }}
          >
            Create Template
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateTemplateModal;
