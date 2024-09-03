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
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useColorModeValue,
  Icon,
  Tooltip,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  RadioGroup,
  Radio,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { FaGavel, FaExclamationTriangle, FaVoteYea, FaClock, FaCoins, FaCheckCircle, FaTimesCircle, FaChartLine, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import { motion } from 'framer-motion';
import { broadcastTransaction } from '../../utils/web3';
import { useWeb3 } from '../../contexts/Web3Context';
import { encodeQuery } from '../../utils/queryUtils';
import { getRealConfig } from '../../utils/api';

const MotionBox = motion(Box);

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

const ResolveMarketPage = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [proposedOutcome, setProposedOutcome] = useState('');
  const [disputeOutcome, setDisputeOutcome] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');
  const [voteOutcome, setVoteOutcome] = useState('');
  const [marketType, setMarketType] = useState('closed');
  const { isOpen: isProposeOpen, onOpen: onProposeOpen, onClose: onProposeClose } = useDisclosure();
  const { isOpen: isDisputeOpen, onOpen: onDisputeOpen, onClose: onDisputeClose } = useDisclosure();
  const { isOpen: isVoteOpen, onOpen: onVoteOpen, onClose: onVoteClose } = useDisclosure();
  const toast = useToast();
  const { isWalletConnected, walletAddress } = useWeb3();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = "blue.400";
  const gradientColor = "linear(to-r, blue.400, purple.500)";

  const fetchMarkets = async () => {
    try {
      const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
      const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

      if (!REAL_BASE_URL || !CONTRACT_ADDRESS) {
        throw new Error("REST URL or Contract Address not defined in environment variables");
      }

      const query = {
        markets: {
          status: marketType === 'closed' ? "Closed" : "Disputed",
          start_after: 0,
          limit: 10
        }
      };
      const encodedQuery = encodeQuery(query);

      const response = await axios.get(
        `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
      );
      setMarkets(response.data.data);
    } catch (error) {
      console.error("Error fetching markets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch markets.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchConfig = async () => {
    try {
      const configData = await getRealConfig();
      setConfig(configData);
    } catch (error) {
      console.error("Error fetching config:", error);
      toast({
        title: "Error",
        description: "Failed to fetch configuration.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchMarkets(), fetchConfig()]);
      setIsLoading(false);
    };
    fetchData();
  }, [marketType]);

  const handleProposeResult = async () => {
    if (!isWalletConnected || !selectedMarket) {
      toast({
        title: "Error",
        description: "Please connect your wallet and select a market.",
        status: "error",
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

      const msg = {
        propose_result: {
          market_id: selectedMarket.id,
          winning_outcome: parseInt(proposedOutcome)
        }
      };

      const funds = [{
        denom: "ucmdx",
        amount: selectedMarket.resolution_bond
      }];

      const result = await broadcastTransaction(chainId, contractAddress, msg, funds);

      toast({
        title: "Result Proposed",
        description: `Result proposed for market ${selectedMarket.id}. Transaction hash: ${result.transactionHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onProposeClose();
      fetchMarkets();
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

  const handleRaiseDispute = async () => {
    if (!isWalletConnected || !selectedMarket) {
      toast({
        title: "Error",
        description: "Please connect your wallet and select a market.",
        status: "error",
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

      const msg = {
        raise_dispute: {
          market_id: selectedMarket.id,
          proposed_outcome: parseInt(disputeOutcome),
          evidence: disputeEvidence
        }
      };

      const funds = [{
        denom: "ucmdx",
        amount: selectedMarket.resolution_bond
      }];

      const result = await broadcastTransaction(chainId, contractAddress, msg, funds);

      toast({
        title: "Dispute Raised",
        description: `Dispute raised for market ${selectedMarket.id}. Transaction hash: ${result.transactionHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onDisputeClose();
      fetchMarkets();
    } catch (err) {
      console.error("Error raising dispute:", err);
      toast({
        title: "Error",
        description: "Failed to raise dispute. " + (err instanceof Error ? err.message : "Unknown error occurred"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCastVote = async () => {
    if (!isWalletConnected || !selectedMarket) {
      toast({
        title: "Error",
        description: "Please connect your wallet and select a market.",
        status: "error",
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

      const msg = {
        cast_vote: {
          market_id: selectedMarket.id,
          outcome: parseInt(voteOutcome)
        }
      };

      const result = await broadcastTransaction(chainId, contractAddress, msg, []);

      toast({
        title: "Vote Cast",
        description: `Vote cast for market ${selectedMarket.id}. Transaction hash: ${result.transactionHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onVoteClose();
      fetchMarkets();
    } catch (err) {
      console.error("Error casting vote:", err);
      toast({
        title: "Error",
        description: "Failed to cast vote. " + (err instanceof Error ? err.message : "Unknown error occurred"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const MarketCard = ({ market }: { market: Market }) => (
    <MotionBox
      bg={cardBgColor}
      p={6}
      borderRadius="xl"
      boxShadow="xl"
      border="1px solid"
      borderColor={borderColor}
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-5px)', boxShadow: '2xl' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <VStack align="stretch" spacing={4}>
        <Heading size="md" noOfLines={2}>{market.question}</Heading>
        <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")} noOfLines={3}>
          {market.description}
        </Text>
        <Divider />
        <SimpleGrid columns={2} spacing={4}>
          <Stat>
            <StatLabel>Bond Amount</StatLabel>
            <StatNumber>{parseInt(market.resolution_bond) / 1000000} CMDX</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Reward Amount</StatLabel>
            <StatNumber>{parseInt(market.resolution_reward) / 1000000} CMDX</StatNumber>
          </Stat>
        </SimpleGrid>
        <Divider />
        <HStack justify="space-between">
          <Badge colorScheme={market.status === 'Closed' ? 'yellow' : 'red'}>
            {market.status}
          </Badge>
          <HStack>
            {market.status === 'Closed' && (
              <Tooltip label="Propose Result">
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => {
                    setSelectedMarket(market);
                    onProposeOpen();
                  }}
                >
                  <Icon as={FaGavel} />
                </Button>
              </Tooltip>
            )}
            {market.status === 'Closed' && (
              <Tooltip label="Raise Dispute">
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => {
                    setSelectedMarket(market);
                    onDisputeOpen();
                  }}
                >
                  <Icon as={FaExclamationTriangle} />
                </Button>
              </Tooltip>
            )}
            {market.status === 'Disputed' && (
              <Tooltip label="Cast Vote">
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={() => {
                    setSelectedMarket(market);
                    onVoteOpen();
                  }}
                >
                  <Icon as={FaVoteYea} />
                </Button>
              </Tooltip>
            )}
          </HStack>
        </HStack>
      </VStack>
    </MotionBox>
  );

  const ResolutionProcess = () => (
    <Box
      bg={cardBgColor}
      p={8}
      borderRadius="xl"
      boxShadow="2xl"
      border="1px solid"
      borderColor={borderColor}
      mt={12}
    >
      <Heading size="lg" mb={6} bgGradient={gradientColor} bgClip="text">Resolution Process</Heading>
      <VStack spacing={8} align="stretch">
        {[
          { icon: FaCheckCircle, title: "Market Closes", description: "The market reaches its end time and closes for trading." },
          { icon: FaGavel, title: "Result Proposal", description: "Users can propose a result by staking the resolution bond." },
          { icon: FaClock, title: "Challenging Period", description: `Other users can dispute the proposed result within ${config ? config.challenging_period / 3600 : 'N/A'} hours.` },
          { icon: FaExclamationTriangle, title: "Dispute Raised", description: "If disputed, the market enters a voting phase." },
          { icon: FaVoteYea, title: "Voting Period", description: `Whitelisted users vote on the correct outcome within ${config ? config.voting_period / 3600 : 'N/A'} hours.` },
          { icon: FaCoins, title: "Resolution", description: "The market is resolved based on voting results or undisputed proposal." },
        ].map((step, index) => (
          <HStack key={index} spacing={4} align="start">
            <Box
              borderRadius="full"
              bg={useColorModeValue("blue.100", "blue.900")}
              p={3}
              color={accentColor}
            >
              <Icon as={step.icon} boxSize={6} />
            </Box>
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">{step.title}</Text>
              <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                {step.description}
              </Text>
            </VStack>
          </HStack>
        ))}
      </VStack>
    </Box>
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
                  <Heading size="2xl" color="white">Resolve Markets</Heading>
                  <Text color="whiteAlpha.800">Propose results, raise disputes, and vote on market outcomes</Text>
                </VStack>
                <Icon as={FaGavel} fontSize="5xl" color="white" />
              </Flex>
            </MotionBox>

            <Tabs variant="soft-rounded" colorScheme="blue" onChange={(index) => setMarketType(index === 0 ? 'closed' : 'disputed')}>
              <TabList>
                <Tab>Closed Markets</Tab>
                <Tab>Disputed Markets</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={8}>
                    {isLoading ? (
                      <GridItem colSpan={3}>
                        <Flex justify="center" align="center" height="200px">
                          <Spinner size="xl" color={accentColor} thickness="4px" />
                        </Flex>
                      </GridItem>
                    ) : markets.length === 0 ? (
                      <GridItem colSpan={3}>
                        <Text textAlign="center" fontSize="xl" color={textColor}>No closed markets available.</Text>
                      </GridItem>
                    ) : (
                      markets.map((market) => (
                        <MarketCard key={market.id} market={market} />
                      ))
                    )}
                  </Grid>
                </TabPanel>
                <TabPanel>
                  <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={8}>
                    {isLoading ? (
                      <GridItem colSpan={3}>
                        <Flex justify="center" align="center" height="200px">
                          <Spinner size="xl" color={accentColor} thickness="4px" />
                        </Flex>
                      </GridItem>
                    ) : markets.length === 0 ? (
                      <GridItem colSpan={3}>
                        <Text textAlign="center" fontSize="xl" color={textColor}>No disputed markets available.</Text>
                      </GridItem>
                    ) : (
                      markets.map((market) => (
                        <MarketCard key={market.id} market={market} />
                      ))
                    )}
                  </Grid>
                </TabPanel>
              </TabPanels>
            </Tabs>

            <ResolutionProcess />

            {config && (
              <Box bg={cardBgColor} p={6} borderRadius="xl" boxShadow="xl">
                <Heading size="lg" bgGradient={gradientColor} bgClip="text" mb={6}>Platform Configuration</Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                  <Stat>
                    <StatLabel>Platform Fee</StatLabel>
                    <StatNumber>{parseInt(config.platform_fee) / 100}%</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Challenging Period</StatLabel>
                    <StatNumber>{config.challenging_period / 3600} hours</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Voting Period</StatLabel>
                    <StatNumber>{config.voting_period / 3600} hours</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Minimum Bet</StatLabel>
                    <StatNumber>{parseInt(config.min_bet) / 1000000} CMDX</StatNumber>
                  </Stat>
                </SimpleGrid>
              </Box>
            )}
          </VStack>
        </Container>
      </Box>

      {/* Propose Result Modal */}
      <Modal isOpen={isProposeOpen} onClose={onProposeClose}>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent bg={cardBgColor}>
          <ModalHeader bgGradient={gradientColor} bgClip="text">Propose Result</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Winning Outcome</FormLabel>
              <Select 
                value={proposedOutcome} 
                onChange={(e) => setProposedOutcome(e.target.value)}
                bg={useColorModeValue("white", "gray.700")}
              >
                {selectedMarket?.options.map((option, index) => (
                  <option key={index} value={index}>{option}</option>
                ))}
              </Select>
            </FormControl>
            <VStack mt={4} align="stretch" spacing={4}>
              <Stat>
                <StatLabel>Bond Amount</StatLabel>
                <StatNumber>{selectedMarket && parseInt(selectedMarket.resolution_bond) / 1000000} CMDX</StatNumber>
                <StatHelpText>Required to propose a result</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Reward Amount</StatLabel>
                <StatNumber>{selectedMarket && parseInt(selectedMarket.resolution_reward) / 1000000} CMDX</StatNumber>
                <StatHelpText>Earned for successful resolution</StatHelpText>
              </Stat>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="blue" 
              mr={3} 
              onClick={handleProposeResult}
              bgGradient={gradientColor}
              _hover={{
                bgGradient: "linear(to-r, blue.500, purple.600)",
              }}
            >
              Propose
            </Button>
            <Button variant="ghost" onClick={onProposeClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Raise Dispute Modal */}
      <Modal isOpen={isDisputeOpen} onClose={onDisputeClose}>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent bg={cardBgColor}>
          <ModalHeader bgGradient={gradientColor} bgClip="text">Raise Dispute</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Proposed Outcome</FormLabel>
              <Select 
                value={disputeOutcome} 
                onChange={(e) => setDisputeOutcome(e.target.value)}
                bg={useColorModeValue("white", "gray.700")}
              >
                {selectedMarket?.options.map((option, index) => (
                  <option key={index} value={index}>{option}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Evidence</FormLabel>
              <Textarea 
                value={disputeEvidence}
                onChange={(e) => setDisputeEvidence(e.target.value)}
                placeholder="Provide evidence supporting your proposed outcome"
                bg={useColorModeValue("white", "gray.700")}
              />
            </FormControl>
            <VStack mt={4} align="stretch" spacing={4}>
              <Stat>
                <StatLabel>Bond Amount</StatLabel>
                <StatNumber>{selectedMarket && parseInt(selectedMarket.resolution_bond) / 1000000} CMDX</StatNumber>
                <StatHelpText>Required to raise a dispute</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Challenging Period</StatLabel>
                <StatNumber>{config ? config.challenging_period / 3600 : 'N/A'} hours</StatNumber>
                <StatHelpText>Time left to raise a dispute</StatHelpText>
              </Stat>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="red" 
              mr={3} 
              onClick={handleRaiseDispute}
              bgGradient="linear(to-r, red.400, pink.500)"
              _hover={{
                bgGradient: "linear(to-r, red.500, pink.600)",
              }}
            >
              Raise Dispute
            </Button>
            <Button variant="ghost" onClick={onDisputeClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Cast Vote Modal */}
      <Modal isOpen={isVoteOpen} onClose={onVoteClose}>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent bg={cardBgColor}>
          <ModalHeader bgGradient={gradientColor} bgClip="text">Cast Vote</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Choose Outcome</FormLabel>
              <RadioGroup onChange={setVoteOutcome} value={voteOutcome}>
                <VStack align="start">
                  {selectedMarket?.options.map((option, index) => (
                    <Radio key={index} value={index.toString()}>{option}</Radio>
                  ))}
                </VStack>
              </RadioGroup>
            </FormControl>
            <VStack mt={4} align="stretch" spacing={4}>
              <Stat>
                <StatLabel>Voting Period</StatLabel>
                <StatNumber>{config ? config.voting_period / 3600 : 'N/A'} hours</StatNumber>
                <StatHelpText>Time left to cast your vote</StatHelpText>
              </Stat>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="green" 
              mr={3} 
              onClick={handleCastVote}
              bgGradient="linear(to-r, green.400, teal.500)"
              _hover={{
                bgGradient: "linear(to-r, green.500, teal.600)",
              }}
            >
              Cast Vote
            </Button>
            <Button variant="ghost" onClick={onVoteClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
};

export default ResolveMarketPage;