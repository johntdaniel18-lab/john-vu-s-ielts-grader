
import React, { useState, useEffect } from 'react';
import type { Improvement } from '../types';

interface FeedbackSidebarProps {
    improvement: Improvement | null;
    onUpdate: (improvement: Improvement) => void;
}

const SuggestionText: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(~~.*?~~|\*\*.*?\*\*)/g).filter(Boolean);

    return (
        <div className="text-[15px] leading-relaxed text-slate-700 font-medium">
            {parts.map((part, i) => {
                if (part.startsWith('~~') && part.endsWith('~~')) {
                    // Original text (Deleted) - Updated to faint red for better error visibility
                    return (
                        <span 
                            key={i} 
                            className="inline-block text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md mx-1"
                            title="Original Content"
                        >
                            {part.slice(2, -2)}
                        </span>
                    );
                }
                if (part.startsWith('**') && part.endsWith('**')) {
                    // New suggestion (Added) - Unified Theme: Indigo (New/Active)
                    // Removed bold, same font/weight as requested
                    return (
                        <span 
                            key={i} 
                            className="inline-block text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md mx-1"
                            title="Suggestion"
                        >
                            {part.slice(2, -2)}
                        </span>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </div>
    );
};


export const FeedbackSidebar: React.FC<FeedbackSidebarProps> = ({ improvement, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedCategory, setEditedCategory] = useState<Improvement['category']>('Grammatical Range and Accuracy');
    const [editedIssue, setEditedIssue] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedSuggestions, setEditedSuggestions] = useState('');
    
    useEffect(() => {
        // When a new improvement is selected, exit editing mode
        setIsEditing(false);
    }, [improvement]);

    const handleEditClick = () => {
        if (!improvement) return;
        setEditedCategory(improvement.category);
        setEditedIssue(improvement.issue);
        setEditedDescription(improvement.description);
        setEditedSuggestions(improvement.suggestions.join('\n'));
        setIsEditing(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!improvement) return;
        
        const updatedImprovement: Improvement = {
            ...improvement,
            category: editedCategory,
            issue: editedIssue,
            description: editedDescription,
            suggestions: editedSuggestions.split('\n').filter(s => s.trim() !== ''),
        };
        onUpdate(updatedImprovement);
        setIsEditing(false);
    };

    // Shared input styles matching the global futuristic theme
    const inputClasses = "w-full px-4 py-2.5 bg-white/60 border border-slate-200/60 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm shadow-sm text-sm";
    const labelClasses = "block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1";

    // Helper to get Icon and Initials for the compact design
    const getCategoryConfig = (category: Improvement['category']) => {
        switch (category) {
            case 'Task Response':
                return {
                    initials: 'TR',
                    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                };
            case 'Coherence and Cohesion':
                return {
                    initials: 'CC',
                    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                };
            case 'Lexical Resource':
                return {
                    initials: 'LR',
                    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                };
            case 'Grammatical Range and Accuracy':
                return {
                    initials: 'GRA',
                    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                };
            default:
                return {
                    initials: 'N/A',
                    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                };
        }
    };

    if (!improvement) {
        return (
            <div className="sticky top-28 glass-panel p-8 h-[32rem] flex flex-col items-center justify-center rounded-3xl border border-white/60 text-center text-slate-500 shadow-lg">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                </div>
                <p className="font-bold text-lg text-slate-700">No Selection</p>
                <p className="text-sm mt-2 max-w-[200px] leading-relaxed opacity-80">Click the highlighted blocks in the essay to view the AI analysis.</p>
            </div>
        );
    }

    const catConfig = getCategoryConfig(improvement.category);
    
    return (
        <div className="sticky top-28 glass-panel p-6 rounded-3xl shadow-xl border border-white/60 animate-fade-in backdrop-blur-xl">
            {isEditing ? (
                 <form onSubmit={handleSave} className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-slate-800">Edit Feedback</h3>
                    </div>
                    <div>
                        <label htmlFor="edit-category" className={labelClasses}>Category</label>
                        <select
                            id="edit-category"
                            value={editedCategory}
                            onChange={(e) => setEditedCategory(e.target.value as Improvement['category'])}
                            className={inputClasses}
                        >
                            <option>Task Response</option>
                            <option>Coherence and Cohesion</option>
                            <option>Lexical Resource</option>
                            <option>Grammatical Range and Accuracy</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="edit-issue" className={labelClasses}>Issue</label>
                        <input
                            type="text"
                            id="edit-issue"
                            value={editedIssue}
                            onChange={(e) => setEditedIssue(e.target.value)}
                            className={inputClasses}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-description" className={labelClasses}>Description</label>
                        <textarea
                            id="edit-description"
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            rows={3}
                            className={inputClasses}
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="edit-suggestion" className={labelClasses}>Suggestions (one per line)</label>
                        <textarea
                            id="edit-suggestion"
                            value={editedSuggestions}
                            onChange={(e) => setEditedSuggestions(e.target.value)}
                             rows={3}
                            className={`${inputClasses} font-mono text-xs`}
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                         <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 bg-white text-slate-600 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition duration-200 text-sm shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition duration-200 text-sm"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    {/* Compact Header with Icon and Initials */}
                    <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-3" title={improvement.category}>
                             {/* Icon Box matching CriterionCard */}
                             <div className="text-blue-500 bg-blue-50 p-2.5 rounded-xl border border-blue-100/50">
                                {catConfig.icon}
                             </div>
                             {/* Initials Text */}
                             <div>
                                <span className="text-xl font-extrabold text-slate-700 tracking-tight">{catConfig.initials}</span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Criterion</p>
                             </div>
                         </div>

                         {/* Actions */}
                         <div className="flex items-center space-x-1 bg-white/50 rounded-lg p-1 border border-white/40">
                                 <button 
                                    onClick={handleEditClick} 
                                    className="text-slate-400 hover:text-blue-600 hover:bg-white transition-all p-1.5 rounded-md"
                                    title="Edit"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <div className="w-px h-3 bg-slate-300"></div>
                                <button className="text-slate-400 hover:text-red-600 hover:bg-white transition-all p-1.5 rounded-md cursor-not-allowed opacity-50" title="Delete (Disabled)">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                        </div>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-800 mb-6 leading-snug">
                        {improvement.issue}
                    </h3>

                    <div className="pl-4 border-l-[3px] border-indigo-200 mb-8 relative">
                        <p className="text-slate-600 leading-7 text-[1.05rem]">
                            {improvement.description}
                        </p>
                    </div>

                    <h4 className="font-bold text-slate-800 mb-4 text-base">Gợi ý:</h4>
                    
                    <ul className="space-y-3">
                        {improvement.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex overflow-hidden rounded-lg bg-slate-50 border border-slate-100/80 shadow-sm transition-shadow hover:shadow-md">
                                {/* Unified Indigo Gradient Stripe */}
                                <div className="w-1.5 bg-gradient-to-b from-indigo-500 to-blue-600 flex-shrink-0"></div>
                                <div className="flex-grow p-4">
                                     <SuggestionText text={suggestion} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};
