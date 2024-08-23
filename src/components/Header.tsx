'use client';

import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Collapse,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  InputGroup,
  Input,
  InputRightElement,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon, SearchIcon, HamburgerIcon, CopyIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '../contexts/Web3Context'; // Import the Web3Context hook

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export default function Header() {
  const { isOpen, onToggle } = useDisclosure();
  const { isWalletConnected, walletAddress, connectWallet, disconnectWallet } = useWeb3(); // Use the Web3Context
  const toast = useToast();

  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address copied",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
        backdropFilter="blur(10px)"
        bg={bgColor}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={borderColor}
        boxShadow="sm"
      >
        <Flex
          color={textColor}
          minH={'60px'}
          py={{ base: 2 }}
          px={{ base: 4 }}
          align={'center'}
          maxW="container.xl"
          mx="auto"
        >
          <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }} align="center">
            <MotionFlex
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Text
                textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                fontFamily={'heading'}
                fontWeight="bold"
                fontSize="xl"
                bgGradient="linear(to-r, blue.400, purple.500)"
                bgClip="text"
              >
                PredictX
              </Text>
            </MotionFlex>

            <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
              <DesktopNav />
            </Flex>
          </Flex>

          <Stack
            flex={{ base: 1, md: 0 }}
            justify={'flex-end'}
            direction={'row'}
            spacing={6}
            align="center"
          >
            <InputGroup size="md" width="300px" display={{ base: 'none', md: 'flex' }}>
              <Input
                pr="4.5rem"
                type="text"
                placeholder="Search markets"
                bg={useColorModeValue('white', 'gray.700')}
                _hover={{ bg: useColorModeValue('gray.50', 'gray.600') }}
                borderRadius="full"
              />
              <InputRightElement width="4.5rem">
                <IconButton
                  h="1.75rem"
                  size="sm"
                  onClick={() => console.log('Searching...')}
                  icon={<SearchIcon />}
                  variant="ghost"
                  colorScheme="blue"
                  aria-label="Search markets"
                />
              </InputRightElement>
            </InputGroup>

            <AnimatePresence>
              {isWalletConnected ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded={'full'}
                    variant={'link'}
                    cursor={'pointer'}
                    minW={0}
                  >
                    <Avatar size={'sm'} src={'https://avatars.dicebear.com/api/male/username.svg'} />
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={copyAddress}>
                      <Flex align="center" justify="space-between" width="100%">
                        <Text isTruncated maxW="150px">{walletAddress}</Text>
                        <CopyIcon ml={2} />
                      </Flex>
                    </MenuItem>
                    <Link href="/profile" passHref legacyBehavior>
                      <MenuItem as="a">Profile</MenuItem>
                    </Link>
                    <Link href="/my-bets" passHref legacyBehavior>
                      <MenuItem as="a">My Bets</MenuItem>
                    </Link>
                    <MenuItem onClick={disconnectWallet}>Disconnect</MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <MotionBox
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    onClick={connectWallet}
                    colorScheme="blue"
                    bg="blue.400"
                    _hover={{ bg: 'blue.500' }}
                    size="md"
                    fontWeight="bold"
                    borderRadius="full"
                  >
                    Connect Keplr
                  </Button>
                </MotionBox>
              )}
            </AnimatePresence>
          </Stack>
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <MobileNav />
        </Collapse>
      </Box>
      <Box height="60px" />
    </MotionBox>
  );
}

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link href={navItem.href ?? '#'} passHref legacyBehavior>
                <Button as="a" p={2} fontSize={'sm'} fontWeight={500} color={linkColor} variant="ghost"
                  _hover={{
                    textDecoration: 'none',
                    color: linkHoverColor,
                  }}>
                  {navItem.label}
                </Button>
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Link href={href ?? '#'} passHref legacyBehavior>
      <Button as="a" role={'group'} display={'block'} p={2} rounded={'md'} variant="ghost"
        _hover={{ bg: useColorModeValue('blue.50', 'gray.900') }}>
        <Stack direction={'row'} align={'center'}>
          <Box>
            <Text
              transition={'all .3s ease'}
              _groupHover={{ color: 'blue.400' }}
              fontWeight={500}
            >
              {label}
            </Text>
            <Text fontSize={'sm'}>{subLabel}</Text>
          </Box>
          <Flex
            transition={'all .3s ease'}
            transform={'translateX(-10px)'}
            opacity={0}
            _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
            justify={'flex-end'}
            align={'center'}
            flex={1}
          >
            <Icon color={'blue.400'} w={5} h={5} as={ChevronRightIcon} />
          </Flex>
        </Stack>
      </Button>
    </Link>
  );
};

const MobileNav = () => {
  return (
    <Stack bg={useColorModeValue('white', 'gray.800')} p={4} display={{ md: 'none' }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Link href={href ?? '#'} passHref legacyBehavior>
        <Button as="a" py={2} justifyContent="space-between" alignItems="center" variant="ghost"
          _hover={{
            textDecoration: 'none',
          }}
          onClick={(e) => children && e.preventDefault()}
        >
          <Text fontWeight={600} color={useColorModeValue('gray.600', 'gray.200')}>
            {label}
          </Text>
          {children && (
            <Icon
              as={ChevronDownIcon}
              transition={'all .25s ease-in-out'}
              transform={isOpen ? 'rotate(180deg)' : ''}
              w={6}
              h={6}
            />
          )}
        </Button>
      </Link>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link key={child.label} href={child.href ?? '#'} passHref legacyBehavior>
                <Button as="a" py={2} variant="ghost">
                  {child.label}
                </Button>
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Markets',
    href: '/markets',
  },
  {
    label: 'Create Market',
    href: '/create-market',
  },
  {
    label: 'My Bets',
    href: '/my-bets',
  },
];