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
  Switch,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  Tooltip,
  Image,
  Divider,
  Progress,
  Select,
} from '@chakra-ui/react';
import { FaWallet, FaChartBar, FaHistory, FaBell, FaTrophy, FaExchangeAlt, FaUserShield, FaEdit, FaInfoCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import NextLink from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '../../contexts/Web3Context';
import { encodeQuery } from '../../utils/queryUtils';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  fonts: {
    heading: '"Poppins", sans-serif',
    body: '"Poppins", sans-serif',
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

interface UserProfile {
  name: string;
  walletAddress: string;
  balance: number;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  winRate: number;
  avatar: string;
}

interface Order {
  id: number;
  market_id: number;
  creator: string;
  option_id: number;
  side: 'Back' | 'Lay';
  amount: string;
  odds: number;
  filled_amount: string;
  status: string;
  timestamp: number;
}

interface MatchedBet {
  id: number;
  market_id: number;
  option_id: number;
  amount: string;
  odds: number;
  timestamp: number;
  back_user: string;
  lay_user: string;
  redeemed: boolean;
}

const EditProfileModal = ({ isOpen, onClose, userProfile, onSave }) => {
  const [editName, setEditName] = useState(userProfile.name);
  const [editAvatar, setEditAvatar] = useState(userProfile.avatar);

  const handleSave = () => {
    onSave({ name: editName, avatar: editAvatar });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent borderRadius="xl" bg={useColorModeValue("white", "gray.800")}>
        <ModalHeader bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text" fontWeight="bold">
          Edit Profile
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            <FormControl>
              <FormLabel fontWeight="medium">Name</FormLabel>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                borderRadius="full"
                focusBorderColor="blue.400"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="medium">Avatar</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setEditAvatar(e.target.files[0])}
                p={1}
              />
            </FormControl>
            <HStack width="100%">
              <Text fontWeight="medium">Wallet:</Text>
              <Text isTruncated>{userProfile.walletAddress}</Text>
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handleSave}
            bgGradient="linear(to-r, blue.400, purple.500)"
            color="white"
            _hover={{
              bgGradient: "linear(to-r, blue.500, purple.600)",
            }}
            borderRadius="full"
            mr={3}
          >
            Save Changes
          </Button>
          <Button variant="ghost" onClick={onClose} borderRadius="full">Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const UserProfilePage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Crypto Enthusiast",
    walletAddress: "",
    balance: 0,
    totalBets: 0,
    wonBets: 0,
    lostBets: 0,
    winRate: 0,
    avatar: "https://bit.ly/broken-link",
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [matchedBets, setMatchedBets] = useState<MatchedBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: false,
    sms: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isWalletConnected, walletAddress } = useWeb3();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = "blue.400";
  const gradientColor = "linear(to-r, blue.400, purple.500)";

  useEffect(() => {
    const fetchData = async () => {
      if (!isWalletConnected || !walletAddress) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to view your profile.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      try {
        const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
        const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

        if (!REAL_BASE_URL || !CONTRACT_ADDRESS) {
          throw new Error("REST URL or Contract Address not defined in environment variables");
        }

        const orderQuery = {
          user_orders: {
            user: walletAddress,
            start_after: (currentPage - 1) * itemsPerPage,
            limit: itemsPerPage
          }
        };
        const encodedOrderQuery = encodeQuery(orderQuery);

        const matchedBetQuery = {
          matched_bets: {
            user: walletAddress,
            start_after: (currentPage - 1) * itemsPerPage,
            limit: itemsPerPage
          }
        };
        const encodedMatchedBetQuery = encodeQuery(matchedBetQuery);

        const [orderResponse, matchedBetResponse] = await Promise.all([
          axios.get(`${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedOrderQuery}`),
          axios.get(`${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedMatchedBetQuery}`)
        ]);

        setOrders(orderResponse.data.data.sort((a, b) => b.timestamp - a.timestamp));
        setMatchedBets(matchedBetResponse.data.data.sort((a, b) => b.timestamp - a.timestamp));

        const totalBets = orderResponse.data.data.length + matchedBetResponse.data.data.length;
        const wonBets = matchedBetResponse.data.data.filter(bet => bet.redeemed).length;
        const lostBets = totalBets - wonBets;
        const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
        const balance = orderResponse.data.data.reduce((acc, order) => acc + parseFloat(order.amount), 0) +
          matchedBetResponse.data.data.reduce((acc, bet) => acc + parseFloat(bet.amount), 0);

        setUserProfile(prev => ({
          ...prev,
          walletAddress,
          totalBets,
          wonBets,
          lostBets,
          winRate,
          balance: balance / 1000000, // Convert to OSMO
        }));

      } catch (err) {
        console.error('Error fetching data:', err);
        toast({
          title: "Error fetching data",
          description: "There was an error loading your profile data. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast, isWalletConnected, walletAddress, currentPage, itemsPerPage]);

  const handleNotificationToggle = (type: 'email' | 'push' | 'sms') => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    toast({
      title: "Notification Setting Updated",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} notifications ${notificationSettings[type] ? 'disabled' : 'enabled'}.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleProfileSave = (updatedProfile) => {
    setUserProfile(prev => ({ ...prev, ...updatedProfile }));
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center" bg={bgColor}>
        <Spinner size="xl" color={accentColor} thickness="4px" />
      </Box>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Box bg={bgColor} minHeight="100vh" py={6} px={4}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                bg={cardBgColor}
                borderRadius="3xl"
                boxShadow="2xl"
                overflow="hidden"
                position="relative"
              >
                <Box
                  bgGradient={gradientColor}
                  h={{ base: "150px", md: "200px" }}
                  position="relative"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '50px 50px',
                    opacity: 0.1,
                    mixBlendMode: 'overlay',
                  }}
                >
                  <Box
                    position="absolute"
                    bottom={{ base: "-40px", md: "-50px" }}
                    left={{ base: "20px", md: "50px" }}
                    borderRadius="full"
                    border="4px solid"
                    borderColor={cardBgColor}
                    boxShadow="lg"
                  >
                    <Avatar
                      size={{ base: "xl", md: "2xl" }}
                      name={userProfile.name}
                      src={userProfile.avatar}
                      bg={accentColor}
                    >
                      <AvatarBadge boxSize="1.25em" bg="green.500" />
                    </Avatar>
                  </Box>
                </Box>
                <Box p={{ base: 4, md: 8 }} pt={{ base: 12, md: 16 }}>
                  <Flex flexDirection={{ base: "column", md: "row" }} justifyContent="space-between" alignItems={{ base: "flex-start", md: "center" }}>
                    <VStack align="start" spacing={2} mb={{ base: 4, md: 0 }}>
                      <Heading size={{ base: "xl", md: "2xl" }} bgGradient={gradientColor} bgClip="text">
                        {userProfile.name}
                      </Heading>
                      <Text color="gray.500" fontSize={{ base: "sm", md: "md" }}>Prediction Market Enthusiast</Text>
                      <Text color="gray.500" fontSize={{ base: "xs", md: "sm" }} fontStyle="italic" isTruncated maxW={{ base: "100%", md: "300px" }}>
                        {userProfile.walletAddress}
                      </Text>
                    </VStack>
                    <VStack align={{ base: "stretch", md: "end" }} spacing={4} width={{ base: "100%", md: "auto" }}>
                      <Button
                        leftIcon={<Icon as={FaEdit} />}
                        onClick={onOpen}
                        bgGradient={gradientColor}
                        color="white"
                        _hover={{
                          bgGradient: "linear(to-r, blue.500, purple.600)",
                        }}
                        size={{ base: "md", md: "lg" }}
                        borderRadius="full"
                        width={{ base: "100%", md: "auto" }}
                      >
                        Edit Profile
                      </Button>
                      <NextLink href="/admin-dashboard" passHref>
                        <Button
                          as="a"
                          leftIcon={<Icon as={FaUserShield} />}
                          colorScheme="purple"
                          size={{ base: "md", md: "lg" }}
                          borderRadius="full"
                          width={{ base: "100%", md: "auto" }}
                        >
                          Admin Dashboard
                        </Button>
                      </NextLink>
                    </VStack>
                  </Flex>
                </Box>
              </Box>
            </MotionBox>

            <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
              {[
                { label: 'Wallet Balance', icon: FaWallet, value: `${userProfile.balance.toFixed(2)} OSMO`, color: 'blue.400' },
                { label: 'Total Bets', icon: FaChartBar, value: userProfile.totalBets, color: 'purple.500' },
                { label: 'Win Rate', icon: FaTrophy, value: `${userProfile.winRate.toFixed(2)}%`, color: 'yellow.400', helpText: `${userProfile.wonBets} won / ${userProfile.lostBets} lost` },
                { label: 'Profit/Loss', icon: FaExchangeAlt, value: `${userProfile.balance > 0 ? '+' : ''}${userProfile.balance.toFixed(2)} OSMO`, color: userProfile.balance > 0 ? 'green.400' : 'red.400' },
              ].map((stat, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "2xl" }}
                >
                  <Stat
                    px={4}
                    py={6}
                    bg={cardBgColor}
                    backdropFilter="blur(10px)"
                    borderRadius="2xl"
                    boxShadow="xl"
                    border="1px solid"
                    borderColor={borderColor}
                    height={{ base: "auto", md: "200px" }}
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
                    <StatLabel fontWeight="medium" color={textColor} fontSize={{ base: "sm", md: "lg" }}>
                      <HStack spacing={2}>
                        <Icon as={stat.icon} color={stat.color} boxSize={{ base: 4, md: 6 }} />
                        <Text>{stat.label}</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber fontSize={{ base: "xl", md: "3xl" }} fontWeight="bold" color={stat.color} mt={2}>
                      {stat.value}
                    </StatNumber>
                    {stat.helpText && (
                      <StatHelpText mt={2} fontSize={{ base: "xs", md: "sm" }}>
                        <StatArrow type={userProfile.winRate > 50 ? 'increase' : 'decrease'} />
                        {stat.helpText}
                      </StatHelpText>
                    )}
                    <Progress
                      value={stat.label === 'Win Rate' ? userProfile.winRate : 100}
                      colorScheme={stat.color.split('.')[0]}
                      size="sm"
                      mt={4}
                      borderRadius="full"
                    />
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
                <TabList
                  bg={cardBgColor}
                  backdropFilter="blur(10px)"
                  p={4}
                  borderRadius="2xl"
                  boxShadow="md"
                  border="1px solid"
                  borderColor={borderColor}
                  overflowX="auto"
                  whiteSpace="nowrap"
                >
                  <Tab fontSize={{ base: "sm", md: "lg" }} fontWeight="medium" _selected={{ color: 'white', bg: accentColor }}>Betting History</Tab>
                  <Tab fontSize={{ base: "sm", md: "lg" }} fontWeight="medium" _selected={{ color: 'white', bg: accentColor }}>Notification Settings</Tab>
                </TabList>

                <TabPanels mt={6}>
                  <TabPanel>
                    <Box
                      bg={cardBgColor}
                      backdropFilter="blur(10px)"
                      p={4}
                      borderRadius="2xl"
                      boxShadow="xl"
                      border="1px solid"
                      borderColor={borderColor}
                      overflowX="auto"
                    >
                      <Heading size="lg" bgGradient={gradientColor} bgClip="text" mb={6}>Betting History</Heading>
                      <Tabs>
                        <TabList overflowX="auto" whiteSpace="nowrap">
                          <Tab>Active Orders</Tab>
                          <Tab>Matched Bets</Tab>
                          <Tab>Past Orders</Tab>
                        </TabList>
                        <TabPanels>
                          <TabPanel>
                            <Box overflowX="auto">
                              <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                <Thead>
                                  <Tr>
                                    <Th>Market ID</Th>
                                    <Th>Side</Th>
                                    <Th>Amount</Th>
                                    <Th>Odds</Th>
                                    <Th>Filled Amount</Th>
                                    <Th>Status</Th>
                                    <Th>Timestamp</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {orders.filter(order => order.status === 'Open' || order.status === 'PartiallyFilled').map((order) => (
                                    <Tr key={order.id}>
                                      <Td>{order.market_id}</Td>
                                      <Td>
                                        <Badge colorScheme={order.side === 'Back' ? 'green' : 'red'}>
                                          {order.side}
                                        </Badge>
                                      </Td>
                                      <Td>{(parseFloat(order.amount) / 1000000).toFixed(2)} OSMO</Td>
                                      <Td>{(order.odds / 100).toFixed(2)}</Td>
                                      <Td>{(parseFloat(order.filled_amount) / 1000000).toFixed(2)} OSMO</Td>
                                      <Td>
                                        <Badge colorScheme={order.status === 'Open' ? 'green' : 'yellow'}>
                                          {order.status}
                                        </Badge>
                                      </Td>
                                      <Td>{new Date(order.timestamp * 1000).toLocaleString()}</Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </Box>
                          </TabPanel>
                          <TabPanel>
                            <Box overflowX="auto">
                              <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                <Thead>
                                  <Tr>
                                    <Th>Market ID</Th>
                                    <Th>Amount</Th>
                                    <Th>Odds</Th>
                                    <Th>Role</Th>
                                    <Th>Status</Th>
                                    <Th>Timestamp</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {matchedBets.map((bet) => (
                                    <Tr key={bet.id}>
                                      <Td>{bet.market_id}</Td>
                                      <Td>{(parseFloat(bet.amount) / 1000000).toFixed(2)} OSMO</Td>
                                      <Td>{(bet.odds / 100).toFixed(2)}</Td>
                                      <Td>
                                        <Badge colorScheme={bet.back_user === walletAddress ? 'green' : 'red'}>
                                          {bet.back_user === walletAddress ? 'Back' : 'Lay'}
                                        </Badge>
                                      </Td>
                                      <Td>
                                        <Badge colorScheme={bet.redeemed ? 'green' : 'yellow'}>
                                          {bet.redeemed ? 'Redeemed' : 'Active'}
                                        </Badge>
                                      </Td>
                                      <Td>{new Date(bet.timestamp * 1000).toLocaleString()}</Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </Box>
                          </TabPanel>
                          <TabPanel>
                            <Box overflowX="auto">
                              <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                <Thead>
                                  <Tr>
                                    <Th>Market ID</Th>
                                    <Th>Side</Th>
                                    <Th>Amount</Th>
                                    <Th>Odds</Th>
                                    <Th>Filled Amount</Th>
                                    <Th>Status</Th>
                                    <Th>Timestamp</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {orders.filter(order => order.status !== 'Open' && order.status !== 'PartiallyFilled').map((order) => (
                                    <Tr key={order.id}>
                                      <Td>{order.market_id}</Td>
                                      <Td>
                                        <Badge colorScheme={order.side === 'Back' ? 'green' : 'red'}>
                                          {order.side}
                                        </Badge>
                                      </Td>
                                      <Td>{(parseFloat(order.amount) / 1000000).toFixed(2)} OSMO</Td>
                                      <Td>{(order.odds / 100).toFixed(2)}</Td>
                                      <Td>{(parseFloat(order.filled_amount) / 1000000).toFixed(2)} OSMO</Td>
                                      <Td>
                                        <Badge colorScheme={order.status === 'Filled' ? 'green' : 'red'}>
                                          {order.status}
                                        </Badge>
                                      </Td>
                                      <Td>{new Date(order.timestamp * 1000).toLocaleString()}</Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </Box>
                          </TabPanel>
                        </TabPanels>
                      </Tabs>
                      <Flex justifyContent="space-between" alignItems="center" mt={4} flexDirection={{ base: "column", md: "row" }} gap={4}>
                        <HStack>
                          <Text fontSize={{ base: "sm", md: "md" }}>Items per page:</Text>
                          <Select value={itemsPerPage} onChange={handleItemsPerPageChange} w="70px" size={{ base: "sm", md: "md" }}>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                          </Select>
                        </HStack>
                        <HStack>
                          <Button
                            onClick={() => handlePageChange(currentPage - 1)}
                            isDisabled={currentPage === 1}
                            leftIcon={<FaChevronLeft />}
                            size={{ base: "sm", md: "md" }}
                          >
                            Previous
                          </Button>
                          <Text fontSize={{ base: "sm", md: "md" }}>{`Page ${currentPage}`}</Text>
                          <Button
                            onClick={() => handlePageChange(currentPage + 1)}
                            isDisabled={orders.length + matchedBets.length < itemsPerPage}
                            rightIcon={<FaChevronRight />}
                            size={{ base: "sm", md: "md" }}
                          >
                            Next
                          </Button>
                        </HStack>
                      </Flex>
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    <Box
                      bg={cardBgColor}
                      backdropFilter="blur(10px)"
                      p={6}
                      borderRadius="2xl"
                      boxShadow="xl"
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <Heading size="lg" bgGradient={gradientColor} bgClip="text" mb={6}>Notification Settings</Heading>
                      <VStack spacing={6} align="stretch">
                        {['email', 'push', 'sms'].map((type) => (
                          <Flex key={type} justifyContent="space-between" alignItems="center">
                            <HStack spacing={4}>
                              <Icon as={FaBell} color={accentColor} boxSize={6} />
                              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="medium">{type.charAt(0).toUpperCase() + type.slice(1)} Notifications</Text>
                            </HStack>
                            <Switch
                              size="lg"
                              isChecked={notificationSettings[type]}
                              onChange={() => handleNotificationToggle(type as 'email' | 'push' | 'sms')}
                              colorScheme="blue"
                            />
                          </Flex>
                        ))}
                      </VStack>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Box bg={cardBgColor} borderRadius="xl" boxShadow="xl" p={6}>
                <Heading size="md" mb={4}>Understanding Your Profile</Heading>
                <VStack align="start" spacing={4}>
                  <HStack>
                    <Icon as={FaInfoCircle} color="blue.500" />
                    <Text fontSize={{ base: "sm", md: "md" }}><strong>Wallet Balance:</strong> This is your current balance in OSMO tokens.</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaInfoCircle} color="purple.500" />
                    <Text fontSize={{ base: "sm", md: "md" }}><strong>Total Bets:</strong> The total number of bets you have placed, including active and past bets.</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaInfoCircle} color="yellow.500" />
                    <Text fontSize={{ base: "sm", md: "md" }}><strong>Win Rate:</strong> Your success rate in predictions, calculated from your won and lost bets.</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaInfoCircle} color="green.500" />
                    <Text fontSize={{ base: "sm", md: "md" }}><strong>Profit/Loss:</strong> Your overall performance in OSMO tokens, considering all your bets.</Text>
                  </HStack>
                </VStack>
              </Box>
            </MotionBox>
          </VStack>
        </Container>
      </Box>

      <EditProfileModal
        isOpen={isOpen}
        onClose={onClose}
        userProfile={userProfile}
        onSave={handleProfileSave}
      />
    </ChakraProvider>
  );
};

export default UserProfilePage;