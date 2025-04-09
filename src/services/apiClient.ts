/**
 * Filename: apiClient.ts
 * Author: Franz Chuquirachi
 * Created: 2024-12-16
 * Copyright © 2024 Franz Arthur Chuquirachi Rosales. All rights reserved.
 */

import { SearchResult } from '../utils/types';

// const API_BASE_URL = 'http://127.0.0.1:5000'; // Flask server defined URL and port
let apiUrl = import.meta.env.PROD
  ? window.location.origin
  : 'http://127.0.0.1:5000'; // Flask server defined URL and port in development
// if (apiUrl.endsWith("/")) apiUrl = apiUrl.slice(0, -1);
const API_BASE_URL = apiUrl; // Define the API URL based on the current window URL
console.log('API_BASE_URL:', API_BASE_URL);

// Asynchronous API request to fetch results for the query string
export const searchModels = async (query: string): Promise<SearchResult[]> => {
  try {
    console.log(`Fetch: ${API_BASE_URL}/search?query=${query}`);
    const response = await fetch(`${API_BASE_URL}/search?query=${query}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );
    if (!response.ok) {
      throw new Error('Search request failed');
    }
    const results: SearchResult[] = await response.json();
    if (results.length > 0) {
      results.forEach(result => {
        if (result.preview) {
          result.preview = `${API_BASE_URL}${result.preview}`;
        }
      });
    }
    return results;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
};

// Asynchronous API request to fetch the model file
export const fetchModel = async (modelFilename: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    console.log(`Fetch: ${API_BASE_URL}/file/${modelFilename}`);
    fetch(`${API_BASE_URL}/file/${modelFilename}`, 
      {
        method: 'GET',
        credentials: 'include',
      }
    )
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error fetching model: ${response.statusText}`);
        }
        return response.blob();
      })
      .then(blob => resolve(blob))
      .catch(error => {
        console.error('Model fetch error:', error);
        reject(error);
      });
  });
};