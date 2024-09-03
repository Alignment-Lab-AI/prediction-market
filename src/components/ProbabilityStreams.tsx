import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';

const ProbabilityStreams = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<{ x: number; y: number; message: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const streams: Stream[] = [];
    const nodes: Node[] = [];
    const convergencePoints: ConvergencePoint[] = [];

    // Adjust colors here. Increase 'a' value to make colors more vibrant
    const colorPalette = [
      { r: 66, g: 153, b: 225, a: 0.2 },   // Blue
      { r: 159, g: 122, b: 234, a: 0.2 }, // Purple
      { r: 237, g: 100, b: 166, a: 0.2 }, // Pink
      { r: 72, g: 187, b: 120, a: 0.2 },  // Green
      { r: 246, g: 173, b: 85, a: 0.2 }   // Orange
    ];

    const messages = [
      "Will AI surpass human intelligence by 2030?",
      "Next breakthrough in renewable energy?",
      "Future of decentralized finance?",
      "Mars colonization timeline?",
      "Quantum computing's impact on cryptography?",
      "Global climate change tipping points?",
      "Next major technological disruption?",
      "Future of work and automation?",
      "Breakthrough in longevity research?",
      "Next global pandemic probability?"
    ];

    const subconscious_messages = [
      "foresight",
      "probability",
      "decision",
      "future",
      "predict",
      "analyze",
      "insight",
      "trend",
      "forecast",
      "vision"
    ];

    class Stream {
      x: number;
      y: number;
      speed: number;
      color: { r: number; g: number; b: number; a: number };
      lineWidth: number;
      length: number;
      pulse: number;
      pulseSpeed: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.speed = Math.random() * 0.5 + 0.1; // Adjust speed range here
        this.color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        this.lineWidth = Math.random() * 1 + 0.5; // Adjust line width range here
        this.length = Math.random() * 100 + 50; // Adjust line length range here
        this.pulse = 0;
        this.pulseSpeed = Math.random() * 0.05 + 0.01; // Adjust pulse speed here
      }

      draw() {
        this.pulse += this.pulseSpeed;
        const opacity = (Math.sin(this.pulse) + 1) / 2 * 0.3 + 0.1; // Adjust opacity range here

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${opacity * this.color.a})`;
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();

        this.y += this.speed;
        if (this.y > canvas.height) {
          this.y = -this.length;
          this.x = Math.random() * canvas.width;
        }
      }
    }

    class Node {
      x: number;
      y: number;
      radius: number;
      color: { r: number; g: number; b: number; a: number };
      message: string;
      pulse: number;
      pulseSpeed: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 3 + 2; // Adjust node size range here
        this.color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        this.message = messages[Math.floor(Math.random() * messages.length)];
        this.pulse = 0;
        this.pulseSpeed = Math.random() * 0.05 + 0.02; // Adjust pulse speed here
      }

      draw() {
        this.pulse += this.pulseSpeed;
        const scale = (Math.sin(this.pulse) + 1) / 2 * 0.5 + 0.5;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${2.6 * this.color.a})`; // Adjust node opacity here
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * scale * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${0.2 * this.color.a})`; // Adjust node glow opacity here
        ctx.fill();
      }

      checkHover(mouseX: number, mouseY: number) {
        const distance = Math.sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2);
        return distance < this.radius * 2;
      }
    }

    class ConvergencePoint {
      x: number;
      y: number;
      radius: number;
      color: { r: number; g: number; b: number; a: number };
      pulse: number;
      pulseSpeed: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 10 + 5; // Adjust convergence point size range here
        this.color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        this.pulse = 0;
        this.pulseSpeed = Math.random() * 0.02 + 0.01; // Adjust pulse speed here
      }

      draw() {
        this.pulse += this.pulseSpeed;
        const scale = (Math.sin(this.pulse) + 1) / 2 * 0.5 + 0.5;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${0.3 * this.color.a})`; // Adjust convergence point opacity here
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * scale * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${0.1 * this.color.a})`; // Adjust convergence point glow opacity here
        ctx.fill();
      }
    }

    // Adjust number of streams here
    for (let i = 0; i < 100; i++) {
      streams.push(new Stream());
    }

    // Adjust number of nodes here
    for (let i = 0; i < 20; i++) {
      nodes.push(new Node(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    // Adjust number of convergence points here
    for (let i = 0; i < 5; i++) {
      convergencePoints.push(new ConvergencePoint());
    }

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      streams.forEach(stream => stream.draw());
      nodes.forEach(node => node.draw());
      convergencePoints.forEach(point => point.draw());

      // Draw connecting lines between nearby nodes
      nodes.forEach((node, index) => {
        for (let i = index + 1; i < nodes.length; i++) {
          const otherNode = nodes[i];
          const distance = Math.sqrt((node.x - otherNode.x) ** 2 + (node.y - otherNode.y) ** 2);
          if (distance < 100) { // Adjust maximum distance for connections here
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.strokeStyle = `rgba(${node.color.r}, ${node.color.g}, ${node.color.b}, ${(0.2 - distance * 0.002) * node.color.a})`; // Adjust connection line opacity here
            ctx.lineWidth = 0.5; // Adjust connection line width here
            ctx.stroke();
          }
        }
      });

      // Subconscious messages
      if (frame % 300 === 0) { // Adjust frequency of subconscious messages here
        const message = subconscious_messages[Math.floor(Math.random() * subconscious_messages.length)];
        ctx.font = '40px Arial'; // Adjust font size here
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Adjust subconscious message opacity here
        ctx.fillText(message, Math.random() * (canvas.width - 200), Math.random() * canvas.height);
      }

      frame++;
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (event: MouseEvent) => {
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // Interact with streams
      streams.forEach(stream => {
        const dx = mouseX - stream.x;
        const dy = mouseY - stream.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 50) { // Adjust interaction distance here
          stream.speed = 2; // Adjust interaction speed here
        } else {
          stream.speed = Math.random() * 0.5 + 0.1; // Reset to normal speed range
        }
      });

      // Check for node hover
      let hovered = null;
      for (const node of nodes) {
        if (node.checkHover(mouseX, mouseY)) {
          hovered = { x: node.x, y: node.y, message: node.message };
          break;
        }
      }
      setHoveredNode(hovered);
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const bgColor = useColorModeValue('gray.50', 'gray.900'); // Adjust background color here
  const tooltipBg = useColorModeValue('white', 'gray.800');
  const tooltipColor = useColorModeValue('gray.800', 'white');

  return (
    <Box position="fixed" top={0} left={0} right={0} bottom={0} zIndex={-1} bg={bgColor}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      {hoveredNode && (
        <Box
          position="fixed"
          top={hoveredNode.y + 20}
          left={hoveredNode.x}
          bg={tooltipBg}
          color={tooltipColor}
          p={2}
          borderRadius="md"
          boxShadow="lg"
          maxW="300px"
          zIndex={10}
        >
          <Text fontSize="sm">{hoveredNode.message}</Text>
        </Box>
      )}
      <Text
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        fontSize="8xl"
        fontWeight="extrabold"
        opacity={0.05} // Adjust watermark opacity here
        pointerEvents="none"
        bgGradient="linear(to-r, blue.400, purple.500)"
        bgClip="text"
      >
        PREDICT
      </Text>
    </Box>
  );
};

export default ProbabilityStreams;