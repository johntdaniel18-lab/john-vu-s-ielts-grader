
import React from 'react';
import type { Improvement } from '../types';

interface HighlightedFeedbackProps {
    studentAnswer: string;
    improvements: Improvement[];
    selectedImprovement: Improvement | null;
    onHighlightClick: (improvement: Improvement) => void;
    onTextSelect: () => void;
}

const getHighlightClasses = (improvement: Improvement, selectedImprovement: Improvement | null): string => {
    const isSelected = selectedImprovement === improvement;
    // Modern highlight style: subtle background, strong bottom border. 
    const baseClasses = 'cursor-pointer rounded-t-md px-1 py-0.5 transition-all duration-200 border-b-[3px] decoration-clone';

    // Unified Theme: Indigo (Professional & Clean)
    // We ignore the category for the color to reduce visual noise.
    
    if (isSelected) {
        // Active State: Deep Indigo background, dark text, shadow
        return `${baseClasses} border-indigo-600 bg-indigo-100 text-indigo-900 font-semibold shadow-sm ring-2 ring-indigo-500/20`;
    } else {
        // Inactive State: Very subtle Indigo wash, distinct border
        return `${baseClasses} border-indigo-200 bg-indigo-50/50 text-slate-700 hover:bg-indigo-100 hover:border-indigo-400`;
    }
};


export const HighlightedFeedback: React.FC<HighlightedFeedbackProps> = ({ studentAnswer, improvements, selectedImprovement, onHighlightClick, onTextSelect }) => {
    
    const createHighlightedText = () => {
        if (!improvements || improvements.length === 0) {
            return studentAnswer;
        }

        let matches: { start: number; end: number; improvement: Improvement }[] = [];
        const sortedImprovements = [...improvements].sort((a, b) => b.originalText.length - a.originalText.length);

        sortedImprovements.forEach(improvement => {
            const needle = improvement.originalText;
            if (!needle) return;
            let startIndex = 0;
            let index;
            while ((index = studentAnswer.indexOf(needle, startIndex)) > -1) {
                const endIndex = index + needle.length;
                
                const isOverlapping = matches.some(match => (index < match.end && endIndex > match.start));
                
                if (!isOverlapping) {
                    matches.push({ start: index, end: endIndex, improvement });
                }
                startIndex = index + 1;
            }
        });

        matches.sort((a, b) => a.start - b.start);

        const result: React.ReactNode[] = [];
        let lastIndex = 0;
        matches.forEach((match, i) => {
            if (match.start > lastIndex) {
                result.push(studentAnswer.substring(lastIndex, match.start));
            }
            result.push(
                <span
                    key={`match-${i}`}
                    className={getHighlightClasses(match.improvement, selectedImprovement)}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent onTextSelect from firing when clicking a highlight
                        onHighlightClick(match.improvement);
                    }}
                >
                    {studentAnswer.substring(match.start, match.end)}
                </span>
            );
            lastIndex = match.end;
        });

        if (lastIndex < studentAnswer.length) {
            result.push(studentAnswer.substring(lastIndex));
        }

        return result.map((node, index) => <React.Fragment key={index}>{node}</React.Fragment>);
    };

    return (
        <div className="relative group">
            {/* Glass Panel Container */}
            <div 
              className="glass-panel p-8 rounded-3xl shadow-xl border border-white/60 whitespace-pre-wrap text-lg leading-loose text-slate-800 transition-all duration-300"
              onMouseUp={onTextSelect}
            >
                {createHighlightedText()}
            </div>
        </div>
    );
};
