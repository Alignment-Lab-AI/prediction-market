'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Flex,
  Badge,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
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
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Icon,
  SimpleGrid,
} from '@chakra-ui/react';
import { FaInfoCircle, FaClock, FaVoteYea, FaGavel, FaExclamationTriangle, FaUsers, FaCoins } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useWeb3 } from '../../contexts/Web3Context';
import { useGlobalContext } from '../../contexts/GlobalContext';

const MotionBox = motion(Box);

interface Market {
  id: number;
  question: string;
  description: string;
  options: string[];
  status: 'Closed' | 'ResultProposed' | 'Challenged' | 'Voting' | 'ReadyToResolve';
  proposedResult?: number;
  challengedResult?: number;
  collateral_amount: string;
  reward_amount: string;
  end_time: string;
  votes?: { optionIndex: number; voteCount: number }[];
}

const StatusBadge = ({ status }) => {
  const colorScheme = {
    Closed: 'gray',
    ResultProposed: 'yellow',
    Challenged: 'orange',
    Voting: 'blue',
    ReadyToResolve: 'green',
  }[status];

  return (
    <Badge colorScheme={colorScheme} px={2} py={1} borderRadius="full">
      {status}
    </Badge>
  );
};

const MarketCard = ({ market, onAction }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      bg={bgColor}
      borderWidth={1}
      borderColor={borderColor}
      borderRadius="xl"
      p={6}
      shadow="xl"
      _hover={{ shadow: '2xl', transform: 'translateY(-5px)' }}
      height="100%"
    >
      <VStack align="stretch" spacing={4} height="100%">
        <Flex justify="space-between" align="center">
          <Heading size="md" noOfLines={2} color={textColor}>{market.question}</Heading>
          <StatusBadge status={market.status} />
        </Flex>
        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} noOfLines={2}>
          {market.description}
        </Text>
        <HStack justify="space-between">
          <Tooltip label="Collateral Amount">
            <HStack>
              <Icon as={FaCoins} color="yellow.500" />
              <Text fontWeight="bold" color={textColor}>
                {(parseInt(market.collateral_amount) / 1000000).toFixed(2)} CMDX
              </Text>
            </HStack>
          </Tooltip>
          <Tooltip label="Reward Amount">
            <HStack>
              <Icon as={FaUsers} color="green.500" />
              <Text fontWeight="bold" color={textColor}>
                {(parseInt(market.reward_amount) / 1000000).toFixed(2)} CMDX
              </Text>
            </HStack>
          </Tooltip>
        </HStack>
        <HStack>
          <FaClock />
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            {formatTimeRemaining(parseInt(market.end_time))}
          </Text>
        </HStack>
        {market.status === 'Voting' && market.votes && (
          <VStack align="stretch">
            <Text fontWeight="bold" color={textColor}>Current Votes:</Text>
            {market.votes.map((vote, index) => (
              <HStack key={index} justify="space-between">
                <Text fontSize="sm" color={textColor}>{market.options[vote.optionIndex]}</Text>
                <Progress value={vote.voteCount} max={100} width="50%" colorScheme="blue" borderRadius="full" />
                <Text fontSize="sm" color={textColor}>{vote.voteCount}%</Text>
              </HStack>
            ))}
          </VStack>
        )}
        <Button 
          colorScheme="blue"
          onClick={() => onAction(market)}
          leftIcon={getActionIcon(market.status)}
          mt="auto"
          size="lg"
          fontWeight="bold"
          borderRadius="full"
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
        >
          {getActionText(market.status)}
        </Button>
      </VStack>
    </MotionBox>
  );
};

const ResolveMarketsPage = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [actionType, setActionType] = useState('');
  const [selectedOption, setSelectedOption] = useState(0);
  const [collateralAmount, setCollateralAmount] = useState(0);
  const { isWalletConnected, walletAddress, connectWallet } = useWeb3();
  const { isInitialLoading, error } = useGlobalContext();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    if (!isInitialLoading) {
      fetchMarkets();
    }
  }, [isInitialLoading]);

  const fetchMarkets = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/markets');
      const filteredMarkets = response.data.filter(market => 
        ['Closed', 'ResultProposed', 'Challenged', 'Voting', 'ReadyToResolve'].includes(market.status)
      );
      setMarkets(filteredMarkets);
    } catch (error) {
      console.error('Error fetching markets:', error);
      toast({
        title: 'Error fetching markets',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAction = (market: Market) => {
    setSelectedMarket(market);
    setActionType(getActionText(market.status));
    setCollateralAmount(parseInt(market.collateral_amount) / 1000000);
    onOpen();
  };

  const handleSubmitAction = async () => {
    if (!isWalletConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your Keplr wallet to perform this action.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      // Here you would integrate with Keplr to sign and broadcast the transaction
      // This is a placeholder for the actual Keplr integration
      const response = await axios.post('http://localhost:3001/api/market-action', {
        marketId: selectedMarket.id,
        action: actionType,
        option: selectedOption,
        collateralAmount,
        walletAddress,
      });

      toast({
        title: 'Action Submitted',
        description: `Your ${actionType} has been submitted successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
      fetchMarkets(); // Refresh the markets list
    } catch (error) {
      console.error('Error submitting action:', error);
      toast({
        title: 'Error',
        description: 'There was an error submitting your action. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isInitialLoading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center" bg={bgColor}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center" bg={bgColor}>
        <Text color="red.500" fontSize="xl" fontWeight="bold">{error}</Text>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minHeight="100vh" py={12}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Heading size="2xl" textAlign="center" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
            Resolve Markets
          </Heading>
          <Text textAlign="center" fontSize="xl" color={useColorModeValue('gray.600', 'gray.400')}>
            Participate in the resolution process of prediction markets and earn rewards.
          </Text>
          
          {!isWalletConnected && (
            <Button
              colorScheme="blue"
              size="lg"
              onClick={connectWallet}
              alignSelf="center"
              mb={4}
              leftIcon={<Icon as={FaInfoCircle} />}
            >
              Connect Keplr Wallet
            </Button>
          )}

          <Tabs isFitted variant="soft-rounded" colorScheme="blue">
            <TabList mb="1em">
              <Tab>All</Tab>
              <Tab>Closed</Tab>
              <Tab>Proposed</Tab>
              <Tab>Challenged</Tab>
              <Tab>Voting</Tab>
              <Tab>Ready to Resolve</Tab>
            </TabList>
            <TabPanels>
              {['All', 'Closed', 'ResultProposed', 'Challenged', 'Voting', 'ReadyToResolve'].map((status, index) => (
                <TabPanel key={index}>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {markets
                      .filter(market => status === 'All' || market.status === status)
                      .map(market => (
                        <MarketCard key={market.id} market={market} onAction={handleAction} />
                      ))
                    }
                  </SimpleGrid>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl" bg={useColorModeValue('white', 'gray.800')}>
          <ModalHeader bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text" fontWeight="bold">
            {actionType}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {['Propose Result', 'Challenge Proposal'].includes(actionType) && (
                <>
                  <FormControl>
                    <FormLabel>Select Option</FormLabel>
                    <Select value={selectedOption} onChange={(e) => setSelectedOption(Number(e.target.value))}>
                      {selectedMarket?.options.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Collateral Amount (CMDX)</FormLabel>
                    <NumberInput value={collateralAmount} isReadOnly>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </>
              )}
              {actionType === 'Vote' && (
                <FormControl>
                  <FormLabel>Select Option to Vote</FormLabel>
                  <Select value={selectedOption} onChange={(e) => setSelectedOption(Number(e.target.value))}>
                    {selectedMarket?.options.map((option, index) => (
                      <option key={index} value={index}>{option}</option>
                    ))}
                  </Select>
                </FormControl>
              )}
              {actionType === 'Resolve' && (
                <Text>Are you sure you want to resolve this market?</Text>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmitAction} isDisabled={!isWalletConnected}>
              Confirm
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const formatTimeRemaining = (endTime: number) => {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = endTime - now;

  if (timeLeft <= 0) return 'Ended';

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

const getActionText = (status: string) => {
  switch (status) {
    case 'Closed': return 'Propose Result';
    case 'ResultProposed': return 'Challenge Proposal';
    case 'Challenged':
    case 'Voting': return 'Vote';
    case 'ReadyToResolve': return 'Resolve';
    default: return 'View Details';
  }
};

const getActionIcon = (status: string) => {
  switch (status) {
    case 'Closed': return FaGavel;
    case 'ResultProposed': return FaExclamationTriangle;
    case 'Challenged':
    case 'Voting': return FaVoteYea;
    case 'ReadyToResolve': return FaGavel;
    default: return FaInfoCircle;
  }
};

export default ResolveMarketsPage;