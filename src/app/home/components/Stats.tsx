// src/app/home/components/Stats.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { SimpleGrid, Box, Text, VStack, Icon, useColorModeValue, Spinner, Heading, Container } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { FaChartLine, FaCoins, FaUsers, FaTrophy } from 'react-icons/fa';
import axios from 'axios';
import { encodeQuery } from '../../../utils/queryUtils';

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
        spacing={{ base: 4, md: 6 }}
        p={{ base: 6, md: 8 }}
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
        <Icon as={icon} fontSize={{ base: "3xl", md: "4xl" }} color={color} />
        <MotionText
          fontWeight="bold"
          fontSize={{ base: "3xl", md: "4xl" }}
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
          fontSize={{ base: "md", md: "lg" }}
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
  const [stats, setStats] = useState({
    totalMarkets: 0,
    totalVolume: 0,
    activeUsers: 0,
    totalRewards: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
        const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

        const query = {
          markets: {
            status: "Active",
            start_after: 0,
            limit: 100 // Adjust this number as needed
          }
        };
        const encodedQuery = encodeQuery(query);

        const response = await axios.get(
          `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
        );

        const markets = response.data.data;
        const totalMarkets = markets.length;
        const totalVolume = markets.reduce((sum, market) => sum + parseInt(market.resolution_bond), 0);
        
        // Note: Active users and total rewards might need to be calculated differently
        // depending on your contract's structure. These are placeholder calculations.
        const activeUsers = new Set(markets.map(market => market.creator)).size;
        const totalRewards = markets.reduce((sum, market) => sum + parseInt(market.resolution_reward), 0);

        setStats({
          totalMarkets,
          totalVolume,
          activeUsers,
          totalRewards,
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box py={{ base: 10, md: 20 }}>
      <Container maxW="container.xl">
        <Heading 
          as="h2" 
          fontSize={{ base: "3xl", md: "4xl" }}
          textAlign="center"
          mb={{ base: 8, md: 12 }}
          bgGradient="linear(to-r, blue.400, purple.500)"
          bgClip="text"
          fontWeight="extrabold"
        >
          Platform Statistics
        </Heading>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <Spinner size="xl" color="blue.500" thickness="4px" />
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={{ base: 6, md: 10 }}>
            <StatCard
              icon={FaChartLine}
              label="Total Markets"
              value={stats.totalMarkets}
              color="blue.500"
            />
            <StatCard
              icon={FaCoins}
              label={`Total Volume`}
              value={(stats.totalVolume / 1000000).toFixed(2)}
              color="yellow.500"
            />
            <StatCard
              icon={FaUsers}
              label="Active Users"
              value={stats.activeUsers}
              color="green.500"
            />
            <StatCard
              icon={FaTrophy}
              label="Total Rewards"
              value={(stats.totalRewards / 1000000).toFixed(2)}
              color="purple.500"
            />
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}