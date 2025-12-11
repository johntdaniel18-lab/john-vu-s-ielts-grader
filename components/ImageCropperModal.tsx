
import React, { useRef, useEffect, useState } from 'react';
import type { EssayImage } from '../types';

// Since cropperjs is loaded from a script tag, we need to declare its type globally
declare var Cropper: any;

interface ImageCropperModalProps {
  image: EssayImage;
  onSave: (id: number, newDataUrl: string) => void;
  onCancel: () => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ image, onSave, onCancel }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<any>(null); // To hold the Cropper instance
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const imgElement = imageRef.current;
    if (imgElement && !cropperRef.current) {
      const cropper = new Cropper(imgElement, {
        aspectRatio: 0, // Free crop
        viewMode: 1,
        dragMode: 'move',
        background: false,
        autoCropArea: 0.8,
        ready: () => {
          setIsReady(true);
        },
      });
      cropperRef.current = cropper;
    }

    // Cleanup on component unmount
    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }
    };
  }, [image]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  const handleSave = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCroppedCanvas({
        imageSmoothingQuality: 'high',
      });
      if (canvas) {
        const newDataUrl = canvas.toDataURL(image.mimeType);
        onSave(image.id, newDataUrl);
      }
    }
  };
  
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex-shrink-0 z-10 relative bg-white">
          <h2 className="text-xl font-bold text-slate-800">Crop Image</h2>
          <p className="text-sm text-slate-500">Adjust the image as needed and save your changes.</p>
        </div>

        {/* Image Container - Grows to fill space, but contained */}
        <div className="flex-grow min-h-0 bg-slate-100 relative w-full overflow-hidden">
          <div className="w-full h-full absolute inset-0 p-4">
            <img
              ref={imageRef}
              src={`data:${image.mimeType};base64,${image.base64}`}
              alt="Crop target"
              className="opacity-0"
              style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>
        </div>
        
        {/* Toolbar - Scrollable on small screens */}
        {/* Always render this block to reserve space, but disable buttons if not ready */}
        <div className={`flex-shrink-0 flex flex-nowrap overflow-x-auto items-center justify-start md:justify-center gap-2 p-2 bg-slate-50 border-t border-slate-200 z-10 relative ${!isReady ? 'opacity-50 pointer-events-none' : ''}`}>
                <button disabled={!isReady} title="Zoom In" onClick={() => cropperRef.current?.zoom(0.1)} className="p-2 text-slate-600 hover:bg-slate-200 rounded-md flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg></button>
                <button disabled={!isReady} title="Zoom Out" onClick={() => cropperRef.current?.zoom(-0.1)} className="p-2 text-slate-600 hover:bg-slate-200 rounded-md flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg></button>
                <div className="w-px h-6 bg-slate-300 mx-1 flex-shrink-0"></div>
                <button disabled={!isReady} title="Rotate Left" onClick={() => cropperRef.current?.rotate(-45)} className="p-2 text-slate-600 hover:bg-slate-200 rounded-md flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg></button>
                <button disabled={!isReady} title="Rotate Right" onClick={() => cropperRef.current?.rotate(45)} className="p-2 text-slate-600 hover:bg-slate-200 rounded-md flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" /><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></button>
                <div className="w-px h-6 bg-slate-300 mx-1 flex-shrink-0"></div>
                <button disabled={!isReady} title="Flip Horizontal" onClick={() => cropperRef.current?.scaleX(-(cropperRef.current?.getData().scaleX || -1))} className="p-2 text-slate-600 hover:bg-slate-200 rounded-md flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.074 6.81 5 7 5c.22 0 .423.056.598.122a2.98 2.98 0 01.452.261C8.901 5.86 9.42 6.555 10 7.446c.58-1.023 1.099-1.718 1.95-2.063a2.98 2.98 0 01.452-.261C12.577 5.056 12.78 5 13 5c.19 0 .488.074 .756.321a6.012 6.012 0 011.912 2.706C15.938 8.352 16 8.67 16 9c0 .33-.062.648-.244.973a6.012 6.012 0 01-1.912 2.706C13.488 12.926 13.19 13 13 13c-.22 0-.423-.056-.598-.122a2.98 2.98 0 01-.452-.261C11.099 12.14 10.58 11.445 10 10.554c-.58 1.023-1.099 1.718-1.95 2.063a2.98 2.98 0 01-.452.261C7.423 12.944 7.22 13 7 13c-.19 0-.488-.074-.756-.321a6.012 6.012 0 01-1.912-2.706C4.062 9.648 4 9.33 4 9c0-.33.062-.648.244-.973z" clipRule="evenodd" /></svg></button>
                <button disabled={!isReady} title="Flip Vertical" onClick={() => cropperRef.current?.scaleY(-(cropperRef.current?.getData().scaleY || -1))} className="p-2 text-slate-600 hover:bg-slate-200 rounded-md flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.074 6.81 5 7 5c.22 0 .423.056.598.122a2.98 2.98 0 01.452.261C8.901 5.86 9.42 6.555 10 7.446c.58-1.023 1.099-1.718 1.95-2.063a2.98 2.98 0 01.452-.261C12.577 5.056 12.78 5 13 5c.19 0 .488.074 .756.321a6.012 6.012 0 011.912 2.706C15.938 8.352 16 8.67 16 9c0 .33-.062.648-.244.973a6.012 6.012 0 01-1.912 2.706C13.488 12.926 13.19 13 13 13c-.22 0-.423-.056-.598-.122a2.98 2.98 0 01-.452-.261C11.099 12.14 10.58 11.445 10 10.554c-.58 1.023-1.099 1.718-1.95 2.063a2.98 2.98 0 01-.452.261C7.423 12.944 7.22 13 7 13c-.19 0-.488-.074-.756-.321a6.012 6.012 0 01-1.912-2.706C4.062 9.648 4 9.33 4 9c0-.33.062-.648.244-.973z" clipRule="evenodd" /></svg></button>
                <div className="w-px h-6 bg-slate-300 mx-1 flex-shrink-0"></div>
                <button disabled={!isReady} title="Reset" onClick={() => cropperRef.current?.reset()} className="p-2 text-slate-600 hover:bg-slate-200 rounded-md flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg></button>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg space-x-3 z-10 relative">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white text-slate-700 font-semibold border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isReady}
            className="px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            Save Crop
          </button>
        </div>
      </div>
    </div>
  );
};
