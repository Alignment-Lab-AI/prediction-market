// src/app/home/components/WhyUs.tsx
'use client';

import React from 'react';
import { Box, Heading, SimpleGrid, VStack, Text, Icon, useColorModeValue, Container } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { FaBrain, FaFireAlt, FaLightbulb } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, index }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const iconColor = useColorModeValue('blue.500', 'blue.300');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <MotionBox
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        y: -10, 
        boxShadow: '0 20px 30px -10px rgba(66, 153, 225, 0.3)',
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
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
          background: 'linear-gradient(135deg, #3182ce, #805ad5)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      >
        <MotionBox
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
        >
          <Icon as={icon} fontSize={{ base: "4xl", md: "5xl" }} color={iconColor} />
        </MotionBox>
        <MotionText
          fontWeight="bold"
          fontSize={{ base: "xl", md: "2xl" }}
          textAlign="center"
          bgGradient="linear(to-r, blue.400, purple.500)"
          bgClip="text"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
        >
          {title}
        </MotionText>
        <MotionText
          textAlign="center"
          color={textColor}
          fontSize={{ base: "md", md: "lg" }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
        >
          {description}
        </MotionText>
      </VStack>
    </MotionBox>
  );
};

export default function WhyUs() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <Box py={{ base: 10, md: 20 }}>
      <Container maxW="container.xl">
        <MotionHeading
          ref={ref}
          as="h2"
          fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
          mb={{ base: 8, md: 16 }}
          textAlign="center"
          bgGradient="linear(to-r, blue.400, purple.500, pink.500)"
          bgClip="text"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Why Your Opinion Shapes the Future
        </MotionHeading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 8, md: 12 }}>
          <FeatureCard 
            icon={FaBrain}
            title="Collective Intelligence"
            description="Your predictions contribute to a powerful swarm intelligence, shaping global outcomes."
            index={0}
          />
          <FeatureCard 
            icon={FaFireAlt}
            title="Earn Real Rewards"
            description="Convert your foresight into tangible cryptocurrency rewards. The more accurate, the more you earn."
            index={1}
          />
          <FeatureCard 
            icon={FaLightbulb}
            title="Influence Reality"
            description="Your insights don't just predict the future—they help create it. Be a part of shaping tomorrow."
            index={2}
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
}