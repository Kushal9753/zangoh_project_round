import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  VStack,
  Checkbox,
  HStack,
  Input,
  Tag,
  TagLabel,
  TagCloseButton,
  useColorModeValue,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { getAgents, seedAgents, updateAgentConfig } from '../api';

const capabilitiesList = ['Decision Making', 'Autonomy', 'Learning', 'Perception'];

const AgentConfig = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const [topP, setTopP] = useState(0.7);
  const [speed, setSpeed] = useState(0.5);
  const [personality, setPersonality] = useState(0.5);
  const [stability, setStability] = useState(0.5);
  const [maxTokens, setMaxTokens] = useState(150);
  const [capabilities, setCapabilities] = useState([]);
  const [kbAccess, setKbAccess] = useState({
    permissions: false,
    internal: true,
    public: true,
  });
  const [escalationMinutes, setEscalationMinutes] = useState(10);

  useEffect(() => {
    let isMounted = true;
    const fetchAndSeedAgents = async () => {
      try {
        await seedAgents();
        const data = await getAgents();
        if (isMounted) {
          setAgents(data || []);
          if (data && data.length > 0) {
            loadAgentConfig(data[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load agents:', error);
        if (isMounted) {
          toast({
            title: 'Error loading agents',
            status: 'error',
            duration: 3000,
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchAndSeedAgents();
    return () => { isMounted = false; };
  }, [toast]);

  const loadAgentConfig = (agent) => {
    setSelectedAgentId(agent.id);
    setTopP(agent.parameters?.top_p ?? 0.7);
    setSpeed(agent.parameters?.speed ?? 0.5);
    setPersonality(agent.parameters?.temperature ?? 0.5);
    setStability(agent.parameters?.stability ?? 0.5);
    setMaxTokens(agent.parameters?.max_tokens ?? 150);
    
    const activeCaps = (agent.capabilities || []).filter(c => c.enabled).map(c => c.name);
    setCapabilities(activeCaps);

    const kbs = agent.knowledgeBases || [];
    setKbAccess({
      permissions: kbs.find(k => k.id === 'kb-permissions')?.enabled || false,
      internal: kbs.find(k => k.id === 'kb-internal')?.enabled || false,
      public: kbs.find(k => k.id === 'kb-public')?.enabled || false,
    });

    setEscalationMinutes(agent.escalationThresholds?.responseTime || 10);
  };

  const handleAgentChange = (e) => {
    const id = e.target.value;
    const agent = agents.find(a => a.id === id);
    if (agent) {
      loadAgentConfig(agent);
    }
  };

  const toggleCapability = (capability) => {
    setCapabilities((prev) =>
      prev.includes(capability)
        ? prev.filter((c) => c !== capability)
        : [...prev, capability]
    );
  };

  const handleReset = () => {
    const agent = agents.find(a => a.id === selectedAgentId);
    if (agent) {
      loadAgentConfig(agent);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const configPayload = {
        parameters: {
          top_p: topP,
          speed: speed,
          temperature: personality,
          stability: stability,
          max_tokens: maxTokens,
        },
        capabilities: [
          { id: 'cap-decision', name: 'Decision Making', enabled: capabilities.includes('Decision Making') },
          { id: 'cap-perception', name: 'Perception', enabled: capabilities.includes('Perception') },
          { id: 'cap-autonomy', name: 'Autonomy', enabled: capabilities.includes('Autonomy') },
          { id: 'cap-learning', name: 'Learning', enabled: capabilities.includes('Learning') }
        ],
        knowledgeBases: [
          { id: 'kb-permissions', name: 'Permissions', enabled: kbAccess.permissions },
          { id: 'kb-internal', name: 'Internal Articles', enabled: kbAccess.internal },
          { id: 'kb-public', name: 'Public Articles', enabled: kbAccess.public },
        ],
        escalationThresholds: {
          responseTime: escalationMinutes,
        }
      };

      const updatedAgent = await updateAgentConfig(selectedAgentId, configPayload);
      
      const savedAgentObj = updatedAgent.agent || updatedAgent;
      setAgents(prev => prev.map(a => (a.id === selectedAgentId ? savedAgentObj : a)));
      
      toast({
        title: 'Configuration Saved',
        description: 'Agent config has been successfully updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to save config:', error);
      toast({
        title: 'Error Saving',
        description: 'Failed to update configuration.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (loading) {
    return (
      <Flex justify="center" align="center" h="80vh">
        <Spinner size="lg" color="#4A3B8F" />
      </Flex>
    );
  }

  return (
    <Box p={{ base: 4, md: 10 }} maxW="1000px" mx="auto">
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={8}>
        <Heading fontSize="2xl">Configure your AI Agent</Heading>
        <HStack>
          <Button variant="outline" onClick={handleReset} isDisabled={saving}>Reset</Button>
          <Button colorScheme="purple" onClick={handleSave} isLoading={saving} loadingText="Saving">Save Changes</Button>
        </HStack>
      </Flex>

      <Box
        bg={cardBg}
        p={{ base: 4, md: 8 }}
        borderRadius="xl"
        boxShadow="lg"
        border={`1px solid ${borderColor}`}
      >
        <Box mb={8}>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>Agent</Text>
          <Select size="lg" value={selectedAgentId} onChange={handleAgentChange} maxW="300px">
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </Select>
        </Box>

        <Flex flexWrap="wrap" gap={8} mb={8}>
          {[
            { label: 'Top-p', value: topP, setter: setTopP },
            { label: 'Speed', value: speed, setter: setSpeed },
            { label: 'Personality', value: personality, setter: setPersonality },
            { label: 'Stability', value: stability, setter: setStability },
          ].map(({ label, value, setter }) => (
            <Box key={label} flex="1" minW="220px">
              <Text fontSize="md" mb={2}>{label}</Text>
              <Slider value={value} onChange={setter} min={0} max={1} step={0.01}>
                <SliderTrack>
                  <SliderFilledTrack bg="purple.500" />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <Text fontSize="sm" color="gray.600" mt={1}>{value.toFixed(2)}</Text>
            </Box>
          ))}

          <Box>
            <Text fontSize="md" mb={2}>Max Tokens</Text>
            <Input
              type="number"
              value={maxTokens}
              size="lg"
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              w="100px"
            />
          </Box>
        </Flex>

        <Box mb={8}>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>Capabilities</Text>
          <HStack spacing={4} wrap="wrap">
            {capabilitiesList.map((cap) => {
              const isActive = capabilities.includes(cap);
              return (
                <Tag
                  size="lg"
                  variant={isActive ? 'solid' : 'outline'}
                  colorScheme="purple"
                  cursor="pointer"
                  onClick={() => toggleCapability(cap)}
                  key={cap}
                >
                  <TagLabel>{cap}</TagLabel>
                  {isActive && <TagCloseButton />}
                </Tag>
              );
            })}
          </HStack>
        </Box>

        <Box mb={8}>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>Knowledge Base Access</Text>
          <VStack align="start" spacing={3}>
            <Checkbox
              isChecked={kbAccess.permissions}
              onChange={() => setKbAccess({ ...kbAccess, permissions: !kbAccess.permissions })}
            >
               Permissions
            </Checkbox>
            <Checkbox
              isChecked={kbAccess.internal}
              onChange={() => setKbAccess({ ...kbAccess, internal: !kbAccess.internal })}
            >
              Internal Articles
            </Checkbox>
            <Checkbox
              isChecked={kbAccess.public}
              onChange={() => setKbAccess({ ...kbAccess, public: !kbAccess.public })}
            >
              Public Articles
            </Checkbox>
          </VStack>
        </Box>

        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>Escalation Threshold</Text>
          <Flex align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={2}>
            <Text>Escalate if Agent hasn’t responded in</Text>
            <Input
              type="number"
              size="lg"
              value={escalationMinutes}
              onChange={(e) => setEscalationMinutes(Number(e.target.value))}
              width="80px"
            />
            <Text>minutes</Text>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default AgentConfig;
