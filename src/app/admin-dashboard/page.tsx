'use client';

import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  extendTheme,
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Badge,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Avatar,
  AvatarBadge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  GridItem,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Progress,
  Tooltip,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import { FaUserShield, FaUsers, FaChartBar, FaCoins, FaGavel, FaEdit, FaPause, FaTimes, FaCheck, FaPlus, FaMinus, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#E6FFFA',
      100: '#B2F5EA',
      500: '#319795',
      900: '#234E52',
    },
  },
});

interface Market {
  id: number;
  creator: string;
  question: string;
  description: string;
  options: string[];
  start_time: string;
  end_time: string;
  status: string;
  collateral_amount: string;
  reward_amount: string;
}

interface Config {
  admin: string;
  coin_denom: string;
  platform_fee: number;
  protocol_treasury_account: string;
  challenging_time: number;
  voting_time: number;
}

const AdminDashboard = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [whitelistedAddresses, setWhitelistedAddresses] = useState<string[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [marketsResponse, whitelistResponse, configResponse] = await Promise.all([
          axios.get<Market[]>('http://localhost:3001/api/markets'),
          axios.get<string[]>('http://localhost:3001/api/whitelisted-addresses'),
          axios.get<Config>('http://localhost:3001/api/config'),
        ]);

        setMarkets(marketsResponse.data);
        setWhitelistedAddresses(whitelistResponse.data);
        setConfig(configResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast({
          title: "Error fetching data",
          description: "There was an error loading the dashboard data. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleAddToWhitelist = async () => {
    try {
      await axios.post('http://localhost:3001/api/add-to-whitelist', { address: newAddress });
      setWhitelistedAddresses([...whitelistedAddresses, newAddress]);
      setNewAddress('');
      toast({
        title: "Address Whitelisted",
        description: `${newAddress} has been added to the whitelist.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add address to whitelist.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveFromWhitelist = async (address: string) => {
    try {
      await axios.post('http://localhost:3001/api/remove-from-whitelist', { address });
      setWhitelistedAddresses(whitelistedAddresses.filter(a => a !== address));
      toast({
        title: "Address Removed",
        description: `${address} has been removed from the whitelist.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove address from whitelist.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleMarketAction = async (marketId: number, action: 'pause' | 'close' | 'cancel') => {
    try {
      await axios.post(`http://localhost:3001/api/market-action`, { marketId, action });
      setMarkets(markets.map(market => 
        market.id === marketId 
          ? { ...market, status: action === 'pause' ? 'Paused' : action === 'close' ? 'Closed' : 'Cancelled' }
          : market
      ));
      toast({
        title: "Market Updated",
        description: `Market ${marketId} has been ${action}ed.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to ${action} market.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openEditModal = (market: Market) => {
    setSelectedMarket(market);
    onOpen();
  };

  if (isLoading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Box>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Box bg="gray.50" minHeight="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <Flex justifyContent="space-between" alignItems="center" bg="white" p={6} borderRadius="lg" boxShadow="md">
              <VStack align="start" spacing={1}>
                <Heading size="2xl" color="brand.500">Admin Dashboard</Heading>
                <Text color="gray.500">Manage markets, whitelist, and platform settings</Text>
              </VStack>
              <Avatar size="xl" icon={<FaUserShield fontSize="2.5rem" />} bg="brand.500" color="white">
                <AvatarBadge boxSize="1.25em" bg="green.500" />
              </Avatar>
            </Flex>

            {/* Platform Overview */}
            <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={6}>
              <GridItem>
                <Stat px={4} py={5} shadow="xl" borderRadius="lg" bg="white">
                  <StatLabel fontWeight="medium" isTruncated>
                    <HStack spacing={2}>
                      <Icon as={FaChartBar} color="brand.500" />
                      <Text>Total Markets</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="medium">
                    {markets.length}
                  </StatNumber>
                </Stat>
              </GridItem>
              <GridItem>
                <Stat px={4} py={5} shadow="xl" borderRadius="lg" bg="white">
                  <StatLabel fontWeight="medium" isTruncated>
                    <HStack spacing={2}>
                      <Icon as={FaUsers} color="brand.500" />
                      <Text>Whitelisted Users</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="medium">
                    {whitelistedAddresses.length}
                  </StatNumber>
                </Stat>
              </GridItem>
              <GridItem>
                <Stat px={4} py={5} shadow="xl" borderRadius="lg" bg="white">
                  <StatLabel fontWeight="medium" isTruncated>
                    <HStack spacing={2}>
                      <Icon as={FaCoins} color="brand.500" />
                      <Text>Platform Fee</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="medium">
                    {config?.platform_fee}%
                  </StatNumber>
                </Stat>
              </GridItem>
              <GridItem>
                <Stat px={4} py={5} shadow="xl" borderRadius="lg" bg="white">
                  <StatLabel fontWeight="medium" isTruncated>
                    <HStack spacing={2}>
                      <Icon as={FaGavel} color="brand.500" />
                      <Text>Voting Time</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="medium">
                    {config?.voting_time / 3600}h
                  </StatNumber>
                </Stat>
              </GridItem>
            </Grid>

            <Tabs variant="soft-rounded" colorScheme="brand">
              <TabList bg="white" p={2} borderRadius="lg" boxShadow="sm">
                <Tab>Market Management</Tab>
                <Tab>Whitelist Management</Tab>
                <Tab>Configuration</Tab>
              </TabList>

              <TabPanels mt={4}>
                <TabPanel>
                  <VStack spacing={4} align="stretch" bg="white" p={6} borderRadius="lg" boxShadow="md">
                    <Heading size="lg" color="brand.500">Market Management</Heading>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>ID</Th>
                          <Th>Question</Th>
                          <Th>Status</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {markets.map((market) => (
                          <Tr key={market.id}>
                            <Td>{market.id}</Td>
                            <Td>{market.question}</Td>
                            <Td>
                              <Badge colorScheme={market.status === 'Active' ? 'green' : 'red'}>
                                {market.status}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Tooltip label="Pause">
                                  <Button size="sm" colorScheme="yellow" onClick={() => handleMarketAction(market.id, 'pause')}>
                                    <Icon as={FaPause} />
                                  </Button>
                                </Tooltip>
                                <Tooltip label="Close">
                                  <Button size="sm" colorScheme="red" onClick={() => handleMarketAction(market.id, 'close')}>
                                    <Icon as={FaTimes} />
                                  </Button>
                                </Tooltip>
                                <Tooltip label="Cancel">
                                  <Button size="sm" colorScheme="purple" onClick={() => handleMarketAction(market.id, 'cancel')}>
                                    <Icon as={FaTimes} />
                                  </Button>
                                </Tooltip>
                                <Tooltip label="Edit">
                                  <Button size="sm" colorScheme="blue" onClick={() => openEditModal(market)}>
                                    <Icon as={FaEdit} />
                                  </Button>
                                </Tooltip>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack spacing={4} align="stretch" bg="white" p={6} borderRadius="lg" boxShadow="md">
                    <Heading size="lg" color="brand.500">Whitelist Management</Heading>
                    <HStack>
                      <InputGroup size="md">
                        <Input
                          pr="4.5rem"
                          type="text"
                          placeholder="Enter address to whitelist"
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                        />
                        <InputRightElement width="4.5rem">
                          <Button h="1.75rem" size="sm" onClick={handleAddToWhitelist}>
                            Add
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                    </HStack>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Address</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {whitelistedAddresses.map((address) => (
                          <Tr key={address}>
                            <Td>{address}</Td>
                            <Td>
                              <Button colorScheme="red" size="sm" onClick={() => handleRemoveFromWhitelist(address)}>
                                Remove
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack spacing={4} align="stretch" bg="white" p={6} borderRadius="lg" boxShadow="md">
                    <Heading size="lg" color="brand.500">Platform Configuration</Heading>
                    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                      <GridItem>
                        <Stat>
                          <StatLabel>Admin Address</StatLabel>
                          <StatNumber fontSize="md">{config?.admin}</StatNumber>
                        </Stat>
                      </GridItem>
                      <GridItem>
                        <Stat>
                          <StatLabel>Coin Denomination</StatLabel>
                          <StatNumber fontSize="md">{config?.coin_denom}</StatNumber>
                        </Stat>
                      </GridItem>
                      <GridItem>
                        <Stat>
                          <StatLabel>Platform Fee</StatLabel>
                          <StatNumber fontSize="md">{config?.platform_fee}%</StatNumber>
                        </Stat>
                      </GridItem>
                      <GridItem>
                        <Stat>
                          <StatLabel>Treasury Account</StatLabel>
                          <StatNumber fontSize="md">{config?.protocol_treasury_account}</StatNumber>
                        </Stat>
                      </GridItem>
                      <GridItem>
                        <Stat>
                          <StatLabel>Challenging Time</StatLabel>
                          <StatNumber fontSize="md">{config?.challenging_time / 3600} hours</StatNumber>
                        </Stat>
                      </GridItem>
                      <GridItem>
                        <Stat>
                          <StatLabel>Voting Time</StatLabel>
                          <StatNumber fontSize="md">{config?.voting_time / 3600} hours</StatNumber>
                        </Stat>
                      </GridItem>
                    </Grid>
                    <Button colorScheme="brand" mt={4} onClick={() => toast({
                      title: "Feature not implemented",
                      description: "Editing configuration is not available in this demo.",
                      status: "info",
                      duration: 3000,
                      isClosable: true,
                    })}>
                      Edit Configuration
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            {/* Platform Health Dashboard */}
            <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
              <Heading size="lg" mb={4} color="brand.500">Platform Health</Heading>
              <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                <GridItem>
                  <CircularProgress value={99.99} color="green.400" size="120px">
                    <CircularProgressLabel>99.99%</CircularProgressLabel>
                  </CircularProgress>
                  <Text mt={2} textAlign="center">System Uptime</Text>
                </GridItem>
                <GridItem>
                  <Stat>
                    <StatLabel>Average Response Time</StatLabel>
                    <StatNumber>120ms</StatNumber>
                    <StatHelpText>
                      <StatArrow type="decrease" />
                      15% improvement
                    </StatHelpText>
                  </Stat>
                </GridItem>
                <GridItem>
                  <Stat>
                    <StatLabel>Active Users</StatLabel>
                    <StatNumber>{markets.length * 10}</StatNumber>
                    <StatHelpText>Estimated</StatHelpText>
                  </Stat>
                </GridItem>
              </Grid>
              <Box mt={6}>
                <Heading size="md" mb={2}>System Load</Heading>
                <Progress value={65} colorScheme="green" size="lg" />
                <Text mt={2} fontSize="sm" color="gray.600">Current server load: 65%</Text>
              </Box>
            </Box>

            {/* Emergency Controls */}
            <Box bg="red.50" borderRadius="lg" boxShadow="md" p={6}>
              <Heading size="lg" mb={4} color="red.600">Emergency Controls</Heading>
              <HStack spacing={4}>
                <Button
                  colorScheme="red"
                  leftIcon={<Icon as={FaExclamationTriangle} />}
                  onClick={() => toast({
                    title: "Emergency Shutdown",
                    description: "This action is not available in the demo.",
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                  })}
                >
                  Emergency Shutdown
                </Button>
                <Button
                  colorScheme="yellow"
                  leftIcon={<Icon as={FaPause} />}
                  onClick={() => toast({
                    title: "Pause All Markets",
                    description: "This action is not available in the demo.",
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                  })}
                >
                  Pause All Markets
                </Button>
                <Button
                  colorScheme="blue"
                  leftIcon={<Icon as={FaUsers} />}
                  onClick={() => toast({
                    title: "User Lockout",
                    description: "This action is not available in the demo.",
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                  })}
                >
                  Temporary User Lockout
                </Button>
              </HStack>
              <Text mt={4} fontSize="sm" color="red.600">
                Warning: These controls should only be used in emergency situations. All actions are logged and require additional confirmation.
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Edit Market Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Market</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedMarket && (
              <VStack spacing={4} align="stretch">
                <Text><strong>ID:</strong> {selectedMarket.id}</Text>
                <Text><strong>Question:</strong> {selectedMarket.question}</Text>
                <Text><strong>Description:</strong> {selectedMarket.description}</Text>
                <Text><strong>Status:</strong> {selectedMarket.status}</Text>
                <Text><strong>Start Time:</strong> {new Date(parseInt(selectedMarket.start_time) * 1000).toLocaleString()}</Text>
                <Text><strong>End Time:</strong> {new Date(parseInt(selectedMarket.end_time) * 1000).toLocaleString()}</Text>
                <Text><strong>Collateral Amount:</strong> {parseInt(selectedMarket.collateral_amount) / 1000000} {config?.coin_denom}</Text>
                <Text><strong>Reward Amount:</strong> {parseInt(selectedMarket.reward_amount) / 1000000} {config?.coin_denom}</Text>
                <Text><strong>Options:</strong></Text>
                <VStack align="start" pl={4}>
                  {selectedMarket.options.map((option, index) => (
                    <Text key={index}>{index + 1}. {option}</Text>
                  ))}
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost" onClick={() => toast({
              title: "Feature not implemented",
              description: "Editing markets is not available in this demo.",
              status: "info",
              duration: 3000,
              isClosable: true,
            })}>Save Changes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
};

export default AdminDashboard;