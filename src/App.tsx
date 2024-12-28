/**
 * Filename: App.tsx
 * Author: Franz Chuquirachi
 * Created: 2024-12-16
 * Copyright © 2024 Franz Arthur Chuquirachi Rosales. All rights reserved.
 */

import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import SearchBox from './components/SearchBox';
import SearchResults from './components/SearchResults';
import LoadingSpinner from './components/LoadingSpinner';
import TabButton from './components/TabButton';
import InspectorTab from './components/InspectorTab';
import ProjectsTab from './components/ProjectsTab';
import { FileText, FolderKanban, Home } from 'lucide-react';
import { Model, SearchResult } from './utils/types.ts';
import { searchModels, fetchModel } from './services/apiClient';

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { setupScene, setupControls, loadSTLFile } from './utils/threeUtils.ts';
import { InfiniteGridHelper } from './utils/classes.ts';

// Main component of the application
function App() {
  const [searchQuery, setSearchQuery] = useState(''); // Search query state
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [results, setResults] = useState<SearchResult[]>([]); // Results state
  const [isResultsVisible, setIsResultsVisible] = useState(false); // Results visibility state
  const dropdownRef = useRef<HTMLDivElement>(null); // Dropdown reference

  const [activeTab, setActiveTab] = useState<'inspector' | 'projects'>('inspector'); // Active tab state
  const [models, setModels] = useState<Model[]>([]); // Models state
  const [activeModel, setActiveModel] = useState<Model | null>(null); // Active model state
  const viewerRef = useRef<HTMLDivElement>(null); // 3D Model Viewer container reference
  const sceneRef = useRef<THREE.Scene | null>(null); // Scene reference
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null); // Camera reference
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null); // Renderer reference
  const controlsRef = useRef<OrbitControls | null>(null); // Controls reference
  const [cameraHomePos, setCameraHomePos] = useState<THREE.Vector3>(new THREE.Vector3(8, 8, 8)) ; // Camera home position state

  const [fileType, setFileType] = useState<string>('FACETS-REDUCED BINARY'); // File type to fetch state
  const [fetchTime, setFetchTime] = useState<number>(0); // Fetch time state

  // Function to handle the search of the query input
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setIsResultsVisible(true);

    try {
      const data = await searchModels(searchQuery);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Hook to add and remove an event listener that close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsResultsVisible(false);
      }
    };

    if (isResultsVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isResultsVisible]);

  // Hook to setup the 3D scene and basic elements using Three.js
  useEffect(() => {
    if (!viewerRef.current) return;

    // Setup scene
    const { scene } = setupScene();
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      viewerRef.current.clientWidth / viewerRef.current.clientHeight,
      0.1,
      9000
    );
    camera.position.set(cameraHomePos.x, cameraHomePos.y, cameraHomePos.z);
    cameraRef.current = camera;
    sceneRef.current?.position.set(0, 0, 0);

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(viewerRef.current.clientWidth, viewerRef.current.clientHeight);
    viewerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup controls
    const controls = setupControls(camera, renderer.domElement);
    controlsRef.current = controls;

    // Update the controls
    controls.update();

    // Handle window resize
    const handleResize = () => {
      if (!viewerRef.current || !renderer || !camera) return;
      
      camera.aspect = viewerRef.current.clientWidth / viewerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(viewerRef.current.clientWidth, viewerRef.current.clientHeight);
    };
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      viewerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Function to load a model in the 3D viewer
  const loadModel = (model: Model, renderFetchTime: number = 0) => {
    // Update the fetch time state
    setFetchTime(renderFetchTime);

    if (!sceneRef.current) return;

    // Clear existing model
    sceneRef.current.children = sceneRef.current.children.filter(
      child => child instanceof THREE.Light || child instanceof THREE.GridHelper || child instanceof InfiniteGridHelper
    );

    // Load new model
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const initTimer = Date.now();
    const mesh = new THREE.Mesh(model.geometry, material);
    
    // Center the model
    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    mesh.position.sub(center);

    // Add the model to the scene and set it as active
    sceneRef.current.add(mesh);

    // Log the time taken to load the model
    const endTimer = Date.now();
    console.log('Model loaded in:', endTimer - initTimer, 'ms');

    // Set the camera home position state and the viwer camera based on the model size
    const maxBoxDimension = Math.max(box.getSize(new THREE.Vector3()).x, box.getSize(new THREE.Vector3()).y, box.getSize(new THREE.Vector3()).z) / 2;
    setCameraHomePos(new THREE.Vector3(maxBoxDimension, maxBoxDimension, maxBoxDimension));
    cameraRef.current?.position.set(maxBoxDimension, maxBoxDimension, maxBoxDimension);
    
    // Set the model as active model 
    setActiveModel(model);
  };

  // Function to handle the drop event
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    
    const file = e.dataTransfer.files[0]; // Get the first file from the dropped files

    // Check if a file was dropped
    if (!file) {
      alert('No file was dropped');
      return;
    }

    try {
      let geometry = new THREE.BufferGeometry();
      // Handle the buffering of STL files
      if (file.name.toLowerCase().endsWith('.stl')) {
        geometry = await loadSTLFile(file);
      }
      // Handle other file types
      else {
        alert('Please drop a valid model file');
        return;
      }
      // Create a model object
      const model: Model = {
        name: file.name,
        geometry: geometry,
      };
      // Add the model to the models state
      setModels(prevModels => [...prevModels, model]);
      // Load the model in the viewer and set the fetch time to 0
      loadModel(model);
    } 
    catch (error) {
      alert('Error loading model file. Check the console for more details.');
      console.error('Error loading model file:', error);
    }
  };

  // Function to handle the drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Function to handle the selection of the model to fetch from the API
  const handleResultSelection = async (filename: string) => {
    console.log('Model selected:', filename);
    let filePath = ''; // Determine the file path based on the selected file type
    if (fileType === 'FACETS-REDUCED BINARY') {
      filePath = `binary/${filename.replace('.stl', '_r.stl')}`;
    } else if (fileType === 'BINARY') {
      filePath = `binary/${filename}`;
    } else if (fileType === 'ASCII') {
      filePath = filename;
    }
    // const modelBlob = await fetchModel(filename);
    // const modelBlob = await fetchModel(`binary/${filename}`);
    // const modelBlob = await fetchModel(`binary/${filename.replace('.stl', '_r.stl')}`);
    const initTimer = Date.now();
    const modelBlob = await fetchModel(filePath);
    const endTimer = Date.now();
    console.log('Model fetched in:', endTimer - initTimer, 'ms');
    console.log('Model fetched:', modelBlob);
    try {
      let geometry = new THREE.BufferGeometry();
      // Handle the buffering of STL files
      if (filename.toLowerCase().endsWith('.stl')) {
        geometry = await loadSTLFile(modelBlob);
      }
      // Handle other file types
      else {
        alert('Please drop a valid model file');
        return;
      }
      // Create a model object
      const model: Model = {
        name: filename,
        geometry: geometry,
      };
      // Add the model to the models state
      setModels(prevModels => [...prevModels, model]);
      // Load the model in the viewer
      loadModel(model, endTimer - initTimer);
    } 
    catch (error) {
      alert('Error loading model file. Check the console for more details.');
      console.error('Error loading model file:', error);
    }
  };

  // Handler for radio button changes
  const handleFileTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileType(event.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 pt-12">
        <Header />

        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Explore Our 3D Model Database
          </h2>

          <div ref={dropdownRef} className={`relative ${isResultsVisible ? 'z-10' : ''}`}>
            <SearchBox
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSubmit={handleSearch}
            />

            {/* Search results container */}
            <div className="h-0 overflow-visible">
              <div className={`bg-gray-800 transition-all duration-200 ease-in-out ${
                isResultsVisible ? 'opacity-100 max-h-[500px] z-50' : 'opacity-0 max-h-0 overflow-hidden'
              }`}>
                {isLoading ? (
                  <div className="min-h-24 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <SearchResults results={results} selectionHandler={handleResultSelection} />
                )}
              </div>
            </div>

            {/* Radio Buttons Container */}
            <div className={`px-4 py-4 grid grid-cols-1 md:grid-cols-9 gap-2 md:gap-0 items-center overflow-hidden delay-100 ${isResultsVisible ? 'invisible' : ''}`}>
              <span className="text-xs opacity-40 md:col-span-2">File Type to Fetch:</span>
              {/* Option 1: FACETS-REDUCED BINARY */}
              <label className="flex items-center md:col-span-2 opacity-40 hover:opacity-60 cursor-pointer">
                <input
                  type="radio"
                  name="fileType"
                  value="FACETS-REDUCED BINARY"
                  checked={fileType === 'FACETS-REDUCED BINARY'}
                  onChange={handleFileTypeChange}
                  className="form-radio h-3 w-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-xs">FACETS-REDUCED</span>
              </label>

              {/* Option 2: BINARY */}
              <label className="flex items-center md:ml-8 md:col-span-2 opacity-40 hover:opacity-60 cursor-pointer">
                <input
                  type="radio"
                  name="fileType"
                  value="BINARY"
                  checked={fileType === 'BINARY'}
                  onChange={handleFileTypeChange}
                  className="form-radio h-3 w-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-xs">BINARY</span>
              </label>

              {/* Option 3: ASCII */}
              <label className="flex items-center md:col-span-2 opacity-40 hover:opacity-60 cursor-pointer">
                <input
                  type="radio"
                  name="fileType"
                  value="ASCII"
                  checked={fileType === 'ASCII'}
                  onChange={handleFileTypeChange}
                  className="form-radio h-3 w-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-xs">ASCII</span>
              </label>
            </div>

          </div>
        </div>

        <div className="h-svh py-10 mx-auto max-w-screen-lg">
          <div className="relative w-full h-full bg-gray-700 rounded-lg shadow-md overflow-hidden">
            {/* 3D Viewer Container */}
            <div ref={viewerRef} className="absolute inset-0 w-full h-full"/>

            {/* UI Panel */}
            <div className="absolute h-full w-80 py-4 pl-4">
              <div className="relative h-full w-full bg-gray-800/90 backdrop-blur rounded-lg shadow-xl">
                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                  <TabButton
                    active={activeTab === 'inspector'}
                    onClick={() => setActiveTab('inspector')}
                    icon={FileText}
                    label="Inspector"
                  />
                  <TabButton
                    active={activeTab === 'projects'}
                    onClick={() => setActiveTab('projects')}
                    icon={FolderKanban}
                    label="Projects"
                  />
                </div>

                {/* Tab Content */}
                <div className="p-4 h-[calc(100%-3.5rem)]">
                  {activeTab === 'inspector' ? (
                    <InspectorTab
                      models={models}
                      activeModel={activeModel}
                      onModelSelect={loadModel}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    />
                  ) : (
                    <ProjectsTab />
                  )}
                </div>
              </div>
            </div>
            
            {/* Home Button */}
            <button
              className="absolute top-4 right-4 p-2 bg-gray-800/70 rounded-lg transition-colors hover:bg-gray-700"
              onClick={() => {
                cameraRef.current?.position.set(cameraHomePos.x, cameraHomePos.y, cameraHomePos.z);
                controlsRef.current?.target.set(0, 0, 0);
              }}>
              <Home size={16} />
            </button>

            <div className="absolute bottom-2 right-4 text-s opacity-20">
              Fetch Time: {fetchTime} ms
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
