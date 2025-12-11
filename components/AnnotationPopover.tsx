import React, { useState, useEffect, useRef } from 'react';
import type { Improvement } from '../types';

interface AnnotationPopoverProps {
    targetRect: DOMRect;
    selectedText: string;
    onSave: (annotation: Omit<Improvement, 'id' | 'originalText' | 'source' | 'suggestions'> & { suggestions: string }) => void;
    onCancel: () => void;
}

export const AnnotationPopover: React.FC<AnnotationPopoverProps> = ({ targetRect, selectedText, onSave, onCancel }) => {
    const [category, setCategory] = useState<Improvement['category']>('Grammatical Range and Accuracy');
    const [issue, setIssue] = useState('');
    const [description, setDescription] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const popoverRef = useRef<HTMLDivElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            category,
            issue,
            description,
            suggestions: suggestion,
        });
    };

    // Close popover if clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onCancel();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onCancel]);

    const popoverStyle: React.CSSProperties = {
        position: 'absolute',
        top: `${window.scrollY + targetRect.top - 10}px`,
        left: `${window.scrollX + targetRect.left + (targetRect.width / 2)}px`,
        transform: 'translate(-50%, -100%)',
        zIndex: 50,
    };

    return (
        <div 
            ref={popoverRef}
            style={popoverStyle} 
            className="w-96 bg-white rounded-lg shadow-2xl border border-slate-300 p-4 animate-fade-in"
            onClick={e => e.stopPropagation()} // Prevent clicks inside from closing it
        >
            <div className="relative">
                 <button onClick={onCancel} className="absolute -top-2 -right-2 text-slate-400 hover:text-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
                <p className="text-sm font-semibold text-slate-800 mb-2">Add Annotation For:</p>
                <p className="text-sm bg-slate-100 p-2 rounded-md border border-slate-200 text-slate-600 italic">"{selectedText}"</p>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
                    <div>
                        <label htmlFor="category" className="block font-medium text-slate-700 mb-1">Category</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as Improvement['category'])}
                            className="w-full px-3 py-1.5 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option>Task Response</option>
                            <option>Coherence and Cohesion</option>
                            <option>Lexical Resource</option>
                            <option>Grammatical Range and Accuracy</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="issue" className="block font-medium text-slate-700 mb-1">Issue</label>
                        <input
                            type="text"
                            id="issue"
                            value={issue}
                            onChange={(e) => setIssue(e.target.value)}
                            placeholder="e.g., Incorrect Tense"
                            className="w-full px-3 py-1.5 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Explain the issue briefly"
                            rows={2}
                            className="w-full px-3 py-1.5 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="suggestion" className="block font-medium text-slate-700 mb-1">Suggestion</label>
                        <textarea
                            id="suggestion"
                            value={suggestion}
                            onChange={(e) => setSuggestion(e.target.value)}
                            placeholder="Provide the correction"
                             rows={2}
                            className="w-full px-3 py-1.5 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 transition duration-200"
                        >
                            Save Note
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};