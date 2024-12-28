/**
 * Filename: TabButton.tsx
 * Author: Franz Chuquirachi
 * Created: 2024-12-19
 * Copyright © 2024 Franz Arthur Chuquirachi Rosales. All rights reserved.
 */

import { LucideIcon } from 'lucide-react';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}

// TabButton component that displays a button with an icon and a label
const TabButton = ({ active, onClick, icon: Icon, label }: TabButtonProps) => {
  return (
    <button
      className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
        active
          ? 'text-blue-400 border-b-2 border-blue-400'
          : 'text-gray-400 hover:text-gray-300'
      }`}
      onClick={onClick}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

export default TabButton;