'use client';

import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon, SearchIcon, HamburgerIcon } from '@chakra-ui/icons';
import Link from 'next/link';

// Mock function for wallet connection (replace with actual implementation)
const connectWallet = () => console.log('Connecting wallet...');

// Mock function to check if user is whitelisted (replace with actual implementation)
const isUserWhitelisted = () => true;

export default function Header() {
  const { isOpen, onToggle } = useDisclosure();
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={<HamburgerIcon w={5} h={5} />}
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            color={useColorModeValue('gray.800', 'white')}
            fontWeight="bold"
          >
            Prediction Market
          </Text>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >
          <InputGroup size="md" width="300px">
            <Input
              pr="4.5rem"
              type="text"
              placeholder="Search markets"
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={() => console.log('Searching...')}>
                <SearchIcon />
              </Button>
            </InputRightElement>
          </InputGroup>

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
                <Link href="/profile" passHref legacyBehavior>
                  <MenuItem as="a">Profile</MenuItem>
                </Link>
                <Link href="/my-bets" passHref legacyBehavior>
                  <MenuItem as="a">My Bets</MenuItem>
                </Link>
                <MenuItem onClick={() => setIsWalletConnected(false)}>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button
              onClick={() => {
                connectWallet();
                setIsWalletConnected(true);
              }}
              colorScheme="blue"
            >
              Connect Wallet
            </Button>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
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
        _hover={{ bg: useColorModeValue('pink.50', 'gray.900') }}>
        <Stack direction={'row'} align={'center'}>
          <Box>
            <Text
              transition={'all .3s ease'}
              _groupHover={{ color: 'pink.400' }}
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
            <Icon color={'pink.400'} w={5} h={5} as={ChevronRightIcon} />
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