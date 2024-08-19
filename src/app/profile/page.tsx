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
  Progress,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FaWallet, FaChartBar, FaHistory, FaBell, FaUserCog, FaTrophy, FaExchangeAlt, FaUserShield, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import NextLink from 'next/link';

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

interface UserProfile {
  name: string;
  walletAddress: string;
  balance: number;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  winRate: number;
  level: number;
  xp: number;
  nextLevelXp: number;
}

interface Bet {
  id: number;
  bettor: string;
  market_id: number;
  option_index: number;
  position: string;
  amount: string;
  matched_amount: string;
  odds: string;
  redeemed: boolean;
}

const UserProfilePage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Crypto Enthusiast",
    walletAddress: "comdex1nh4gxgzq7hw8fvtkxjg4kpfqmsq65szqxxdqye",
    balance: 0,
    totalBets: 0,
    wonBets: 0,
    lostBets: 0,
    winRate: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 100,
  });
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: false,
    sms: false,
  });
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editName, setEditName] = useState(userProfile.name);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const betsResponse = await axios.get<Bet[]>('http://localhost:3001/api/user-bets/comdex1nh4gxgzq7hw8fvtkxjg4kpfqmsq65szqxxdqye');
        setBets(betsResponse.data);

        // Calculate profile stats based on bets
        const totalBets = betsResponse.data.length;
        const wonBets = betsResponse.data.filter(bet => bet.redeemed).length;
        const lostBets = totalBets - wonBets;
        const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
        const balance = betsResponse.data.reduce((acc, bet) => acc + parseInt(bet.amount), 0) / 1000000; // Convert to UCMDX

        setUserProfile(prev => ({
          ...prev,
          totalBets,
          wonBets,
          lostBets,
          winRate,
          balance,
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
  }, [toast]);

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

  const handleEditName = () => {
    setUserProfile(prev => ({ ...prev, name: editName }));
    onClose();
    toast({
      title: "Name Updated",
      description: "Your profile name has been updated successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
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
              <HStack spacing={4}>
                <Avatar size="xl" name={userProfile.name} bg="brand.500">
                  <AvatarBadge boxSize="1.25em" bg="green.500" />
                </Avatar>
                <VStack align="start" spacing={1}>
                  <Heading size="xl">{userProfile.name}</Heading>
                  <Text color="gray.500" fontSize="sm">Level {userProfile.level} Predictor</Text>
                  <HStack>
                    <Progress value={(userProfile.xp / userProfile.nextLevelXp) * 100} size="sm" width="200px" colorScheme="green" />
                    <Text fontSize="xs" color="gray.500">
                      {userProfile.xp}/{userProfile.nextLevelXp} XP
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
              <VStack align="end" spacing={2}>
                <NextLink href="/admin-dashboard" passHref>
                  <Button as="a" leftIcon={<Icon as={FaUserShield} />} colorScheme="purple" size="sm">
                    Admin Dashboard
                  </Button>
                </NextLink>
                <Button leftIcon={<Icon as={FaUserCog} />} colorScheme="brand" size="sm" onClick={onOpen}>
                  Edit Profile
                </Button>
              </VStack>
            </Flex>

            <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={6}>
              <GridItem>
                <Stat px={4} py={5} shadow="xl" borderRadius="lg" bg="white">
                  <StatLabel fontWeight="medium">
                    <HStack spacing={2}>
                      <Icon as={FaWallet} color="brand.500" />
                      <Text>Wallet Balance</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="3xl">{userProfile.balance.toFixed(2)} UCMDX</StatNumber>
                </Stat>
              </GridItem>
              <GridItem>
                <Stat px={4} py={5} shadow="xl" borderRadius="lg" bg="white">
                  <StatLabel fontWeight="medium">
                    <HStack spacing={2}>
                      <Icon as={FaChartBar} color="brand.500" />
                      <Text>Total Bets</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="3xl">{userProfile.totalBets}</StatNumber>
                </Stat>
              </GridItem>
              <GridItem>
                <Stat px={4} py={5} shadow="xl" borderRadius="lg" bg="white">
                  <StatLabel fontWeight="medium">
                    <HStack spacing={2}>
                      <Icon as={FaTrophy} color="brand.500" />
                      <Text>Win Rate</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="3xl">{userProfile.winRate.toFixed(2)}%</StatNumber>
                  <StatHelpText>
                    <StatArrow type={userProfile.winRate > 50 ? 'increase' : 'decrease'} />
                    {userProfile.wonBets} won / {userProfile.lostBets} lost
                  </StatHelpText>
                </Stat>
              </GridItem>
              <GridItem>
                <Stat px={4} py={5} shadow="xl" borderRadius="lg" bg="white">
                  <StatLabel fontWeight="medium">
                    <HStack spacing={2}>
                      <Icon as={FaExchangeAlt} color="brand.500" />
                      <Text>Profit/Loss</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="3xl" color={userProfile.balance > 0 ? 'green.500' : 'red.500'}>
                    {userProfile.balance > 0 ? '+' : ''}{userProfile.balance.toFixed(2)} UCMDX
                  </StatNumber>
                </Stat>
              </GridItem>
            </Grid>

            <Tabs variant="soft-rounded" colorScheme="brand">
              <TabList bg="white" p={2} borderRadius="lg" boxShadow="sm">
                <Tab>Betting History</Tab>
                <Tab>Notification Settings</Tab>
              </TabList>

              <TabPanels mt={4}>
                <TabPanel>
                  <VStack spacing={4} align="stretch" bg="white" p={6} borderRadius="lg" boxShadow="md">
                    <Heading size="lg" color="brand.500">Betting History</Heading>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Market ID</Th>
                          <Th>Amount</Th>
                          <Th>Odds</Th>
                          <Th>Position</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {bets.map((bet) => (
                          <Tr key={bet.id}>
                            <Td>{bet.market_id}</Td>
                            <Td>{parseInt(bet.amount) / 1000000} UCMDX</Td>
                            <Td>{bet.odds}</Td>
                            <Td>{bet.position}</Td>
                            <Td>
                              <Badge colorScheme={bet.redeemed ? 'green' : 'yellow'}>
                                {bet.redeemed ? 'Redeemed' : 'Active'}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack spacing={4} align="stretch" bg="white" p={6} borderRadius="lg" boxShadow="md">
                    <Heading size="lg" color="brand.500">Notification Settings</Heading>
                    <HStack justifyContent="space-between">
                      <Text>Email Notifications</Text>
                      <Switch isChecked={notificationSettings.email} onChange={() => handleNotificationToggle('email')} colorScheme="brand" />
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text>Push Notifications</Text>
                      <Switch isChecked={notificationSettings.push} onChange={() => handleNotificationToggle('push')} colorScheme="brand" />
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text>SMS Notifications</Text>
                      <Switch isChecked={notificationSettings.sms} onChange={() => handleNotificationToggle('sms')} colorScheme="brand" />
                    </HStack>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Container>
      </Box>

      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack width="100%">
                <Text fontWeight="bold" width="100px">Name:</Text>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </HStack>
              <HStack width="100%">
                <Text fontWeight="bold" width="100px">Wallet:</Text>
                <Text>{userProfile.walletAddress}</Text>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" mr={3} onClick={handleEditName}>
              Save Changes
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
};

export default UserProfilePage;