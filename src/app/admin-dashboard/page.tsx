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
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  GridItem,
  Icon,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { FaCheckCircle, FaChartLine, FaUsers, FaCoins, FaGavel, FaSearch, FaExclamationTriangle, FaPause, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { motion } from 'framer-motion';
import { getRealConfig, getWhitelistedAddresses } from '../../utils/api';
import { broadcastTransaction, connectKeplr } from '../../utils/web3';
import { DeliverTxResponse } from "@cosmjs/stargate";
import { useWeb3 } from '../../contexts/Web3Context'; 
import { encodeQuery } from '../../utils/queryUtils';

const theme = extendTheme({
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
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

const MotionBox = motion(Box);

// Updated Market interface to match new structure
interface Market {
  id: number;
  creator: string;
  question: string;
  description: string;
  options: string[];
  category: string;
  start_time: number;
  end_time: number;
  status: string;
  resolution_bond: string;
  resolution_reward: string;
  result: null | string;
}

// Updated Config interface
interface Config {
  admin: string;
  token_denom: string;
  platform_fee: string;
  treasury: string;
  challenging_period: number;
  voting_period: number;
  min_bet: string;
  whitelist_enabled: boolean;
}

const AdminDashboard = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [whitelistedAddresses, setWhitelistedAddresses] = useState<string[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const toast = useToast();

  // New state for config editing
  const [editingConfig, setEditingConfig] = useState({ field: '', value: '' });
  const { isOpen: isEditConfigOpen, onOpen: onEditConfigOpen, onClose: onEditConfigClose } = useDisclosure();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = "blue.400";
  const gradientColor = "linear(to-r, blue.400, purple.500)";
  const { isWalletConnected } = useWeb3();

  // Updated fetchMarkets function
  const fetchMarkets = async () => {
    console.log("Fetching markets...");
    try {
      const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
      const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  
      const query = {
        markets: {
          status: "Active",
          start_after: 0,
          limit: 10
        }
      };
      const encodedQuery = encodeQuery(query);
  
      const response = await axios.get(
        `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
      );
      console.log("Markets fetched successfully:", response.data);
      setMarkets(response.data.data);
    } catch (error) {
      console.error("Error fetching markets:", error.response ? error.response.data : error.message);
      toast({
        title: "Error",
        description: "Failed to fetch markets.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Updated fetchWhitelistedAddresses function
  const fetchWhitelistedAddresses = async () => {
    try {
      const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
      const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  
      const query = {
        whitelisted_addresses: {
          start_after: null,
          limit: 10
        }
      };
      const encodedQuery = encodeQuery(query);
  
      const response = await axios.get(
        `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
      );
      
      // Check if the response has the expected structure
      if (response.data && Array.isArray(response.data.data)) {
        setWhitelistedAddresses(response.data.data);
      } else {
        console.error('Unexpected response structure:', response.data);
        setWhitelistedAddresses([]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching whitelisted addresses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch whitelisted addresses.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
      setWhitelistedAddresses([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const configResponse = await getRealConfig();
        console.log("Config response:", configResponse);
        setConfig(configResponse);
        await fetchMarkets();
        await fetchWhitelistedAddresses();
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
    };fetchData();
  }, []);

  const handleAddToWhitelist = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to perform this action.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!chainId || !contractAddress) {
        throw new Error("Chain ID or Contract address not defined in environment variables");
      }
  
      console.log("Preparing to add address to whitelist:", newAddress);
  
      const msg = {
        add_to_whitelist: {
          address: newAddress
        }
      };
  
      // No funds are sent with this transaction
      const funds: { denom: string; amount: string }[] = [];
  
      console.log("Sending transaction to add to whitelist:", JSON.stringify(msg, null, 2));
  
      const result = await broadcastTransaction(chainId, contractAddress, msg, funds);
  
      // Custom JSON stringifier to handle BigInt
      const bigIntStringifier = (key: string, value: any) => {
        if (typeof value === 'bigint') {
          return value.toString();
        }
        return value;
      };
  
      console.log("Add to whitelist result:", JSON.stringify(result, bigIntStringifier, 2));
  
      // Update the UI state immediately
      setWhitelistedAddresses(prevAddresses => [...prevAddresses, newAddress]);
      setNewAddress(''); // Clear the input field
  
      toast({
        title: "Address Added",
        description: `${newAddress} has been added to the whitelist. Transaction hash: ${result.transactionHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
  
    } catch (err) {
      console.error("Error adding address to whitelist:", err);
      toast({
        title: "Error",
        description: "Failed to add address to whitelist. " + (err instanceof Error ? err.message : "Unknown error occurred"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRemoveFromWhitelist = async (address: string) => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to perform this action.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!chainId || !contractAddress) {
        throw new Error("Chain ID or Contract address not defined in environment variables");
      }
  
      console.log("Preparing to remove address from whitelist:", address);
  
      const msg = {
        remove_from_whitelist: {
          address: address
        }
      };
  
      // No funds are sent with this transaction
      const funds: { denom: string; amount: string }[] = [];
  
      console.log("Sending transaction to remove from whitelist:", JSON.stringify(msg, null, 2));
  
      const result = await broadcastTransaction(chainId, contractAddress, msg, funds);
  
      // Custom JSON stringifier to handle BigInt
      const bigIntStringifier = (key: string, value: any) => {
        if (typeof value === 'bigint') {
          return value.toString();
        }
        return value;
      };
  
      console.log("Remove from whitelist result:", JSON.stringify(result, bigIntStringifier, 2));
  
      // Update the UI state immediately
      setWhitelistedAddresses(prevAddresses => prevAddresses.filter(a => a !== address));
  
      toast({
        title: "Address Removed",
        description: `${address} has been removed from the whitelist. Transaction hash: ${result.transactionHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
  
    } catch (err) {
      console.error("Error removing address from whitelist:", err);
      toast({
        title: "Error",
        description: "Failed to remove address from whitelist. " + (err instanceof Error ? err.message : "Unknown error occurred"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // New function to handle cancelling a market
  const handleCancelMarket = async (marketId: number) => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to perform this action.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    try {
      const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  
      if (!chainId || !contractAddress) {
        throw new Error("Chain ID or Contract address not defined in environment variables");
      }
  
      console.log("Preparing to cancel market:", marketId);
  
      const msg = {
        cancel_market: {
          market_id: marketId
        }
      };
  
      // No funds are sent with this transaction
      const funds: { denom: string; amount: string }[] = [];
  
      console.log("Sending transaction to cancel market:", JSON.stringify(msg, null, 2));
  
      const result = await broadcastTransaction(chainId, contractAddress, msg, funds);
  
      // Custom JSON stringifier to handle BigInt
      const bigIntStringifier = (key: string, value: any) => {
        if (typeof value === 'bigint') {
          return value.toString();
        }
        return value;
      };
  
      console.log("Cancel market result:", JSON.stringify(result, bigIntStringifier, 2));
  
      toast({
        title: "Market Cancelled",
        description: `Market ${marketId} has been cancelled. Transaction hash: ${result.transactionHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
  
      fetchMarkets(); // Refresh the markets list
    } catch (err) {
      console.error("Error cancelling market:", err);
      toast({
        title: "Error",
        description: "Failed to cancel market. " + (err instanceof Error ? err.message : "Unknown error occurred"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // New function to handle closing a market
  const handleCloseMarket = async (marketId: number) => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to perform this action.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    try {
      const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  
      if (!chainId || !contractAddress) {
        throw new Error("Chain ID or Contract address not defined in environment variables");
      }
  
      console.log("Preparing to close market:", marketId);
  
      const msg = {
        close_market: {
          market_id: marketId
        }
      };
  
      // No funds are sent with this transaction
      const funds: { denom: string; amount: string }[] = [];
  
      console.log("Sending transaction to close market:", JSON.stringify(msg, null, 2));
  
      const result = await broadcastTransaction(chainId, contractAddress, msg, funds);
  
      // Custom JSON stringifier to handle BigInt
      const bigIntStringifier = (key: string, value: any) => {
        if (typeof value === 'bigint') {
          return value.toString();
        }
        return value;
      };
  
      console.log("Close market result:", JSON.stringify(result, bigIntStringifier, 2));
  
      toast({
        title: "Market Closed",
        description: `Market ${marketId} has been closed. Transaction hash: ${result.transactionHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
  
      fetchMarkets(); // Refresh the markets list
    } catch (err) {
      console.error("Error closing market:", err);
      toast({
        title: "Error",
        description: "Failed to close market. " + (err instanceof Error ? err.message : "Unknown error occurred"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // New function to handle proposing a result for a market
  const handleProposeResult = async (marketId: number, winningOutcome: number) => {
  if (!isWalletConnected) {
    toast({
      title: "Wallet not connected",
      description: "Please connect your wallet to perform this action.",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  try {
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!chainId || !contractAddress) {
      throw new Error("Chain ID or Contract address not defined in environment variables");
    }

    console.log("Preparing to propose result for market:", marketId);

    const msg = {
      propose_result: {
        market_id: marketId,
        winning_outcome: winningOutcome
      }
    };

    // No funds are sent with this transaction
    const funds: { denom: string; amount: string }[] = [];

    console.log("Sending transaction to propose result:", JSON.stringify(msg, null, 2));

    const result = await broadcastTransaction(chainId, contractAddress, msg, funds);

    // Custom JSON stringifier to handle BigInt
    const bigIntStringifier = (key: string, value: any) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    };

    console.log("Propose result result:", JSON.stringify(result, bigIntStringifier, 2));

    toast({
      title: "Result Proposed",
      description: `Result proposed for market ${marketId}. Transaction hash: ${result.transactionHash}`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    fetchMarkets(); // Refresh the markets list
  } catch (err) {
    console.error("Error proposing result:", err);
    toast({
      title: "Error",
      description: "Failed to propose result. " + (err instanceof Error ? err.message : "Unknown error occurred"),
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }
};

  // New function to handle updating config
  const handleUpdateConfig = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to perform this action.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    try {
      const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  
      if (!chainId || !contractAddress) {
        throw new Error("Chain ID or Contract address not defined in environment variables");
      }
  
      console.log("Preparing to update config:", editingConfig);
  
      const msg = {
        update_config: {
          field: editingConfig.field,
          value: editingConfig.value
        }
      };
  
      // No funds are sent with this transaction
      const funds: { denom: string; amount: string }[] = [];
  
      console.log("Sending transaction to update config:", JSON.stringify(msg, null, 2));
  
      const result = await broadcastTransaction(chainId, contractAddress, msg, funds);
  
      // Custom JSON stringifier to handle BigInt
      const bigIntStringifier = (key: string, value: any) => {
        if (typeof value === 'bigint') {
          return value.toString();
        }
        return value;
      };
  
      console.log("Update config result:", JSON.stringify(result, bigIntStringifier, 2));
  
      toast({
        title: "Config Updated",
        description: `${editingConfig.field} has been updated to ${editingConfig.value}. Transaction hash: ${result.transactionHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
  
      onEditConfigClose();
      const updatedConfig = await getRealConfig();
      setConfig(updatedConfig);
    } catch (err) {
      console.error("Error updating config:", err);
      toast({
        title: "Error",
        description: "Failed to update config. " + (err instanceof Error ? err.message : "Unknown error occurred"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center" bg={bgColor}>
        <Spinner size="xl" color={accentColor} thickness="4px" />
      </Box>
    );
  }

  const filteredMarkets = markets.filter(market => 
    filter === 'All' || market.status === filter
  );

  return (
    <ChakraProvider theme={theme}>
      <Box bg="transparent" minHeight="100vh" py={12}>
        <Container maxW="container.xl">
          <VStack spacing={10} align="stretch">
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Flex 
                justifyContent="space-between" 
                alignItems="center" 
                bg={cardBgColor} 
                p={8} 
                borderRadius="2xl" 
                boxShadow="xl"
                bgGradient={gradientColor}
              >
                <VStack align="start" spacing={1}>
                  <Heading size="2xl" color="white">Admin Dashboard</Heading>
                  <Text color="whiteAlpha.800">Manage markets, whitelist, and platform settings</Text>
                </VStack>
                <Avatar size="xl" icon={<Icon as={FaUsers} fontSize="3rem" />} bg="white" color={accentColor} />
              </Flex>
            </MotionBox>

            <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={8}>
              {[
                { label: 'Total Markets', icon: FaChartLine, value: markets.length, color: 'blue.400' },
                { label: 'Whitelisted Users', icon: FaUsers, value: whitelistedAddresses?.length || 0, color: 'green.400' },
                { label: 'Platform Fee', icon: FaCoins, value: config ? `${parseInt(config.platform_fee) / 100}%` : 'N/A', color: 'yellow.400' },
                { label: 'Voting Time', icon: FaGavel, value: config ? `${config.voting_period / 3600}h` : 'N/A', color: 'purple.400' },
              ].map((stat, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "2xl" }}
                >
                  <Stat 
                    px={6} 
                    py={8} 
                    bg={cardBgColor}
                    borderRadius="2xl" 
                    boxShadow="xl"
                    border="1px solid"
                    borderColor={borderColor}
                    position="relative"
                    overflow="hidden"
                  >
                    <Box
                      position="absolute"
                      top="-20px"
                      left="-20px"
                      width="100px"
                      height="100px"
                      bg={`${stat.color}20`}
                      borderRadius="full"
                      filter="blur(20px)"
                    />
                    <StatLabel fontWeight="medium" color={textColor} fontSize="lg">
                      <HStack spacing={2}>
                        <Icon as={stat.icon} color={stat.color} boxSize={6} />
                        <Text>{stat.label}</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="bold" color={stat.color} mt={2}>
                      {stat.value}
                    </StatNumber>
                  </Stat>
                </MotionBox>
              ))}
            </Grid>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
                <TabList bg={cardBgColor} p={4} borderRadius="2xl" boxShadow="md">
                  <Tab fontSize="lg" fontWeight="medium" _selected={{ color: 'white', bg: accentColor }}>Market Management</Tab>
                  <Tab fontSize="lg" fontWeight="medium" _selected={{ color: 'white', bg: accentColor }}>Whitelist Management</Tab>
                  <Tab fontSize="lg" fontWeight="medium" _selected={{ color: 'white', bg: accentColor }}>Configuration</Tab>
                </TabList>

                <TabPanels mt={6}>
                  <TabPanel>
                    <Box bg={cardBgColor} p={6} borderRadius="2xl" boxShadow="xl">
                      <Heading size="lg" bgGradient={gradientColor} bgClip="text" mb={6}>Market Management</Heading>
                      <HStack mb={4}>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FaSearch} color="gray.300" />
                          </InputLeftElement>
                          <Input placeholder="Search markets" onChange={(e) => setFilter(e.target.value)} />
                        </InputGroup>
                        <Button onClick={() => setFilter('All')}>All</Button>
                        <Button onClick={() => setFilter('Active')}>Active</Button>
                        <Button onClick={() => setFilter('Closed')}>Closed</Button>
                      </HStack>
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
                            {filteredMarkets.map((market) => (
                            <Tr key={market.id}>
                                <Td>{market.id}</Td>
                                <Td>{market.question}</Td>
                                <Td>
                                <Badge colorScheme={market.status === 'Active' ? 'green' : 'yellow'}>
                                    {market.status}
                                </Badge>
                                </Td>
                                <Td>
                                <HStack spacing={2}>
                                    <Button
                                    size="sm"
                                    colorScheme="red"
                                    onClick={() => handleCancelMarket(market.id)}
                                    >
                                    Cancel
                                    </Button>
                                    <Button
                                    size="sm"
                                    colorScheme="yellow"
                                    onClick={() => handleCloseMarket(market.id)}
                                    >
                                    Close
                                    </Button>
                                    <Button
                                    size="sm"
                                    colorScheme="green"
                                    onClick={() => handleProposeResult(market.id, 0)} // You might want to add a modal for selecting the winning outcome
                                    >
                                    Propose Result
                                    </Button>
                                </HStack>
                                </Td>
                            </Tr>
                            ))}
                        </Tbody>
                        </Table>
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    <Box bg={cardBgColor} p={6} borderRadius="2xl" boxShadow="xl">
                    <Heading size="lg" bgGradient={gradientColor} bgClip="text" mb={6}>Whitelist Management</Heading>
                    <HStack mb={4}>
                        <Input 
                        placeholder="Enter address to whitelist" 
                        value={newAddress} 
                        onChange={(e) => setNewAddress(e.target.value)} 
                        />
                        <Button onClick={handleAddToWhitelist} colorScheme="blue">Add</Button>
                    </HStack>
                    {whitelistedAddresses === undefined ? (
                        <Spinner size="xl" color="blue.500" />
                    ) : whitelistedAddresses.length === 0 ? (
                        <Text>No whitelisted addresses found.</Text>
                    ) : (
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
                                <Button 
                                    colorScheme="red" 
                                    size="sm" 
                                    onClick={() => handleRemoveFromWhitelist(address)}
                                >
                                    Remove
                                </Button>
                                </Td>
                            </Tr>
                            ))}
                        </Tbody>
                        </Table>
                    )}
                    </Box>
                </TabPanel>
                  <TabPanel>
                    <Box bg={cardBgColor} p={6} borderRadius="2xl" boxShadow="xl">
                      <Heading size="lg" bgGradient={gradientColor} bgClip="text" mb={6}>Platform Configuration</Heading>
                      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                        <GridItem>
                          <Stat>
                            <StatLabel fontWeight="medium" color={textColor}>Admin Address</StatLabel>
                            <StatNumber fontSize="md" color={accentColor}>{config?.admin}</StatNumber>
                          </Stat>
                        </GridItem>
                        <GridItem>
                          <Stat>
                            <StatLabel fontWeight="medium" color={textColor}>Token Denomination</StatLabel>
                            <StatNumber fontSize="md" color={accentColor}>{config?.token_denom}</StatNumber>
                          </Stat>
                        </GridItem>
                        <GridItem>
                          <Stat>
                            <StatLabel fontWeight="medium" color={textColor}>Platform Fee</StatLabel>
                            <StatNumber fontSize="md" color={accentColor}>{parseInt(config?.platform_fee || '0') / 100}%</StatNumber>
                          </Stat>
                        </GridItem>
                        <GridItem>
                          <Stat>
                            <StatLabel fontWeight="medium" color={textColor}>Treasury Account</StatLabel>
                            <StatNumber fontSize="md" color={accentColor}>{config?.treasury}</StatNumber>
                          </Stat>
                        </GridItem>
                        <GridItem>
                          <Stat>
                            <StatLabel fontWeight="medium" color={textColor}>Challenging Period</StatLabel>
                            <StatNumber fontSize="md" color={accentColor}>{config?.challenging_period / 3600} hours</StatNumber>
                          </Stat>
                        </GridItem>
                        <GridItem>
                          <Stat>
                            <StatLabel fontWeight="medium" color={textColor}>Voting Period</StatLabel>
                            <StatNumber fontSize="md" color={accentColor}>{config?.voting_period / 3600} hours</StatNumber>
                          </Stat>
                        </GridItem>
                        <GridItem>
                          <Stat>
                            <StatLabel fontWeight="medium" color={textColor}>Minimum Bet</StatLabel>
                            <StatNumber fontSize="md" color={accentColor}>{parseInt(config?.min_bet || '0') / 1000000} CMDX</StatNumber>
                          </Stat>
                        </GridItem>
                        <GridItem>
                          <Stat>
                            <StatLabel fontWeight="medium" color={textColor}>Whitelist Enabled</StatLabel>
                            <StatNumber fontSize="md" color={accentColor}>{config?.whitelist_enabled ? 'Yes' : 'No'}</StatNumber>
                          </Stat>
                        </GridItem>
                      </Grid>
                      <Button 
                        mt={6} 
                        bgGradient={gradientColor} 
                        color="white" 
                        _hover={{
                          bgGradient: "linear(to-r, blue.500, purple.600)",
                        }}
                        onClick={onEditConfigOpen}
                      >
                        Edit Configuration
                      </Button>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Box bg="red.50" borderRadius="2xl" boxShadow="xl" p={6}>
                <Heading size="lg" color="red.600" mb={4}>Emergency Controls</Heading>
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
            </MotionBox>
          </VStack>
        </Container>
      </Box>
    <Modal isOpen={isEditConfigOpen} onClose={onEditConfigClose}>
    <ModalOverlay />
    <ModalContent>
        <ModalHeader>Edit Configuration</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
        <FormControl>
            <FormLabel>Field</FormLabel>
            <Select 
            value={editingConfig.field} 
            onChange={(e) => setEditingConfig({ ...editingConfig, field: e.target.value })}
            >
            <option value="platform_fee">Platform Fee</option>
            <option value="min_bet">Minimum Bet</option>
            <option value="challenging_period">Challenging Period</option>
            <option value="voting_period">Voting Period</option>
            <option value="whitelist_enabled">Whitelist Enabled</option>
            </Select>
        </FormControl>
        <FormControl mt={4}>
            <FormLabel>Value</FormLabel>
            <Input 
            value={editingConfig.value} 
            onChange={(e) => setEditingConfig({ ...editingConfig, value: e.target.value })}
            />
        </FormControl>
        </ModalBody>
        <ModalFooter>
        <Button colorScheme="blue" mr={3} onClick={handleUpdateConfig}>
            Update
        </Button>
        <Button variant="ghost" onClick={onEditConfigClose}>Cancel</Button>
        </ModalFooter>
    </ModalContent>
    </Modal>
    </ChakraProvider>
  );
};

export default AdminDashboard;