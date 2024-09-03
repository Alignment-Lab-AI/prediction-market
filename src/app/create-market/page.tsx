'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  useToast,
  IconButton,
  Flex,
  Tooltip,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Badge,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Select,
} from '@chakra-ui/react';
import axios from 'axios';
import { AddIcon, DeleteIcon, ChevronRightIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FiHelpCircle, FiList, FiCalendar, FiDollarSign, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { SingleDatepicker } from 'chakra-dayzed-datepicker';
import { useWeb3 } from '../../contexts/Web3Context';
import { broadcastTransaction } from '../../utils/web3';
import { encodeQuery } from '../../utils/queryUtils';

const MotionBox = motion(Box);

interface MarketForm {
  category: string;
  question: string;
  description: string;
  options: { value: string }[];
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
  resolutionBond: number;
  resolutionReward: number;
}

const steps = [
  { title: 'Basic Info', icon: FiHelpCircle },
  { title: 'Options', icon: FiList },
  { title: 'Timing', icon: FiCalendar },
  { title: 'Economics', icon: FiDollarSign },
  { title: 'Review', icon: FiCheckCircle },
];

const categories = ['Sports', 'Politics', 'Entertainment', 'Technology', 'Finance', 'Other'];

const GlassBox = ({ children, ...props }) => {
  const glassColor = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.1)');
  const borderColor = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');
  
  return (
    <Box
      bg={glassColor}
      backdropFilter="blur(10px)"
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
      position="relative"
      overflow="hidden"
      {...props}
    >
      <Box position="relative" zIndex={2}>
        {children}
      </Box>
    </Box>
  );
};

const CreateMarketPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isWalletConnected, walletAddress } = useWeb3();

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<MarketForm>({
    defaultValues: {
      category: 'Sports',
      question: '',
      description: '',
      options: [{ value: '' }, { value: '' }],
      startDate: new Date(),
      startTime: '12:00',
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endTime: '12:00',
      resolutionBond: 100,
      resolutionReward: 5,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options"
  });

  const watchedFields = watch();

  const checkWhitelistStatus = async (address: string): Promise<boolean> => {
    try {
      const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
      const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

      if (!REAL_BASE_URL || !CONTRACT_ADDRESS) {
        throw new Error("REST URL or Contract Address not defined in environment variables");
      }

      const query = {
        is_whitelisted: {
          user: address
        }
      };
      const encodedQuery = encodeQuery(query);

      const response = await axios.get(
        `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
      );

      console.log("Whitelist check response:", response.data);

      return response.data.data === true;
    } catch (error) {
      console.error("Error checking whitelist status:", error);
      return false;
    }
  };

  useEffect(() => {
    const checkWhitelist = async () => {
      if (isWalletConnected && walletAddress) {
        const whitelistStatus = await checkWhitelistStatus(walletAddress);
        setIsWhitelisted(whitelistStatus);
        console.log("Whitelist status:", whitelistStatus);
      }
    };
    checkWhitelist();
  }, [isWalletConnected, walletAddress]);

  const onSubmit = async (data: MarketForm) => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a market.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    setIsSubmitting(true);
    try {
      const startTimestamp = Math.floor(new Date(`${data.startDate.toDateString()} ${data.startTime}`).getTime() / 1000).toString();
      const endTimestamp = Math.floor(new Date(`${data.endDate.toDateString()} ${data.endTime}`).getTime() / 1000).toString();
  
      const resolutionBondUcmdx = BigInt(Math.floor(data.resolutionBond * 1000000));
      const resolutionRewardUcmdx = BigInt(Math.floor(data.resolutionReward * 1000000));
      const totalFundsUcmdx = resolutionRewardUcmdx;
  
      const createMarketMsg = {
        create_market: {
          category: data.category,
          question: data.question,
          description: data.description,
          options: data.options.map(o => o.value),
          start_time: startTimestamp,
          end_time: endTimestamp,
          resolution_bond: resolutionBondUcmdx.toString(),
          resolution_reward: resolutionRewardUcmdx.toString(),
        }
      };
  
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error("Contract address not defined in environment variables");
      }
  
      const funds = [{
        denom: "ucmdx",
        amount: totalFundsUcmdx.toString()
      }];
  
      console.log("Sending transaction with message:", JSON.stringify(createMarketMsg, null, 2));
      console.log("Funds:", JSON.stringify(funds, null, 2));
  
      const result = await broadcastTransaction(
        process.env.NEXT_PUBLIC_CHAIN_ID!,
        contractAddress,
        createMarketMsg,
        funds
      );
  
      console.log("Transaction result:", result);
  
      if (result && result.transactionHash) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast({
          title: "Market created!",
          description: `Your new market has been successfully launched. Transaction hash: ${result.transactionHash}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error("Transaction failed: No transaction hash received");
      }
    } catch (error) {
      console.error("Error creating market:", error);
      toast({
        title: "Error creating market",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.category}>
              <FormLabel fontSize="sm" fontWeight="semibold">Category</FormLabel>
              <Select 
                {...register("category", { required: "Category is required" })}
                bg={inputBgColor}
                borderColor={inputBorderColor}
                _hover={{ borderColor: "blue.400" }}
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                borderRadius="md"
                size="sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
              <FormErrorMessage fontSize="xs">{errors.category?.message}</FormErrorMessage>
            </FormControl>
    
            <FormControl isInvalid={!!errors.question}>
              <FormLabel fontSize="sm" fontWeight="semibold">Question</FormLabel>
              <Input
                {...register("question", { required: "Question is required" })}
                placeholder="e.g., Which team will win the 2024 FIFA World Cup?"
                bg={inputBgColor}
                borderColor={inputBorderColor}
                _hover={{ borderColor: "blue.400" }}
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                borderRadius="md"
                size="sm"
              />
              <FormErrorMessage fontSize="xs">{errors.question?.message}</FormErrorMessage>
              <FormHelperText fontSize="xs">Enter a clear, concise question for your market.</FormHelperText>
            </FormControl>
    
            <FormControl isInvalid={!!errors.description}>
              <FormLabel fontSize="sm" fontWeight="semibold">Description</FormLabel>
              <Textarea 
                {...register("description", { required: "Description is required" })} 
                placeholder="Provide additional context or details about your market question."
                minHeight="100px"
                bg={inputBgColor}
                borderColor={inputBorderColor}
                _hover={{ borderColor: "blue.400" }}
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                borderRadius="md"
                size="sm"
              />
              <FormErrorMessage fontSize="xs">{errors.description?.message}</FormErrorMessage>
              <FormHelperText fontSize="xs">Give participants more information to make informed decisions.</FormHelperText>
            </FormControl>
          </VStack>
        );
      case 1:
        return (
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="semibold">Options</FormLabel>
            <VStack spacing={2} align="stretch">
              {fields.map((field, index) => (
                <Flex key={field.id} mb={2}>
                  <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none" children={<FiList color="gray.400" />} />
                    <Input
                      {...register(`options.${index}.value` as const, { required: "Option is required" })}
                      placeholder={`Option ${index + 1}`}
                      borderRadius="md"
                      pr="4.5rem"
                    />
                    <IconButton
                      aria-label="Remove option"
                      icon={<DeleteIcon />}
                      onClick={() => remove(index)}
                      isDisabled={fields.length <= 2}
                      position="absolute"
                      right="2"
                      top="50%"
                      transform="translateY(-50%)"
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                    />
                  </InputGroup>
                </Flex>
              ))}
            </VStack>
            <Button
              leftIcon={<AddIcon />}
              onClick={() => append({ value: '' })}
              mt={3}
              colorScheme="blue"
              variant="outline"
              size="xs"
              borderRadius="md"
              _hover={{ bg: 'blue.50', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
            >
              Add Option
            </Button>
            <FormHelperText fontSize="xs" mt={2}>Add at least two options for your market. You can add more if needed.</FormHelperText>
          </FormControl>
        );
      case 2:
        return (
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.startDate || !!errors.startTime}>
              <FormLabel fontSize="sm" fontWeight="semibold">Start Time</FormLabel>
              <HStack>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <SingleDatepicker
                      name="start-date"
                      date={field.value}
                      onDateChange={field.onChange}
                    />
                  )}
                />
                <Input
                  type="time"
                  {...register("startTime", { required: "Start time is required" })}
                  size="sm"
                  borderRadius="md"
                />
              </HStack>
              <FormErrorMessage fontSize="xs">{errors.startDate?.message || errors.startTime?.message}</FormErrorMessage>
              <FormHelperText fontSize="xs">Choose when your market will open for predictions.</FormHelperText>
            </FormControl>

            <FormControl isInvalid={!!errors.endDate || !!errors.endTime}>
              <FormLabel fontSize="sm" fontWeight="semibold">End Time</FormLabel>
              <HStack>
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <SingleDatepicker
                    name="end-date"
                    date={field.value}
                    onDateChange={field.onChange}
                    minDate={watchedFields.startDate}
                  />
                )}
              />
              <Input
                type="time"
                {...register("endTime", { required: "End time is required" })}
                size="sm"
                borderRadius="md"
              />
            </HStack>
            <FormErrorMessage fontSize="xs">{errors.endDate?.message || errors.endTime?.message}</FormErrorMessage>
            <FormHelperText fontSize="xs">Set when your market will close for final resolution.</FormHelperText>
          </FormControl>
        </VStack>
      );
    case 3:
      return (
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.resolutionBond}>
            <FormLabel fontSize="sm" fontWeight="semibold">Resolution Bond (CMDX)</FormLabel>
            <NumberInput min={0} precision={2} size="sm">
              <NumberInputField {...register("resolutionBond", { required: "Resolution bond is required" })} borderRadius="md" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormErrorMessage fontSize="xs">{errors.resolutionBond?.message}</FormErrorMessage>
            <FormHelperText fontSize="xs">Set the amount of CMDX required as a resolution bond for this market.</FormHelperText>
          </FormControl>

          <FormControl isInvalid={!!errors.resolutionReward}>
            <FormLabel fontSize="sm" fontWeight="semibold">Resolution Reward (CMDX)</FormLabel>
            <NumberInput min={0} precision={2} size="sm">
              <NumberInputField {...register("resolutionReward", { required: "Resolution reward is required" })} borderRadius="md" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormErrorMessage fontSize="xs">{errors.resolutionReward?.message}</FormErrorMessage>
            <FormHelperText fontSize="xs">Specify the reward amount for resolving this market.</FormHelperText>
          </FormControl>
        </VStack>
      );
    case 4:
      return (
        <VStack align="stretch" spacing={3} bg={useColorModeValue("gray.50", "gray.700")} p={4} borderRadius="md">
          <Heading size="sm" mb={2}>Market Summary</Heading>
          <Text fontSize="sm"><strong>Category:</strong> {watchedFields.category}</Text>
          <Text fontSize="sm"><strong>Question:</strong> {watchedFields.question}</Text>
          <Text fontSize="sm"><strong>Description:</strong> {watchedFields.description}</Text>
          <Divider my={2} />
          <Text fontSize="sm" fontWeight="bold">Options:</Text>
          <Flex flexWrap="wrap" gap={2}>
            {watchedFields.options.map((o, index) => (
              <Badge key={index} colorScheme="blue" px={2} py={1} borderRadius="full" fontSize="xs">{o.value}</Badge>
            ))}
          </Flex>
          <Divider my={2} />
          <Text fontSize="sm"><strong>Start Time:</strong> {`${watchedFields.startDate?.toLocaleDateString()} ${watchedFields.startTime}`}</Text>
          <Text fontSize="sm"><strong>End Time:</strong> {`${watchedFields.endDate?.toLocaleDateString()} ${watchedFields.endTime}`}</Text>
          <Divider my={2} />
          <Text fontSize="sm"><strong>Resolution Bond:</strong> {watchedFields.resolutionBond} CMDX</Text>
          <Text fontSize="sm"><strong>Resolution Reward:</strong> {watchedFields.resolutionReward} CMDX</Text>
        </VStack>
      );
    default:
      return null;
  }
};

const bgColor = useColorModeValue("gray.50", "gray.900");
const cardBgColor = useColorModeValue("white", "gray.800");
const gradientColor = useColorModeValue("linear(to-r, blue.400, purple.500)", "linear(to-r, blue.200, purple.300)");
const buttonBgColor = useColorModeValue("blue.500", "blue.200");
const buttonHoverBgColor = useColorModeValue("blue.600", "blue.300");
const inputBgColor = useColorModeValue("white", "gray.700");
const inputBorderColor = useColorModeValue("gray.200", "gray.600");

return (
  <Box
    bg="transparent"
    minHeight="100vh"
    py={8}
  >
    <Container maxW="container.md">
      <VStack spacing={8} align="stretch">
        <Heading 
          textAlign="center" 
          fontSize="4xl" 
          fontWeight="extrabold" 
          bgGradient={gradientColor} 
          bgClip="text" 
          letterSpacing="tight"
          mb={4}
        >
          Create New Market
        </Heading>
        
        <GlassBox p={6}>
          <Box position="relative">
            <HStack justify="center" spacing={4} mb={6}>
              {steps.map((step, index) => (
                <Tooltip key={index} label={step.title} hasArrow placement="top">
                  <Button
                    onClick={() => setCurrentStep(index)}
                    bg={currentStep >= index ? buttonBgColor : "transparent"}
                    color={currentStep >= index ? "white" : "gray.500"}
                    _hover={{
                      bg: currentStep >= index ? buttonHoverBgColor : "rgba(255, 255, 255, 0.1)",
                    }}
                    borderRadius="full"
                    size="sm"
                    fontWeight="bold"
                    transition="all 0.3s"
                    boxShadow={currentStep >= index ? "0 0 10px rgba(66, 153, 225, 0.5)" : "none"}
                  >
                    <Box as={step.icon} fontSize="1.2em" />
                  </Button>
                </Tooltip>
              ))}
            </HStack>

            <Box position="relative" h="2px" mb={6}>
              <Box
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                bg="gray.200"
                borderRadius="full"
              />
              <Box
                position="absolute"
                top="0"
                left="0"
                width={`${((currentStep + 1) / steps.length) * 100}%`}
                height="100%"
                bgGradient={gradientColor}
                borderRadius="full"
                transition="width 0.3s ease-in-out"
              />
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Box
                minHeight="300px"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
              >
                {renderStepContent(currentStep)}
                
                <HStack justify="space-between" mt={6}>
                  <Button
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    leftIcon={<ChevronLeftIcon />}
                    isDisabled={currentStep === 0}
                    variant="outline"
                    size="sm"
                    fontWeight="bold"
                    borderRadius="full"
                    _hover={{ 
                      transform: 'translateX(-2px)', 
                      boxShadow: 'sm',
                      bg: useColorModeValue('gray.100', 'gray.700')
                    }}
                    transition="all 0.3s"
                  >
                    Previous
                  </Button>
                  {currentStep < steps.length - 1 ? (
                    <Button
                      onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                      rightIcon={<ChevronRightIcon />}
                      bgGradient={gradientColor}
                      color="white"
                      size="sm"
                      fontWeight="bold"
                      borderRadius="full"
                      _hover={{ 
                        bgGradient: useColorModeValue("linear(to-r, blue.500, purple.600)", "linear(to-r, blue.300, purple.400)"),
                        transform: 'translateX(2px)', 
                        boxShadow: 'sm' 
                      }}
                      transition="all 0.3s"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      loadingText="Creating"
                      bgGradient={gradientColor}
                      color="white"
                      size="sm"
                      fontWeight="bold"
                      borderRadius="full"
                      _hover={{ 
                        bgGradient: useColorModeValue("linear(to-r, blue.500, purple.600)", "linear(to-r, blue.300, purple.400)"),
                        transform: 'translateY(-2px)', 
                        boxShadow: 'md' 
                      }}
                      transition="all 0.3s"
                    >
                      Create Market
                    </Button>
                  )}
                </HStack>
              </Box>
            </form>
          </Box>
        </GlassBox>
      </VStack>
    </Container>

    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent borderRadius="xl" bg={cardBgColor}>
        <ModalHeader 
          bgGradient={gradientColor} 
          bgClip="text" 
          fontWeight="bold"
          fontSize="xl"
          pb={4}
        >
          Not Whitelisted
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={6}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm">
              Your address is not whitelisted to create markets. Please contact the team to get your address whitelisted.
            </Text>
            <Button 
              bgGradient={gradientColor}
              color="white"
              onClick={() => window.open('mailto:support@predictx.com')}
              rightIcon={<FiAlertTriangle />}
              size="sm"
              fontWeight="bold"
              borderRadius="full"
              _hover={{ 
                bgGradient: useColorModeValue("linear(to-r, blue.500, purple.600)", "linear(to-r, blue.300, purple.400)"),
                transform: 'translateY(-2px)', 
                boxShadow: 'sm' 
              }}
              transition="all 0.3s"
            >
              Contact Support
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  </Box>
);
};

export default CreateMarketPage;