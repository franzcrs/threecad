/**
 * Filename: threeUtils.ts
 * Author: Franz Chuquirachi
 * Created: 2024-12-19
 * Copyright © 2024 Franz Arthur Chuquirachi Rosales. All rights reserved.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { InfiniteGridHelper } from './classes.ts';

// Function to setup the scene with lights, grid helper, and a sample box object
export const setupScene = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2b2d3c);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // Add grid helper
  // const gridHelper = new THREE.GridHelper(100, 50);
  // scene.add(gridHelper);
  const infiniteGridHelper = new InfiniteGridHelper(20, 500, 0xc0c0c0, 3500);
  scene.add(infiniteGridHelper);

  // Add sample box
  const boxGeometry = new THREE.BoxGeometry(4, 4, 4);
  const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  scene.add(box);

  return { scene };
};

// Function to setup the controls for the interaction with the scene
export const setupControls = (camera: THREE.Camera, domElement: HTMLElement) => {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = true;
  controls.minDistance = 1;
  controls.maxDistance = 700;
  controls.maxPolarAngle = Math.PI;
  return controls;
};

// Function to buffer the STL file information asynchronously into a BufferGeometry object
export const loadSTLFile = async (file: File | Blob): Promise<THREE.BufferGeometry> => {
    return new Promise((resolve, reject) => {
      if (file) {
        const loader = new STLLoader();
        loader.load(URL.createObjectURL(file), (geometry) => {
          resolve(geometry);
        }, undefined, (error) => {
          reject(new Error(`Failed to load STL file: ${error instanceof Error ? error.message : 'Unknown error'}`));
        });
      }
    });
  };