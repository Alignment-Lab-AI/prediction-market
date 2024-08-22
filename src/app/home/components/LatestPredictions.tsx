// // src/app/home/components/LatestPredictions.tsx
// 'use client';

// import React from 'react';
// import { Box, Container, Heading, SimpleGrid, Text, HStack, Badge } from '@chakra-ui/react';
// import { motion } from 'framer-motion';

// const MotionBox = motion(Box);

// export default function LatestPredictions() {
//   return (
//     <Box bg="white" py={20}>
//       <Container maxW="container.xl">
//         <Heading as="h2" size="2xl" mb={10} textAlign="center" color="gray.800">
//           Latest Predictions
//         </Heading>
//         <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
//           {[1, 2, 3, 4].map((_, index) => (
//             <MotionBox
//               key={index}
//               whileHover={{ y: -5, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
//               transition={{ duration: 0.2 }}
//             >
//               <Box
//                 p={6}
//                 borderRadius="xl"
//                 boxShadow="md"
//                 bg="gray.50"
//                 position="relative"
//                 overflow="hidden"
//               >
//                 <Box
//                   position="absolute"
//                   top="-20px"
//                   left="-20px"
//                   w="100px"
//                   h="100px"
//                   bg="blue.50"
//                   borderRadius="full"
//                   opacity="0.5"
//                 />
//                 <Text fontWeight="bold" mb={2}>User{index + 1}</Text>
//                 <Text fontSize="sm" color="gray.600" mb={4}>
//                   Predicted: "Bitcoin will reach $100k by end of 2024"
//                 </Text>
//                 <HStack justify="space-between">
//                   <Badge colorScheme="green">90% Confidence</Badge>
//                   <Text fontSize="xs" color="gray.500">2 hours ago</Text>
//                 </HStack>
//               </Box>
//             </MotionBox>
//           ))}
//         </SimpleGrid>
//       </Container>
//     </Box>
//   );
// }