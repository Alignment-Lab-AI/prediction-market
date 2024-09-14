'use client';

import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { motion } from 'framer-motion';
import { useWeb3 } from '../contexts/Web3Context';

const MotionBox = motion(Box);

export default function Header() {
  const { isOpen, onToggle } = useDisclosure();
  const { isWalletConnected, walletAddress, connectWallet, disconnectWallet } = useWeb3();
  const toast = useToast();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            py={{ base: 4 }}
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
              <Input
                placeholder="Search markets"
                size="sm"
                width={{ base: '100%', md: '200px' }}
                borderRadius="full"
                display={{ base: 'none', md: 'block' }}
              />
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
                onClick={onToggle}
                icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
                variant={'ghost'}
                aria-label={'Toggle Navigation'}
                display={{ base: 'flex', md: 'none' }}
              />
            </Stack>
          </Flex>

          <Collapse in={isOpen} animateOpacity>
            <MobileNav />
          </Collapse>
        </Container>
      </MotionBox>
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

const MobileNav = () => {
  return (
    <Stack bg={useColorModeValue('white', 'gray.800')} p={4} display={{ md: 'none' }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, href }: NavItem) => {
  return (
    <Stack spacing={4}>
      <NextLink href={href ?? '#'} passHref>
        <Flex
          py={2}
          as="span"
          justify={'space-between'}
          align={'center'}
          _hover={{
            textDecoration: 'none',
          }}
        >
          <Text fontWeight={600} color={useColorModeValue('gray.600', 'gray.200')}>
            {label}
          </Text>
        </Flex>
      </NextLink>
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