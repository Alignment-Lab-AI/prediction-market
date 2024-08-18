'use client';

import React, { useState } from 'react';
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
  InputRightElement,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ChevronRightIcon, ChevronLeftIcon, QuestionOutlineIcon } from '@chakra-ui/icons';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FaQuestion, FaListUl, FaCalendarAlt, FaCoins, FaCheckCircle, FaClock } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const MotionBox = motion(Box);

interface MarketForm {
  question: string;
  description: string;
  options: { value: string }[];
  startTime: Date;
  endTime: Date;
  collateralAmount: number;
  rewardAmount: number;
}

const steps = [
  { title: 'Basic Info', icon: FaQuestion },
  { title: 'Options', icon: FaListUl },
  { title: 'Timing', icon: FaCalendarAlt },
  { title: 'Economics', icon: FaCoins },
  { title: 'Review', icon: FaCheckCircle },
];

const CreateMarketPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<MarketForm>({
    defaultValues: {
      options: [{ value: '' }, { value: '' }],
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options"
  });

  const watchedFields = watch();

  const onSubmit = async (data: MarketForm) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast({
        title: "Market created!",
        description: "Your new market has been successfully launched.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error creating market.",
        description: "There was an error creating your market. Please try again.",
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
            <FormControl isInvalid={!!errors.question}>
              <FormLabel>Question</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" children={<FaQuestion color="gray.300" />} />
                <Input {...register("question", { required: "Question is required" })} placeholder="e.g., Will Bitcoin reach $100,000 by the end of 2023?" />
              </InputGroup>
              <FormErrorMessage>{errors.question?.message}</FormErrorMessage>
              <FormHelperText>Enter a clear, concise question for your market.</FormHelperText>
            </FormControl>

            <FormControl isInvalid={!!errors.description}>
              <FormLabel>Description</FormLabel>
              <Textarea 
                {...register("description", { required: "Description is required" })} 
                placeholder="Provide additional context or details about your market question."
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
            {fields.map((field, index) => (
              <Flex key={field.id} mb={2}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" children={<FaListUl color="gray.300" />} />
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
            <Button leftIcon={<AddIcon />} onClick={() => append({ value: '' })} mt={2} colorScheme="blue">
              Add Option
            </Button>
            <FormHelperText>Add at least two options for your market. You can add more if needed.</FormHelperText>
          </FormControl>
        );
      case 2:
        return (
          <HStack spacing={4}>
            <FormControl isInvalid={!!errors.startTime}>
              <FormLabel>Start Time</FormLabel>
              <Controller
                control={control}
                name="startTime"
                render={({ field }) => (
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" children={<FaCalendarAlt color="gray.300" />} />
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date) => field.onChange(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={new Date()}
                      customInput={<Input />}
                    />
                  </InputGroup>
                )}
              />
              <FormErrorMessage>{errors.startTime?.message}</FormErrorMessage>
              <FormHelperText>Choose when your market will open for predictions.</FormHelperText>
            </FormControl>

            <FormControl isInvalid={!!errors.endTime}>
              <FormLabel>End Time</FormLabel>
              <Controller
                control={control}
                name="endTime"
                render={({ field }) => (
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" children={<FaClock color="gray.300" />} />
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date) => field.onChange(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={watchedFields.startTime}
                      customInput={<Input />}
                    />
                  </InputGroup>
                )}
              />
              <FormErrorMessage>{errors.endTime?.message}</FormErrorMessage>
              <FormHelperText>Set when your market will close for final resolution.</FormHelperText>
            </FormControl>
          </HStack>
        );
      case 3:
        return (
          <VStack spacing={6} align="stretch">
            <FormControl isInvalid={!!errors.collateralAmount}>
              <FormLabel>Collateral Amount (UCMDX)</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" children={<FaCoins color="gray.300" />} />
                <NumberInput min={0} width="100%">
                  <NumberInputField {...register("collateralAmount", { required: "Collateral amount is required" })} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </InputGroup>
              <FormErrorMessage>{errors.collateralAmount?.message}</FormErrorMessage>
              <FormHelperText>Set the amount of UCMDX required as collateral for this market.</FormHelperText>
            </FormControl>

            <FormControl isInvalid={!!errors.rewardAmount}>
              <FormLabel>Reward Amount (UCMDX)</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" children={<FaCoins color="gray.300" />} />
                <NumberInput min={0} width="100%">
                  <NumberInputField {...register("rewardAmount", { required: "Reward amount is required" })} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </InputGroup>
              <FormErrorMessage>{errors.rewardAmount?.message}</FormErrorMessage>
              <FormHelperText>Specify the reward amount for correct predictions in this market.</FormHelperText>
            </FormControl>
          </VStack>
        );
      case 4:
        return (
          <VStack align="stretch" spacing={4} bg="gray.50" p={4} borderRadius="md">
            <Heading size="md" mb={2}>Market Summary</Heading>
            <Text><strong>Question:</strong> {watchedFields.question}</Text>
            <Text><strong>Description:</strong> {watchedFields.description}</Text>
            <Text><strong>Options:</strong> {watchedFields.options.map(o => o.value).join(", ")}</Text>
            <Text><strong>Start Time:</strong> {watchedFields.startTime?.toLocaleString()}</Text>
            <Text><strong>End Time:</strong> {watchedFields.endTime?.toLocaleString()}</Text>
            <Text><strong>Collateral Amount:</strong> {watchedFields.collateralAmount} UCMDX</Text>
            <Text><strong>Reward Amount:</strong> {watchedFields.rewardAmount} UCMDX</Text>
          </VStack>
        );
      default:
        return null;
    }
  };

  return (
    <Box bg="gray.50" minHeight="100vh" py={12}>
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          <Heading textAlign="center" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
            Create New Market
          </Heading>
          
          <HStack justify="center" spacing={0} bg="white" p={2} borderRadius="full" boxShadow="sm">
            {steps.map((step, index) => (
              <Tooltip key={index} label={step.title} hasArrow>
                <Button
                  onClick={() => setCurrentStep(index)}
                  colorScheme={currentStep >= index ? "blue" : "gray"}
                  variant={currentStep >= index ? "solid" : "ghost"}
                  borderRadius="full"
                  size="sm"
                  mr={index < steps.length - 1 ? 2 : 0}
                >
                  {step.icon && <Box as={step.icon} mr={2} />}
                  {index + 1}
                </Button>
              </Tooltip>
            ))}
          </HStack>

          <Progress value={(currentStep + 1) * 20} size="sm" colorScheme="blue" borderRadius="full" />

          <form onSubmit={handleSubmit(onSubmit)}>
            <MotionBox
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                bg="white"
                p={8}
                borderRadius="xl"
                boxShadow="lg"
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
                  >
                    Previous
                  </Button>
                  {currentStep < steps.length - 1 ? (
                    <Button
                      onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                      rightIcon={<ChevronRightIcon />}
                      colorScheme="blue"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      colorScheme="green"
                      type="submit"
                      isLoading={isSubmitting}
                      loadingText="Creating Market"
                    >
                      Create Market
                    </Button>
                  )}
                </HStack>
              </Box>
            </MotionBox>
          </form>
        </VStack>
      </Container>
    </Box>
  );
};

export default CreateMarketPage;