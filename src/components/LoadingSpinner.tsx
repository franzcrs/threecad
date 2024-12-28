/**
 * Filename: LoadingSpinner.tsx
 * Author: Franz Chuquirachi
 * Created: 2024-12-16
 * Copyright © 2024 Franz Arthur Chuquirachi Rosales. All rights reserved.
 */

import { Loader2 } from 'lucide-react'; // Icon of a loading spinner

// LoadingSpinner component
const LoadingSpinner = () => {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );
};

export default LoadingSpinner;