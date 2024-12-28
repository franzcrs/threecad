/**
 * Filename: Header.tsx
 * Author: Franz Chuquirachi
 * Created: 2024-12-16
 * Copyright © 2024 Franz Arthur Chuquirachi Rosales. All rights reserved.
 */

import React from 'react';
import { Box } from 'lucide-react'; // Icon of a cube

// Header component that displays the app name in an stylized way and a subtitle
const Header = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Box size={40} className="text-blue-500" />
        
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
          ThreeCAD
        </h1>
      </div>
      <p className="text-xl text-gray-400">by Franz Chuquirachi</p>
    </div>
  );
};

export default Header;