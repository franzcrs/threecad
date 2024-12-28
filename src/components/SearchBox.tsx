/**
 * Filename: SearchBox.tsx
 * Author: Franz Chuquirachi
 * Created: 2024-12-16
 * Copyright © 2024 Franz Arthur Chuquirachi Rosales. All rights reserved.
 */

import React from 'react';
import { Search } from 'lucide-react'; // Typical search icon

// Properties that the SearchBox component receives
interface SearchBoxProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

// SearchBox component that displays a input box and a search icon
const SearchBox = ({ searchQuery, onSearchChange, onSubmit }: SearchBoxProps) => {
  return (
    <form id="search-form" onSubmit={onSubmit} className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search for 3D models..."
        className="w-full px-6 py-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
      >
        <Search size={24} />
      </button>
    </form>
  );
};

export default SearchBox;
