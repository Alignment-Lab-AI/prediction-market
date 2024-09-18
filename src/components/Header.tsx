'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Collapse,
  useColorModeValue,
  useDisclosure,
  Container,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Input,
  useToast,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, SearchIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { motion } from 'framer-motion';
import { useWeb3 } from '../contexts/Web3Context';

const MotionBox = motion(Box);

export default function Header() {
  const { isOpen: isMobileMenuOpen, onToggle: toggleMobileMenu, onClose: closeMobileMenu } = useDisclosure();
  const { isWalletConnected, walletAddress, connectWallet, disconnectWallet } = useWeb3();
  const toast = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMobileMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeMobileMenu]);

  const bgColor = useColorModeValue(
    scrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
    scrolled ? 'rgba(26, 32, 44, 0.8)' : 'transparent'
  );
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
    <>
      <Box height="76px" /> {/* Placeholder to reserve space for the header */}
      <MotionBox
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
        transition="background-color 0.3s ease-in-out"
        bg={bgColor}
        backdropFilter={scrolled ? "blur(10px)" : "none"}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Container maxW="container.xl">
          <Flex
            color={textColor}
            minH={'60px'}
            py={{ base: 2 }}
            px={{ base: 4 }}
            align={'center'}
            justify={'space-between'}
          >
            <Flex align="center">
              <NextLink href="/" passHref>
                <Text
                  as="span"
                  fontFamily={'heading'}
                  fontWeight="bold"
                  fontSize="2xl"
                  bgGradient="linear(to-r, blue.400, purple.500)"
                  bgClip="text"
                  _hover={{
                    bgGradient: "linear(to-r, blue.500, purple.600)",
                  }}
                  transition="all 0.3s ease-in-out"
                  cursor="pointer"
                >
                  PredictX
                </Text>
              </NextLink>
            </Flex>

            <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
              <DesktopNav />
            </Flex>

            <Stack
              flex={{ base: 1, md: 0 }}
              justify={'flex-end'}
              direction={'row'}
              spacing={6}
              align="center"
            >
              {isSearchOpen ? (
                <Input
                  placeholder="Search markets"
                  size="sm"
                  width={{ base: '100%', md: '200px' }}
                  borderRadius="full"
                  mr={2}
                />
              ) : (
                <IconButton
                  aria-label="Search"
                  icon={<SearchIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsSearchOpen(true)}
                  display={{ base: 'none', md: 'flex' }}
                />
              )}
              {isWalletConnected ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded={'full'}
                    variant={'link'}
                    cursor={'pointer'}
                    minW={0}
                  >
                    <Avatar size={'sm'} src={'https://bit.ly/broken-link'} />
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={copyAddress}>
                      <Text isTruncated maxW="150px">{walletAddress}</Text>
                    </MenuItem>
                    <NextLink href="/profile" passHref>
                      <MenuItem as="span">Profile</MenuItem>
                    </NextLink>
                    <NextLink href="/my-bets" passHref>
                      <MenuItem as="span">My Bets</MenuItem>
                    </NextLink>
                    <MenuItem onClick={disconnectWallet}>Disconnect</MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Button
                  onClick={connectWallet}
                  bgGradient="linear(to-r, blue.400, purple.500)"
                  color="white"
                  _hover={{
                    bgGradient: "linear(to-r, blue.500, purple.600)",
                  }}
                  size="sm"
                  fontWeight="bold"
                  borderRadius="full"
                >
                  Connect Keplr
                </Button>
              )}

              <IconButton
                onClick={toggleMobileMenu}
                icon={isMobileMenuOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
                variant={'ghost'}
                aria-label={'Toggle Navigation'}
                display={{ base: 'flex', md: 'none' }}
              />
            </Stack>
          </Flex>
        </Container>
      </MotionBox>

      <Drawer isOpen={isMobileMenuOpen} placement="right" onClose={closeMobileMenu} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={8}>
              <Input
                placeholder="Search markets"
                size="lg"
                borderRadius="full"
                mb={4}
              />
              {NAV_ITEMS.map((navItem) => (
                <NextLink key={navItem.label} href={navItem.href ?? '#'} passHref>
                  <Button
                    as="a"
                    variant="ghost"
                    size="lg"
                    justifyContent="flex-start"
                    onClick={closeMobileMenu}
                  >
                    {navItem.label}
                  </Button>
                </NextLink>
              ))}
              {isWalletConnected ? (
                <VStack align="stretch" spacing={4}>
                  <Text fontWeight="bold">Wallet</Text>
                  <Button onClick={copyAddress} variant="outline">
                    <Text isTruncated maxW="200px">{walletAddress}</Text>
                  </Button>
                  <NextLink href="/profile" passHref>
                    <Button as="a" variant="ghost" onClick={closeMobileMenu}>Profile</Button>
                  </NextLink>
                  <NextLink href="/my-bets" passHref>
                    <Button as="a" variant="ghost" onClick={closeMobileMenu}>My Bets</Button>
                  </NextLink>
                  <Button onClick={disconnectWallet} colorScheme="red">Disconnect</Button>
                </VStack>
              ) : (
                <Button
                  onClick={() => {
                    connectWallet();
                    closeMobileMenu();
                  }}
                  bgGradient="linear(to-r, blue.400, purple.500)"
                  color="white"
                  _hover={{
                    bgGradient: "linear(to-r, blue.500, purple.600)",
                  }}
                  size="lg"
                  fontWeight="bold"
                  borderRadius="full"
                >
                  Connect Keplr
                </Button>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <NextLink href={navItem.href ?? '#'} passHref>
            <Button
              as="span"
              p={2}
              fontSize={'sm'}
              fontWeight={500}
              color={linkColor}
              variant="ghost"
              _hover={{
                textDecoration: 'none',
                color: linkHoverColor,
              }}
            >
              {navItem.label}
            </Button>
          </NextLink>
        </Box>
      ))}
    </Stack>
  );
};

interface NavItem {
  label: string;
  href?: string;
}

const NAV_ITEMS: Array<NavItem> = [
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
  {
    label: 'Resolve Market',
    href: '/resolve-market',
  },
];