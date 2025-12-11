import React, { useState, useRef } from 'react';
import type { EssayImage } from '../types';

interface ImagePreviewListProps {
  images: EssayImage[];
  onReorder: (images: EssayImage[]) => void;
  onRemove: (id: number) => void;
  onEdit: (image: EssayImage) => void;
}

const DraggableImageItem: React.FC<{
  image: EssayImage;
  index: number;
  onDragStart: (e: React.DragEvent<HTMLLIElement>, index: number) => void;
  onDragEnter: (e: React.DragEvent<HTMLLIElement>, index: number) => void;
  onDragEnd: (e: React.DragEvent<HTMLLIElement>) => void;
  onRemove: (id: number) => void;
  onEdit: (image: EssayImage) => void;
}> = ({ image, index, onDragStart, onDragEnter, onDragEnd, onRemove, onEdit }) => {
  return (
    <li
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className="flex items-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-shadow duration-200"
    >
      <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center font-bold text-slate-600 text-lg mr-4">
        {index + 1}
      </div>
      <img
        src={`data:${image.mimeType};base64,${image.base64}`}
        alt={image.file.name}
        className="w-16 h-16 object-cover rounded-md border border-slate-300"
      />
      <div className="ml-4 flex-grow truncate">
        <p className="text-sm font-medium text-slate-800 truncate" title={image.file.name}>{image.file.name}</p>
        <p className="text-xs text-slate-500">{Math.round(image.file.size / 1024)} KB</p>
      </div>
      <button
        type="button"
        onClick={() => onEdit(image)}
        className="ml-2 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200"
        aria-label={`Edit ${image.file.name}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onRemove(image.id)}
        className="ml-1 p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors duration-200"
        aria-label={`Remove ${image.file.name}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </button>
    </li>
  );
};


export const ImagePreviewList: React.FC<ImagePreviewListProps> = ({ images, onReorder, onRemove, onEdit }) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    dragItem.current = index;
    setDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;
    if (dragItem.current !== null && dragItem.current !== dragOverItem.current) {
        const newImages = [...images];
        const draggedItemContent = newImages.splice(dragItem.current, 1)[0];
        newImages.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = dragOverItem.current;
        onReorder(newImages);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    dragItem.current = null;
    dragOverItem.current = null;
    setDragging(false);
  };

  return (
    <div className="space-y-4">
        <p className="text-sm text-slate-600">Drag to reorder pages. Use the edit button to crop or rotate an image.</p>
        <ul className="space-y-3">
        {images.map((image, index) => (
          <DraggableImageItem
            key={image.id}
            image={image}
            index={index}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
            onRemove={onRemove}
            onEdit={onEdit}
          />
        ))}
        </ul>
        {dragging && <div className="h-20 border-2 border-dashed border-blue-400 bg-blue-50 rounded-lg mt-3 flex items-center justify-center text-sm font-medium text-blue-600">Drop here to reorder</div>}
    </div>
  );
};