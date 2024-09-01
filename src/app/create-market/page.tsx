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
  Progress,
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
  Kbd,
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
            <VStack spacing={6} align="stretch">
              <FormControl isInvalid={!!errors.category}>
                <FormLabel fontWeight="bold">Category</FormLabel>
                <Select 
                  {...register("category", { required: "Category is required" })}
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                  _hover={{ borderColor: "blue.400" }}
                  _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.category?.message}</FormErrorMessage>
              </FormControl>
    
              <FormControl isInvalid={!!errors.question}>
                <FormLabel fontWeight="bold">Question</FormLabel>
                <Input
                  {...register("question", { required: "Question is required" })}
                  placeholder="e.g., Which team will win the 2024 FIFA World Cup?"
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                  _hover={{ borderColor: "blue.400" }}
                  _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                />
                <FormErrorMessage>{errors.question?.message}</FormErrorMessage>
                <FormHelperText>Enter a clear, concise question for your market.</FormHelperText>
              </FormControl>
    
              <FormControl isInvalid={!!errors.description}>
                <FormLabel fontWeight="bold">Description</FormLabel>
                <Textarea 
                  {...register("description", { required: "Description is required" })} 
                  placeholder="Provide additional context or details about your market question."
                  minHeight="150px"
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                  _hover={{ borderColor: "blue.400" }}
                  _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                />
                <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
                <FormHelperText>Give participants more information to make informed decisions.</FormHelperText>
              </FormControl>
            </VStack>
          );
      case 1:
        return (
          <FormControl>
            <FormLabel>Options</FormLabel>
            <VStack spacing={2} align="stretch">
              {fields.map((field, index) => (
                <Flex key={field.id} mb={2}>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" children={<FiList color="gray.300" />} />
                    <Input
                      {...register(`options.${index}.value` as const, { required: "Option is required" })}
                      placeholder={`Option ${index + 1}`}
                      mr={2}
                    />
                  </InputGroup>
                  <IconButton
                    aria-label="Remove option"
                    icon={<DeleteIcon />}
                    onClick={() => remove(index)}
                    isDisabled={fields.length <= 2}
                    colorScheme="red"
                    variant="outline"
                  />
                </Flex>
              ))}
            </VStack>
            <Button
              leftIcon={<AddIcon />}
              onClick={() => append({ value: '' })}
              mt={4}
              colorScheme="blue"
              variant="outline"
              _hover={{ bg: 'blue.50', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
            >
              Add Option
            </Button>
            <FormHelperText mt={2}>Add at least two options for your market. You can add more if needed.</FormHelperText>
          </FormControl>
        );
      case 2:
        return (
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.startDate || !!errors.startTime}>
              <FormLabel>Start Time</FormLabel>
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
                />
              </HStack>
              <FormErrorMessage>{errors.startDate?.message || errors.startTime?.message}</FormErrorMessage>
              <FormHelperText>Choose when your market will open for predictions.</FormHelperText>
            </FormControl>

            <FormControl isInvalid={!!errors.endDate || !!errors.endTime}>
              <FormLabel>End Time</FormLabel>
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
                />
              </HStack>
              <FormErrorMessage>{errors.endDate?.message || errors.endTime?.message}</FormErrorMessage>
              <FormHelperText>Set when your market will close for final resolution.</FormHelperText>
            </FormControl>
          </VStack>
        );
      case 3:
        return (
          <VStack spacing={6} align="stretch">
            <FormControl isInvalid={!!errors.resolutionBond}>
              <FormLabel>Resolution Bond (CMDX)</FormLabel>
              <NumberInput min={0} precision={2}>
                <NumberInputField {...register("resolutionBond", { required: "Resolution bond is required" })} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{errors.resolutionBond?.message}</FormErrorMessage>
              <FormHelperText>Set the amount of CMDX required as a resolution bond for this market.</FormHelperText>
            </FormControl>

            <FormControl isInvalid={!!errors.resolutionReward}>
              <FormLabel>Resolution Reward (CMDX)</FormLabel>
              <NumberInput min={0} precision={2}>
                <NumberInputField {...register("resolutionReward", { required: "Resolution reward is required" })} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{errors.resolutionReward?.message}</FormErrorMessage>
              <FormHelperText>Specify the reward amount for resolving this market.</FormHelperText>
            </FormControl>
          </VStack>
        );
      case 4:
        return (
          <VStack align="stretch" spacing={4} bg={useColorModeValue("gray.50", "gray.700")} p={6} borderRadius="md">
            <Heading size="md" mb={2}>Market Summary</Heading>
            <Text><strong>Category:</strong> {watchedFields.category}</Text>
            <Text><strong>Question:</strong> {watchedFields.question}</Text>
            <Text><strong>Description:</strong> {watchedFields.description}</Text>
            <Divider my={2} />
            <Text fontWeight="bold">Options:</Text>
            {watchedFields.options.map((o, index) => (
              <Badge key={index} colorScheme="blue" mr={2} mb={2}>{o.value}</Badge>
            ))}
            <Divider my={2} />
            <Text><strong>Start Time:</strong> {`${watchedFields.startDate?.toLocaleDateString()} ${watchedFields.startTime}`}</Text>
            <Text><strong>End Time:</strong> {`${watchedFields.endDate?.toLocaleDateString()} ${watchedFields.endTime}`}</Text>
            <Divider my={2} />
            <Text><strong>Resolution Bond:</strong> {watchedFields.resolutionBond} CMDX</Text>
            <Text><strong>Resolution Reward:</strong> {watchedFields.resolutionReward} CMDX</Text>
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
  const inputBgColor = useColorModeValue("gray.50", "gray.700");
  const inputBorderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box bg={bgColor} minHeight="100vh" py={12}>
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          <Heading textAlign="center" bgGradient={gradientColor} bgClip="text" fontSize="4xl" fontWeight="extrabold">
            Create New Market
          </Heading>
          
          <Box bg={cardBgColor} borderRadius="xl" boxShadow="xl" p={8} position="relative" overflow="hidden">
            <Box
              position="absolute"
              top="-50%"
              left="-50%"
              width="200%"
              height="200%"
              backgroundImage={`radial-gradient(circle, ${useColorModeValue('rgba(66, 153, 225, 0.1)', 'rgba(66, 153, 225, 0.05)')} 0%, transparent 70%)`}
              pointerEvents="none"
            />
            
            <HStack justify="center" spacing={4} mb={8}>
            {steps.map((step, index) => (
                <Tooltip key={index} label={step.title} hasArrow>
                <Button
                    onClick={() => setCurrentStep(index)}
                    bg={currentStep >= index ? "blue.500" : "gray.100"}
                    color={currentStep >= index ? "white" : "gray.600"}
                    _hover={{
                    bg: currentStep >= index ? "blue.600" : "gray.200",
                    transform: 'translateY(-2px)',
                    boxShadow: 'md'
                    }}
                    borderRadius="full"
                    size="md"
                    fontWeight="bold"
                    transition="all 0.2s"
                    boxShadow={currentStep >= index ? "0 0 15px rgba(66, 153, 225, 0.5)" : "none"}
                >
                    <Box as={step.icon} mr={2} />
                    <Box
                    bg={currentStep >= index ? "blue.400" : "gray.300"}
                    color={currentStep >= index ? "white" : "gray.600"}
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="sm"
                    >
                    {index + 1}
                    </Box>
                </Button>
                </Tooltip>
            ))}
            </HStack>

            <Box position="relative" h="4px" mb={8}>
              <Box
                position="absolute"
                top="0"
                left="0"
                width={`${(currentStep + 1) * 20}%`}
                height="100%"
                bgGradient={gradientColor}
                borderRadius="full"
                transition="width 0.3s ease-in-out"
                boxShadow="0 0 10px rgba(66, 153, 225, 0.7), 0 0 20px rgba(66, 153, 225, 0.5), 0 0 30px rgba(66, 153, 225, 0.3)"
              />
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                <MotionBox
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Box
                    minHeight="400px"
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                  >
                    {renderStepContent(currentStep)}
                    
                    <HStack justify="space-between" mt={8}>
                      <Button
                        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        leftIcon={<ChevronLeftIcon />}
                        isDisabled={currentStep === 0}
                        variant="outline"
                        size="lg"
                        fontWeight="bold"
                        borderRadius="full"
                        _hover={{ 
                          transform: 'translateX(-2px)', 
                          boxShadow: 'md',
                          bg: useColorModeValue('gray.100', 'gray.700')
                        }}
                        transition="all 0.2s"
                      >
                        Previous
                      </Button>
                      {currentStep < steps.length - 1 ? (
                        <Button
                          onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                          rightIcon={<ChevronRightIcon />}
                          bgGradient={gradientColor}
                          color="white"
                          size="lg"
                          fontWeight="bold"
                          borderRadius="full"
                          _hover={{ 
                            bgGradient: useColorModeValue("linear(to-r, blue.500, purple.600)", "linear(to-r, blue.300, purple.400)"),
                            transform: 'translateX(2px)', 
                            boxShadow: 'md' 
                          }}
                          transition="all 0.2s"
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          isLoading={isSubmitting}
                          loadingText="Creating Market"
                          bgGradient={gradientColor}
                          color="white"
                          size="lg"
                          fontWeight="bold"
                          borderRadius="full"
                          _hover={{ 
                            bgGradient: useColorModeValue("linear(to-r, blue.500, purple.600)", "linear(to-r, blue.300, purple.400)"),
                            transform: 'translateY(-2px)', 
                            boxShadow: 'lg' 
                          }}
                          transition="all 0.2s"
                        >
                          Create Market
                        </Button>
                      )}
                    </HStack>
                  </Box>
                </MotionBox>
              </AnimatePresence>
            </form>
          </Box>
        </VStack>
      </Container>

      {/* Modal for non-whitelisted users */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl" bg={cardBgColor}>
          <ModalHeader bgGradient={gradientColor} bgClip="text" fontWeight="bold">Not Whitelisted</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>
                Your address is not whitelisted to create markets. Please contact the team to get your address whitelisted.
              </Text>
              <Button 
                bgGradient={gradientColor}
                color="white"
                onClick={() => window.open('mailto:support@predictx.com')}
                rightIcon={<FiAlertTriangle />}
                borderRadius="full"
                _hover={{ 
                  bgGradient: useColorModeValue("linear(to-r, blue.500, purple.600)", "linear(to-r, blue.300, purple.400)"),
                  transform: 'translateY(-2px)', 
                  boxShadow: 'md' 
                }}
                transition="all 0.2s"
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