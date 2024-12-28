/**
 * Filename: types.ts
 * Author: Franz Chuquirachi
 * Created: 2024-12-19
 * Copyright © 2024 Franz Arthur Chuquirachi Rosales. All rights reserved.
 */

import * as THREE from 'three';

// Type that defines the structure of a 3D model object in the application
export interface Model {
  name: string;
  geometry: THREE.BufferGeometry;
}

// Type that defines the structure of a search result object from the API
export interface SearchResult {
  id: string;
  display_name: string;
  preview: string | null;
  filename: string;
}