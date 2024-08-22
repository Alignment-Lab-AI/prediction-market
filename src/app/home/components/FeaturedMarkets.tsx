// src/app/home/components/FeaturedMarkets.tsx
'use client';

import React from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Flex,
  useToken,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { FaGlobe, FaClock, FaCoins, FaRocket } from 'react-icons/fa';
import { useGlobalContext } from '../../../contexts/GlobalContext';

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);

const StatusDot = ({ isActive }) => (
  <Box position="relative">
    <Box
      w="12px"
      h="12px"
      borderRadius="full"
      bg={isActive ? "green.400" : "red.400"}
      position="absolute"
      top="-6px"
      right="-6px"
      zIndex="2"
    />
    <AnimatePresence>
      {isActive && (
        <MotionBox
          position="absolute"
          top="-6px"
          right="-6px"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 1.5, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          w="12px"
          h="12px"
          borderRadius="full"
          bg="green.400"
          zIndex="1"
        />
      )}
    </AnimatePresence>
  </Box>
);

const MarketCard = ({ market, config }) => {
  const [blue500] = useToken('colors', ['blue.500']);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const controls = useAnimation();
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  return (
    <MotionBox
      whileHover={{ 
        y: -5, 
        boxShadow: `0 20px 30px -10px rgba(66, 153, 225, 0.4)`,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Box
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="2xl"
        overflow="hidden"
        bg={bgColor}
        h="100%"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        position="relative"
        boxShadow="xl"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '2xl',
          padding: '2px',
          background: 'linear-gradient(135deg, #3182ce, #805ad5)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      >
        <Tooltip 
          label={market.status} 
          hasArrow 
          placement="top-start"
          bg={market.status === 'Active' ? 'green.500' : 'red.500'}
        >
          <Box position="absolute" top="4" left="4" zIndex="2">
            <StatusDot isActive={market.status === 'Active'} />
          </Box>
        </Tooltip>
        <VStack align="stretch" p={6} spacing={4}>
          <MotionHeading 
            size="md" 
            noOfLines={2}
            bgGradient="linear(to-r, blue.400, purple.500)"
            bgClip="text"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {market.question}
          </MotionHeading>
          <MotionText 
            fontSize="sm" 
            color="gray.600" 
            noOfLines={2}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {market.description}
          </MotionText>
          <HStack spacing={4} justifyContent="space-between">
            <HStack>
              <Icon as={FaGlobe} color="blue.500" />
              <Text fontSize="xs" color="blue.500" fontWeight="bold">
                {Math.floor(Math.random() * 1000) + 100} participants
              </Text>
            </HStack>
            <HStack>
              <Icon as={FaClock} color="purple.500" />
              <Text fontSize="xs" color="purple.500" fontWeight="bold">
                Ends in {Math.floor(Math.random() * 30) + 1} days
              </Text>
            </HStack>
          </HStack>
        </VStack>
        <Flex justify="space-between" align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')}>
          <HStack>
            <Icon as={FaCoins} color="yellow.500" />
            <Text fontSize="sm" fontWeight="bold">
              {(parseInt(market.collateral_amount) / 1000000).toLocaleString()} {config?.coin_denom}
            </Text>
          </HStack>
          <MotionButton
            as={MotionButton}
            size="sm"
            colorScheme="blue"
            rightIcon={<FaRocket />}
            borderRadius="full"
            fontWeight="bold"
            boxShadow="md"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0px 5px 15px rgba(66, 153, 225, 0.4)',
            }}
            whileTap={{ scale: 0.95 }}
            animate={isHovered ? { y: [-2, 2, -2], transition: { repeat: Infinity, duration: 1 } } : {}}
          >
            Trade Now
          </MotionButton>
        </Flex>
      </Box>
    </MotionBox>
  );
};

export default function FeaturedMarkets() {
  const { markets, config } = useGlobalContext();
  const controls = useAnimation();

  React.useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  if (!markets || markets.length === 0) {
    return (
      <Box>
        <MotionHeading
          as="h2"
          size="2xl"
          mb={10}
          textAlign="center"
          color="gray.800"
          initial={{ opacity: 0, y: -20 }}
          animate={controls}
          transition={{ duration: 0.5 }}
        >
          Featured Markets
        </MotionHeading>
        <MotionText
          textAlign="center"
          color="gray.600"
          initial={{ opacity: 0 }}
          animate={controls}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          No markets available at the moment.
        </MotionText>
      </Box>
    );
  }

  return (
    <Box py={20}>
      <MotionHeading
        as="h2"
        size="2xl"
        mb={10}
        textAlign="center"
        bgGradient="linear(to-r, blue.400, purple.500, pink.500)"
        bgClip="text"
        initial={{ opacity: 0, y: -20 }}
        animate={controls}
        transition={{ duration: 0.5 }}
      >
        Featured Markets
      </MotionHeading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
        {markets.slice(0, 3).map((market, index) => (
          <MotionBox
            key={market.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <MarketCard market={market} config={config} />
          </MotionBox>
        ))}
      </SimpleGrid>
    </Box>
  );
}