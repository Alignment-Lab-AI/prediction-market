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
  useColorModeValue,
  CircularProgress,
  CircularProgressLabel,
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
} from '@chakra-ui/react';
import { FaWallet, FaChartBar, FaHistory, FaBell, FaTrophy, FaExchangeAlt, FaUserShield, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import NextLink from 'next/link';
import { motion } from 'framer-motion';

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
  level: number;
  xp: number;
  nextLevelXp: number;
  avatar: string;
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
    walletAddress: "comdex1nh4gxgzq7hw8fvtkxjg4kpfqmsq65szqxxdqye",
    balance: 0,
    totalBets: 0,
    wonBets: 0,
    lostBets: 0,
    winRate: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    avatar: "https://bit.ly/broken-link",
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

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(26, 32, 44, 0.8)");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = "blue.400";
  const gradientColor = "linear(to-r, blue.400, purple.500)";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const betsResponse = await axios.get<Bet[]>('http://localhost:3001/api/user-bets/comdex1nh4gxgzq7hw8fvtkxjg4kpfqmsq65szqxxdqye');
        setBets(betsResponse.data);

        const totalBets = betsResponse.data.length;
        const wonBets = betsResponse.data.filter(bet => bet.redeemed).length;
        const lostBets = totalBets - wonBets;
        const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
        const balance = betsResponse.data.reduce((acc, bet) => acc + parseInt(bet.amount), 0) / 1000000;

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

  if (isLoading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center" bg={bgColor}>
        <Spinner size="xl" color={accentColor} thickness="4px" />
      </Box>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Box bg={bgColor} minHeight="100vh" py={12}>
        <Container maxW="container.xl">
          <VStack spacing={10} align="stretch">
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Flex 
                direction={{ base: 'column', md: 'row' }} 
                justifyContent="space-between" 
                alignItems="center" 
                bg={cardBgColor}
                backdropFilter="blur(10px)"
                p={8} 
                borderRadius="2xl" 
                boxShadow="xl"
                border="1px solid"
                borderColor={borderColor}
              >
                <HStack spacing={6}>
                  <Avatar size="2xl" name={userProfile.name} src={userProfile.avatar} bg={accentColor}>
                    <AvatarBadge boxSize="1.25em" bg="green.500" />
                  </Avatar>
                  <VStack align="start" spacing={2}>
                    <Heading size="2xl" bgGradient={gradientColor} bgClip="text">{userProfile.name}</Heading>
                    <Text color="gray.500" fontSize="md">Level {userProfile.level} Predictor</Text>
                    <Text color="gray.500" fontSize="sm" fontStyle="italic" isTruncated maxW="300px">
                      {userProfile.walletAddress}
                    </Text>
                    <HStack spacing={4}>
                      <CircularProgress value={(userProfile.xp / userProfile.nextLevelXp) * 100} color={accentColor} size="80px" thickness="8px">
                        <CircularProgressLabel fontWeight="bold">{userProfile.level}</CircularProgressLabel>
                      </CircularProgress>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500">Experience</Text>
                        <Text fontSize="lg" fontWeight="bold" color={textColor}>
                          {userProfile.xp}/{userProfile.nextLevelXp} XP
                        </Text>
                        <Progress value={(userProfile.xp / userProfile.nextLevelXp) * 100} size="sm" width="150px" colorScheme="blue" borderRadius="full" />
                      </VStack>
                    </HStack>
                  </VStack>
                </HStack>
                <VStack align="end" spacing={4} mt={{ base: 6, md: 0 }}>
                  <Button 
                    leftIcon={<Icon as={FaEdit} />} 
                    onClick={onOpen} 
                    bgGradient={gradientColor}
                    color="white"
                    _hover={{
                      bgGradient: "linear(to-r, blue.500, purple.600)",
                    }}
                    size="lg" 
                    borderRadius="full"
                  >
                    Edit Profile
                  </Button>
                  <NextLink href="/admin-dashboard" passHref>
                    <Button 
                      as="a" 
                      leftIcon={<Icon as={FaUserShield} />} 
                      colorScheme="purple" 
                      size="lg" 
                      borderRadius="full"
                    >
                      Admin Dashboard
                    </Button>
                  </NextLink>
                </VStack>
              </Flex>
            </MotionBox>

            <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={8}>
              {[
                { label: 'Wallet Balance', icon: FaWallet, value: `${userProfile.balance.toFixed(2)} UCMDX`, color: 'blue.400' },
                { label: 'Total Bets', icon: FaChartBar, value: userProfile.totalBets, color: 'purple.500' },
                { label: 'Win Rate', icon: FaTrophy, value: `${userProfile.winRate.toFixed(2)}%`, color: 'yellow.400', helpText: `${userProfile.wonBets} won / ${userProfile.lostBets} lost` },
                { label: 'Profit/Loss', icon: FaExchangeAlt, value: `${userProfile.balance > 0 ? '+' : ''}${userProfile.balance.toFixed(2)} UCMDX`, color: userProfile.balance > 0 ? 'green.400' : 'red.400' },
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
                    backdropFilter="blur(10px)"
                    borderRadius="2xl" 
                    boxShadow="xl"
                    border="1px solid"
                    borderColor={borderColor}
                    height="200px"
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
                    {stat.helpText && (<StatHelpText mt={2}>
                        <StatArrow type={userProfile.winRate > 50 ? 'increase' : 'decrease'} />
                        {stat.helpText}
                      </StatHelpText>
                    )}
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
                >
                  <Tab fontSize="lg" fontWeight="medium" _selected={{ color: 'white', bg: accentColor }}>Betting History</Tab>
                  <Tab fontSize="lg" fontWeight="medium" _selected={{ color: 'white', bg: accentColor }}>Notification Settings</Tab>
                </TabList>

                <TabPanels mt={6}>
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
                      <Heading size="lg" bgGradient={gradientColor} bgClip="text" mb={6}>Betting History</Heading>
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
                              <Td>{(parseInt(bet.amount) / 1000000).toFixed(2)} UCMDX</Td>
                              <Td>{bet.odds}</Td>
                              <Td>{bet.position}</Td>
                              <Td>
                                <Badge 
                                  colorScheme={bet.redeemed ? 'green' : 'yellow'} 
                                  borderRadius="full" 
                                  px={3} 
                                  py={1}
                                  textTransform="capitalize"
                                >
                                  {bet.redeemed ? 'Redeemed' : 'Active'}
                                </Badge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
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
                              <Text fontSize="lg" fontWeight="medium">{type.charAt(0).toUpperCase() + type.slice(1)} Notifications</Text>
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