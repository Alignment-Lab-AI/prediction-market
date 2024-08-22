// src/app/home/components/Stats.tsx
'use client';

import React from 'react';
import { SimpleGrid, Box, Text, VStack, Icon, useColorModeValue } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { FaChartLine, FaCoins, FaUsers, FaTrophy } from 'react-icons/fa';
import { useGlobalContext } from '../../../contexts/GlobalContext';

const MotionBox = motion(Box);
const MotionText = motion(Text);

const AnimatedNumber = ({ value, duration = 2 }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    if (value === undefined || value === null) return;

    let start = 0;
    const end = parseInt(value.toString().replace(/[^\d.]/g, ''));
    if (isNaN(end)) return;

    const timer = setInterval(() => {
      start += end / duration;
      setDisplayValue(Math.floor(start));
      if (start >= end) clearInterval(timer);
    }, 50);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const StatCard = ({ icon, label, value, color }) => {
  const controls = useAnimation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const shadowColor = useColorModeValue(`${color}.100`, `${color}.900`);

  React.useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  return (
    <MotionBox
      whileHover={{ 
        y: -10, 
        boxShadow: `0 20px 30px -10px ${shadowColor}`,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      transition={{ duration: 0.5 }}
    >
      <VStack
        spacing={6}
        p={8}
        bg={bgColor}
        borderRadius="2xl"
        boxShadow="xl"
        align="center"
        h="100%"
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '2xl',
          padding: '2px',
          background: `linear-gradient(135deg, ${color}, transparent)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      >
        <Icon as={icon} fontSize="4xl" color={color} />
        <MotionText
          fontWeight="bold"
          fontSize="4xl"
          bgGradient={`linear(to-r, ${color}, ${color})`}
          bgClip="text"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {value !== undefined && value !== null ? <AnimatedNumber value={value} /> : 'N/A'}
        </MotionText>
        <MotionText
          color="gray.600"
          fontWeight="medium"
          fontSize="lg"
          textAlign="center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {label}
        </MotionText>
      </VStack>
    </MotionBox>
  );
};

export default function Stats() {
  const { markets } = useGlobalContext();

  const totalMarkets = markets.length;
  const totalVolume = markets.reduce((sum, market) =>
    sum + parseInt(market.collateral_amount), 0);

  return (
    <Box py={20}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
        <StatCard
          icon={FaChartLine}
          label="Total Markets"
          value={totalMarkets}
          color="blue.500"
        />
        <StatCard
          icon={FaCoins}
          label={`Total Volume`}
          value={(totalVolume / 1000000).toFixed(2)}
          color="yellow.500"
        />
        <StatCard
          icon={FaUsers}
          label="Active Users"
          value={1234}
          color="green.500"
        />
        <StatCard
          icon={FaTrophy}
          label="Total Rewards"
          value={(totalVolume / 20000000).toFixed(2)}
          color="purple.500"
        />
      </SimpleGrid>
    </Box>
  );
}