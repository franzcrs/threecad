/**
 * Filename: SearchResults.tsx
 * Author: Franz Chuquirachi
 * Created: 2024-12-16
 * Copyright © 2024 Franz Arthur Chuquirachi Rosales. All rights reserved.
 */

// import React from 'react';
import { FileWarning } from 'lucide-react'; // File warning icon
import { SearchResult } from '../utils/types'; // Importing the SearchResult type

// Properties that the SearchResults component receives
interface SearchResultsProps {
  results: SearchResult[];
  selectionHandler: (filename: string) => void;
}

// SearchResults component that displays the found elements in dropdown list 
const SearchResults = ({ results, selectionHandler }: SearchResultsProps) => {
  if (results.length === 0) {
    return (
      <div className="min-h-24 flex items-center justify-center text-gray-400">
        No results found. Try a different search term.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-700">
      {results.map((result) => (
        <div
          key={result.id}
          className="flex items-center p-4 hover:bg-gray-700 transition-colors duration-300"
          onClick={() => {selectionHandler(result.filename);}}
        >
          {result.preview ? (
            <img
              src={result.preview}
              alt={result.display_name}
              className="w-16 h-16 object-cover mr-4"
            />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-gray-800 mr-4">
              <FileWarning size={32} className="text-gray-600" />
            </div>
          )}
          <h3 className="text-lg font-semibold">{result.display_name}</h3>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
