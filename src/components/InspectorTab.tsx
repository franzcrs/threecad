/**
 * Filename: InspectorTab.tsx
 * Author: Franz Chuquirachi
 * Created: 2024-12-19
 * Copyright © 2024 Franz Arthur Chuquirachi Rosales. All rights reserved.
 */

import React from 'react';
import { Model } from '../utils/types';
import { Plus } from 'lucide-react'

// Properties that the InspectorTab component receives
interface InspectorTabProps {
  models: Model[];
  activeModel: Model | null;
  onModelSelect: (model: Model, renderFetchtime: number) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}

// InspectorTab component that displays a list of models
const InspectorTab = ({
  models,
  activeModel,
  onModelSelect,
  onDrop,
  onDragOver
}: InspectorTabProps) => {
  return (
    <div
      className="h-full"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {models.length === 0 && (
        <div className="mb-4 p-4 border-2 border-dashed rounded-lg text-center transition-colors border-gray-700 text-gray-400 hover:border-blue-500/50 hover:text-blue-400">
          Drag and drop STL files here
        </div>
      )}
      <div className="space-y-2">
      {models.map((model, index) => (
        <button
          key={index}
          className={`w-full px-4 py-2 text-left rounded-lg ${activeModel === model
              ? 'bg-blue-500/20 text-blue-400'
              : 'text-gray-400 hover:bg-gray-700'
            }`}
          onClick={() => onModelSelect(model, 0)}
        >
          {model.name}
        </button>
      ))}
      {models.length >= 1 && (
        <div className="mb-4 p-4 border-2 border-dashed rounded-lg text-center transition-colors border-gray-700 text-gray-400 hover:border-blue-500/50 hover:text-blue-400">
          <Plus className="mx-auto text-gray-400" />
        </div>
      )}
      </div>
      
    </div>
  );
}

export default InspectorTab;