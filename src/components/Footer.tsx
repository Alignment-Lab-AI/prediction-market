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
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaTwitter, FaFacebook, FaLinkedin, FaGithub } from 'react-icons/fa';
import { EmailIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const ListHeader = ({ children }) => {
  const headerColor = useColorModeValue('gray.700', 'gray.200');
  return (
    <Text fontWeight={'600'} fontSize={'lg'} mb={2} color={headerColor}>
      {children}
    </Text>
  );
};

const FooterLink = ({ children, href }) => {
  const linkHoverColor = useColorModeValue('blue.500', 'blue.200');
  return (
    <Box as="a" href={href} _hover={{ color: linkHoverColor }}>
      <Text fontSize="sm" fontWeight="medium">
        {children}
      </Text>
    </Box>
  );
};

export default function Footer() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconBgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const inputBgColor = useColorModeValue('white', 'gray.800');
  const inputBorderColor = useColorModeValue('gray.300', 'gray.700');
  const inputFocusBgColor = 'whiteAlpha.300';
  const inputFocusBorderColor = useColorModeValue('blue.500', 'blue.200');
  const subscribeButtonBgColor = useColorModeValue('blue.400', 'blue.800');
  const subscribeButtonHoverBgColor = useColorModeValue('blue.500', 'blue.600');
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const iconHoverBgColor = useColorModeValue('gray.200', 'gray.600');
  const iconHoverColor = useColorModeValue('gray.800', 'white');

  const socialIcons = [FaTwitter, FaFacebook, FaLinkedin, FaGithub];

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      bg={bgColor}
      color={textColor}
      borderTop={1}
      borderStyle={'solid'}
      borderColor={borderColor}
    >
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack align={'flex-start'}>
            <ListHeader>PredictX</ListHeader>
            <FooterLink href={'#'}>About Us</FooterLink>
            <FooterLink href={'#'}>Blog</FooterLink>
            <FooterLink href={'#'}>Careers</FooterLink>
            <FooterLink href={'#'}>Contact Us</FooterLink>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Support</ListHeader>
            <FooterLink href={'#'}>Help Center</FooterLink>
            <FooterLink href={'#'}>Safety Center</FooterLink>
            <FooterLink href={'#'}>Community Guidelines</FooterLink>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Legal</ListHeader>
            <FooterLink href={'#'}>Terms of Service</FooterLink>
            <FooterLink href={'#'}>Privacy Policy</FooterLink>
            <FooterLink href={'#'}>Cookie Policy</FooterLink>
            <FooterLink href={'#'}>FAQ</FooterLink>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Stay Connected</ListHeader>
            <Stack direction={'row'}>
              <Input
                placeholder={'Your email address'}
                bg={inputBgColor}
                border={1}
                borderColor={inputBorderColor}
                _focus={{
                  bg: inputFocusBgColor,
                  borderColor: inputFocusBorderColor,
                }}
                borderRadius="full"
              />
              <IconButton
                bg={subscribeButtonBgColor}
                color={'white'}
                _hover={{
                  bg: subscribeButtonHoverBgColor,
                }}
                aria-label="Subscribe"
                icon={<EmailIcon />}
                borderRadius="full"
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
          <Text fontSize="sm">© 2024 PredictX. All rights reserved</Text>
          <Stack direction={'row'} spacing={6}>
            {socialIcons.map((icon, index) => (
              <MotionBox
                key={index}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconButton
                  aria-label={icon.name}
                  icon={<Box as={icon} />}
                  size="sm"
                  bg={iconBgColor}
                  color={iconColor}
                  _hover={{
                    bg: iconHoverBgColor,
                    color: iconHoverColor,
                  }}
                  borderRadius="full"
                />
              </MotionBox>
            ))}
          </Stack>
        </Container>
      </Box>
    </MotionBox>
  );
}