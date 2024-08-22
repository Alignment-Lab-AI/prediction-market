'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// ... rest of the file remains the same
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderMaterial } from 'three';

interface Market {
  position: THREE.Vector3;
  connections: THREE.Vector3[];
  size: number;
  color: THREE.Color;
}

const PredictionMarketVisualization: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Create markets
    const markets: Market[] = [];
    const marketCount = 50;
    const marketGeometry = new THREE.SphereGeometry(1, 32, 32);
    const marketMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff });

    for (let i = 0; i < marketCount; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
      );
      const size = Math.random() * 0.5 + 0.1;
      const color = new THREE.Color(Math.random(), Math.random(), Math.random());
      const market: Market = { position, connections: [], size, color };
      markets.push(market);

      const marketMesh = new THREE.Mesh(marketGeometry, marketMaterial);
      marketMesh.position.copy(position);
      marketMesh.scale.setScalar(size);
      marketMesh.material.color = color;
      scene.add(marketMesh);
    }

    // Create connections between markets
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
    for (let i = 0; i < markets.length; i++) {
      const market = markets[i];
      const connectionCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = Math.floor(Math.random() * markets.length);
        if (targetIndex !== i) {
          const targetMarket = markets[targetIndex];
          market.connections.push(targetMarket.position);

          const lineGeometry = new THREE.BufferGeometry().setFromPoints([market.position, targetMarket.position]);
          const line = new THREE.Line(lineGeometry, lineMaterial);
          scene.add(line);
        }
      }
    }

    // Particle system for background
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCnt = 5000;
    const posArray = new Float32Array(particlesCnt * 3);
    for (let i = 0; i < particlesCnt * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0xffffff,
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Custom shader for dynamic background
    const bgGeometry = new THREE.PlaneGeometry(100, 100);
    const bgMaterial = new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        varying vec2 vUv;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          vec2 uv = gl_FragCoord.xy / resolution.xy;
          float n = noise(uv * 10.0 + time * 0.1);
          vec3 color = mix(vec3(0.0, 0.1, 0.2), vec3(0.0, 0.2, 0.3), n);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
    const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    bgMesh.position.z = -10;
    scene.add(bgMesh);

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 50;

    camera.position.z = 30;

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      markets.forEach((market, index) => {
        const mesh = scene.children[index + 2] as THREE.Mesh; // Offset for lights
        mesh.position.y = market.position.y + Math.sin(time + index) * 0.2;
        mesh.rotation.y += 0.01;
      });

      particlesMesh.rotation.y += 0.0005;

      bgMaterial.uniforms.time.value = time;

      controls.update();
      composer.render();
    };

    animate();

    // Scroll interaction
    const handleScroll = () => {
      const scrollY = window.scrollY;
      camera.position.y = -(scrollY * 0.05);
    };

    window.addEventListener('scroll', handleScroll);

    // Mouse move interaction
    const handleMouseMove = (event: MouseEvent) => {
      const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      bgMaterial.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }} />;
};

export default PredictionMarketVisualization;