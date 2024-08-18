'use client';

import React from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Input,
  IconButton,
  Button,
  VStack,
  HStack,
  Heading,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaTwitter, FaFacebook, FaLinkedin, FaGithub } from 'react-icons/fa';
import { EmailIcon } from '@chakra-ui/icons';

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

export default function Footer() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={bgColor}
      color={useColorModeValue('gray.700', 'gray.200')}
      borderTop={1}
      borderStyle={'solid'}
      borderColor={borderColor}
    >
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack align={'flex-start'}>
            <ListHeader>Company</ListHeader>
            <Box as="a" href={'#'}>
              About Us
            </Box>
            <Box as="a" href={'#'}>
              Blog
            </Box>
            <Box as="a" href={'#'}>
              Careers
            </Box>
            <Box as="a" href={'#'}>
              Contact Us
            </Box>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Support</ListHeader>
            <Box as="a" href={'#'}>
              Help Center
            </Box>
            <Box as="a" href={'#'}>
              Safety Center
            </Box>
            <Box as="a" href={'#'}>
              Community Guidelines
            </Box>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Legal</ListHeader>
            <Box as="a" href={'#'}>
              Terms of Service
            </Box>
            <Box as="a" href={'#'}>
              Privacy Policy
            </Box>
            <Box as="a" href={'#'}>
              Cookie Policy
            </Box>
            <Box as="a" href={'#'}>
              FAQ
            </Box>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Stay up to date</ListHeader>
            <Stack direction={'row'}>
              <Input
                placeholder={'Your email address'}
                bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
                border={0}
                _focus={{
                  bg: 'whiteAlpha.300',
                }}
              />
              <IconButton
                bg={useColorModeValue('blue.400', 'blue.800')}
                color={useColorModeValue('white', 'gray.800')}
                _hover={{
                  bg: 'blue.600',
                }}
                aria-label="Subscribe"
                icon={<EmailIcon />}
              />
            </Stack>
          </Stack>
        </SimpleGrid>
      </Container>

      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor={borderColor}
      >
        <Container
          as={Stack}
          maxW={'6xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ md: 'space-between' }}
          align={{ md: 'center' }}
        >
          <Text>© 2023 Prediction Market. All rights reserved</Text>
          <Stack direction={'row'} spacing={6}>
            <IconButton aria-label="Twitter" icon={<FaTwitter />} size="sm" />
            <IconButton aria-label="Facebook" icon={<FaFacebook />} size="sm" />
            <IconButton aria-label="LinkedIn" icon={<FaLinkedin />} size="sm" />
            <IconButton aria-label="GitHub" icon={<FaGithub />} size="sm" />
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}