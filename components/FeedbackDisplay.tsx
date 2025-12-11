
import React, { useState, useEffect, useRef } from 'react';
import type { Feedback, FeedbackCriterion, Improvement } from '../types';
import { HighlightedFeedback } from './HighlightedFeedback';
import { FeedbackSidebar } from './FeedbackSidebar';
import { ScoreGauge } from './ScoreGauge';
import type { TaskType } from '../types';

declare const jspdf: any;


const CriterionIcon: React.FC<{ title: string }> = ({ title }) => {
    const icons: { [key: string]: React.ReactNode } = {
        'Task Response': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
        'Coherence and Cohesion': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>,
        'Lexical Resource': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
        'Grammatical Range and Accuracy': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>,
    };
    return icons[title] || null;
};

const CriterionCard: React.FC<{ title: string; data: FeedbackCriterion; onScoreChange: (newScore: number) => void }> = ({ title, data, onScoreChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditingScore, setIsEditingScore] = useState(false);
    const [editedScore, setEditedScore] = useState(data.band);

    const handleScoreSave = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onScoreChange(editedScore);
        setIsEditingScore(false);
    };

    return (
        <div 
            className="glass-panel p-6 rounded-3xl shadow-sm border border-white/60 transition-all duration-300 hover:shadow-xl"
            aria-expanded={isExpanded}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="text-blue-500 bg-blue-50 p-2 rounded-xl">{CriterionIcon({ title })}</div>
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                    {isEditingScore ? (
                        <form onSubmit={handleScoreSave}>
                            <input 
                                type="number"
                                value={editedScore}
                                onChange={(e) => setEditedScore(parseFloat(e.target.value))}
                                onBlur={(e) => handleScoreSave(e)}
                                min="0"
                                max="9"
                                step="0.5"
                                className="w-20 text-center font-bold text-lg bg-white/50 text-slate-900 border border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                            />
                        </form>
                    ) : (
                        <span className="text-2xl font-extrabold text-slate-800 bg-slate-100/80 px-4 py-1.5 rounded-xl border border-slate-200">{data.band.toFixed(1)}</span>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setIsEditingScore(!isEditingScore); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        aria-hidden="true"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {isExpanded && (
                <div className="mt-6 pt-6 border-t border-slate-200/50 animate-fade-in">
                    <p className="text-slate-600 italic mb-4 bg-white/40 p-3 rounded-lg border border-white/50">"{data.comment}"</p>
                    <ul className="space-y-3">
                        {data.details.map((detail, index) => (
                            <li key={index} className="flex items-start text-slate-700">
                                <span className="mr-2 text-blue-500 mt-1">•</span>
                                <span>{detail}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

interface FeedbackDisplayProps {
    feedback: Feedback;
    studentAnswer: string;
    question: string;
    studentName: string;
    classNameVal: string;
    teacherName: string;
    centerName: string;
    isLoading: boolean;
    onScoreChange: (criterion: keyof Feedback['feedback'], newBand: number) => void;
    onImprovementUpdate: (improvement: Improvement) => void;
    onTextSelect: () => void;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ 
    feedback, 
    studentAnswer, 
    question, 
    studentName, 
    classNameVal, 
    teacherName, 
    centerName, 
    isLoading,
    onScoreChange,
    onImprovementUpdate,
    onTextSelect,
}) => {
    const [selectedImprovement, setSelectedImprovement] = useState<Improvement | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    const handleHighlightClick = (improvement: Improvement) => {
        setSelectedImprovement(improvement);
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const getSafeFilename = () => studentName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'student';

    const triggerDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleCopyForLMS = () => {
        setIsExportMenuOpen(false);
        
        let summary = `✨ IELTS WRITING FEEDBACK SUMMARY ✨\n`;
        summary += `----------------------------------------\n`;
        summary += `👤 Student: ${studentName}\n`;
        summary += `📚 Class: ${classNameVal}\n`;
        summary += `📅 Date: ${new Date().toLocaleDateString()}\n\n`;
        
        summary += `🏆 OVERALL BAND: ${feedback.overallBand.toFixed(1)}\n`;
        summary += `----------------------------------------\n`;
        
        summary += `📊 CRITERIA BREAKDOWN:\n`;
        summary += `• Task Response: ${feedback.feedback.taskResponse.band.toFixed(1)}\n  ${feedback.feedback.taskResponse.comment}\n\n`;
        summary += `• Coherence & Cohesion: ${feedback.feedback.coherenceCohesion.band.toFixed(1)}\n  ${feedback.feedback.coherenceCohesion.comment}\n\n`;
        summary += `• Lexical Resource: ${feedback.feedback.lexicalResource.band.toFixed(1)}\n  ${feedback.feedback.lexicalResource.comment}\n\n`;
        summary += `• Grammatical Range: ${feedback.feedback.grammaticalRangeAccuracy.band.toFixed(1)}\n  ${feedback.feedback.grammaticalRangeAccuracy.comment}\n\n`;

        if (feedback.improvements.length > 0) {
            summary += `📝 TOP IMPROVEMENT SUGGESTIONS:\n`;
            feedback.improvements.forEach((imp, i) => {
                 const cleanSuggestions = imp.suggestions.map(s => {
                    // Convert diff format ~~old~~ **new** to "old => new"
                    let processed = s.replace(/~~(.*?)~~\s*\*\*(.*?)\*\*/g, '$1 => $2');
                    // Remove remaining markers
                    processed = processed.replace(/~~/g, '').replace(/\*\*/g, '');
                    return processed;
                 }).join(' OR ');
                 
                 summary += `${i+1}. "${imp.originalText}"\n   👉 Lỗi: ${imp.issue} (${imp.category})\n   💡 Gợi ý: ${cleanSuggestions}\n\n`;
            });
        } else {
             summary += `📝 No specific text corrections were noted.\n\n`;
        }
        
        summary += `👨‍🏫 Teacher: ${teacherName} | ${centerName}\n`;
        summary += `----------------------------------------`;

        navigator.clipboard.writeText(summary).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    const handleExportTXT = () => {
        setIsExportMenuOpen(false);
        let reportContent = `IELTS WRITING FEEDBACK REPORT\n`;
        reportContent += `=============================\n\n`;
        if (teacherName) reportContent += `Teacher: ${teacherName}\n`;
        if (centerName) reportContent += `Center: ${centerName}\n\n`;
        reportContent += `--- STUDENT INFORMATION ---\n`;
        if (studentName) reportContent += `Student Name: ${studentName}\n`;
        if (classNameVal) reportContent += `Class: ${classNameVal}\n`;
        reportContent += `\n`;
        reportContent += `-----------------------------\n`;
        reportContent += `QUESTION\n`;
        reportContent += `-----------------------------\n`;
        reportContent += `${question}\n\n`;
        reportContent += `-----------------------------\n`;
        reportContent += `STUDENT'S ANSWER\n`;
        reportContent += `-----------------------------\n`;
        reportContent += `${studentAnswer}\n\n`;
        reportContent += `=============================\n`;
        reportContent += `AI FEEDBACK & ANALYSIS\n`;
        reportContent += `=============================\n\n`;
        reportContent += `Overall Band Score: ${feedback.overallBand.toFixed(1)}\n\n`;
        reportContent += `--- DETAILED CRITERIA ANALYSIS ---\n\n`;

        const criteria: { title: string, data: FeedbackCriterion }[] = [
            { title: 'Task Response', data: feedback.feedback.taskResponse },
            { title: 'Coherence and Cohesion', data: feedback.feedback.coherenceCohesion },
            { title: 'Lexical Resource', data: feedback.feedback.lexicalResource },
            { title: 'Grammatical Range and Accuracy', data: feedback.feedback.grammaticalRangeAccuracy },
        ];
        criteria.forEach(({ title, data }) => {
            reportContent += `${title}: ${data.band.toFixed(1)}\n`;
            reportContent += `Comment: ${data.comment}\n`;
            reportContent += `Details:\n`;
            data.details.forEach(detail => { reportContent += `  - ${detail}\n`; });
            reportContent += `\n`;
        });
        reportContent += `--- ANNOTATED IMPROVEMENT SUGGESTIONS ---\n\n`;
        if (feedback.improvements.length > 0) {
            feedback.improvements.forEach((imp, index) => {
                const source = imp.source === 'Teacher' ? ' (Teacher)' : '';
                reportContent += `${index + 1}. Original Text: "${imp.originalText}"\n`;
                reportContent += `   Issue: ${imp.issue} (${imp.category})${source}\n`;
                reportContent += `   Description: ${imp.description}\n`;
                reportContent += `   Suggestions:\n`;
                imp.suggestions.forEach(sugg => {
                    const cleanSugg = sugg.replace(/~~/g, '').replace(/\*\*/g, '');
                    reportContent += `     - ${cleanSugg}\n`;
                });
                reportContent += `\n`;
            });
        } else {
            reportContent += `No specific text improvement suggestions were proposed.\n`;
        }
        
        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        triggerDownload(blob, `ielts_feedback_report_${getSafeFilename()}.txt`);
    };

    const handleExportPDF = () => {
        setIsExportMenuOpen(false);
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15;
        let y = 20;

        const checkPageBreak = (neededHeight: number) => {
            if (y + neededHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('IELTS Writing Feedback Report', doc.internal.pageSize.width / 2, y, { align: 'center' });
        y += 15;

        // Info
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Student: ${studentName}`, margin, y);
        doc.text(`Class: ${classNameVal}`, margin, y + 5);
        doc.text(`Teacher: ${teacherName}`, doc.internal.pageSize.width - margin, y, { align: 'right' });
        doc.text(`Center: ${centerName}`, doc.internal.pageSize.width - margin, y + 5, { align: 'right' });
        y += 15;
        doc.line(margin, y, doc.internal.pageSize.width - margin, y); // Separator
        y += 10;

        // Overall Score
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Overall Band Score', margin, y);
        doc.setFontSize(22);
        doc.text(feedback.overallBand.toFixed(1), doc.internal.pageSize.width - margin, y, { align: 'right' });
        y += 15;

        // Criteria
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Detailed Criteria Analysis', margin, y);
        y += 8;

        const criteria = [
            { title: 'Task Response', data: feedback.feedback.taskResponse },
            { title: 'Coherence and Cohesion', data: feedback.feedback.coherenceCohesion },
            { title: 'Lexical Resource', data: feedback.feedback.lexicalResource },
            { title: 'Grammatical Range and Accuracy', data: feedback.feedback.grammaticalRangeAccuracy },
        ];

        criteria.forEach(({ title, data }) => {
            checkPageBreak(30); // Estimate needed space
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${title}: ${data.band.toFixed(1)}`, margin, y);
            y += 6;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            const commentLines = doc.splitTextToSize(`"${data.comment}"`, doc.internal.pageSize.width - margin * 2);
            checkPageBreak(commentLines.length * 5);
            doc.text(commentLines, margin, y);
            y += commentLines.length * 5;

            doc.setFont('helvetica', 'normal');
            data.details.forEach(detail => {
                const detailLines = doc.splitTextToSize(`- ${detail}`, doc.internal.pageSize.width - margin * 2 - 5);
                checkPageBreak(detailLines.length * 5);
                doc.text(detailLines, margin + 5, y);
                y += detailLines.length * 5 + 1;
            });
            y += 5;
        });

        // Improvements
        doc.addPage();
        y = margin;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Annotated Improvement Suggestions', margin, y);
        y += 10;

        feedback.improvements.forEach((imp, index) => {
            const source = imp.source === 'Teacher' ? ' (Teacher)' : '';
            checkPageBreak(40); // Estimate
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. "${imp.originalText}"`, margin, y);
            y += 6;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Issue: ${imp.issue} (${imp.category})${source}`, margin + 5, y);
            y += 5;

            const descLines = doc.splitTextToSize(`Description: ${imp.description}`, doc.internal.pageSize.width - margin * 2 - 5);
            checkPageBreak(descLines.length * 5);
            doc.text(descLines, margin + 5, y);
            y += descLines.length * 5;

            doc.text('Suggestions:', margin + 5, y);
            y += 5;
            imp.suggestions.forEach(sugg => {
                const cleanSugg = sugg.replace(/~~/g, '').replace(/\*\*/g, '');
                const suggLines = doc.splitTextToSize(`- ${cleanSugg}`, doc.internal.pageSize.width - margin * 2 - 10);
                checkPageBreak(suggLines.length * 5);
                doc.text(suggLines, margin + 10, y);
                y += suggLines.length * 5;
            });
            y += 8;
        });

        doc.save(`ielts_feedback_report_${getSafeFilename()}.pdf`);
    };

    const handleExportCSV = () => {
        setIsExportMenuOpen(false);
        const escapeCsvCell = (cell: string | number) => {
            const str = String(cell);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        let csvContent = "Category,Field,Value\n";
        const addRow = (cat: string, field: string, value: string | number) => {
            csvContent += `${escapeCsvCell(cat)},${escapeCsvCell(field)},${escapeCsvCell(value)}\n`;
        };

        addRow("Report Info", "Student Name", studentName);
        addRow("Report Info", "Class Name", classNameVal);
        addRow("Report Info", "Teacher Name", teacherName);
        addRow("Report Info", "Center Name", centerName);
        csvContent += "\n";
        addRow("Overall Score", "Band", feedback.overallBand.toFixed(1));
        csvContent += "\n";
        
        csvContent += "Criterion,Band,Comment,Details\n";
        const criteria = [
            { title: 'Task Response', data: feedback.feedback.taskResponse },
            { title: 'Coherence and Cohesion', data: feedback.feedback.coherenceCohesion },
            { title: 'Lexical Resource', data: feedback.feedback.lexicalResource },
            { title: 'Grammatical Range and Accuracy', data: feedback.feedback.grammaticalRangeAccuracy },
        ];
        criteria.forEach(({title, data}) => {
            const details = data.details.join('; ');
            csvContent += `${escapeCsvCell(title)},${escapeCsvCell(data.band)},${escapeCsvCell(data.comment)},${escapeCsvCell(details)}\n`;
        });
        csvContent += "\n";

        csvContent += "ID,Original Text,Category,Issue,Description,Suggestions,Source\n";
        feedback.improvements.forEach(imp => {
            const suggestions = imp.suggestions.map(s => s.replace(/~~/g, '').replace(/\*\*/g, '')).join('; ');
            const row = [imp.id, imp.originalText, imp.category, imp.issue, imp.description, suggestions, imp.source].map(escapeCsvCell).join(',');
            csvContent += `${row}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        triggerDownload(blob, `ielts_feedback_data_${getSafeFilename()}.csv`);
    };

    const handleExportHTML = () => {
        setIsExportMenuOpen(false);
        
        // Unified Category Class for HTML Export
        const getCategoryClass = (category: Improvement['category']) => {
            // All categories return the unified 'default-theme' class
            return 'unified-theme';
        };

        const generateHighlightedEssayHTML = (): string => {
            if (!feedback.improvements || feedback.improvements.length === 0) {
                return studentAnswer.replace(/\n/g, '<br />');
            }

            let matches: { start: number; end: number; improvement: Improvement }[] = [];
            const sortedImprovements = [...feedback.improvements].sort((a, b) => b.originalText.length - a.originalText.length);

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

            let resultHTML = '';
            let lastIndex = 0;
            matches.forEach(match => {
                if (match.start > lastIndex) {
                    resultHTML += studentAnswer.substring(lastIndex, match.start);
                }
                resultHTML += `<span class="highlight ${getCategoryClass(match.improvement.category)}">${studentAnswer.substring(match.start, match.end)}</span>`;
                lastIndex = match.end;
            });

            if (lastIndex < studentAnswer.length) {
                resultHTML += studentAnswer.substring(lastIndex);
            }
            
            return resultHTML.replace(/\n/g, '<br />');
        };
        
        const generateImprovementsListHTML = (): string => {
            if (!feedback.improvements || feedback.improvements.length === 0) {
                return '<p>No specific improvement suggestions were generated.</p>';
            }
            return `
                <ul>
                    ${feedback.improvements.map(imp => `
                        <li class="improvement-item ${getCategoryClass(imp.category)}">
                            <p><strong>Original Text:</strong> <span class="original-text">"${imp.originalText}"</span></p>
                            <p><strong>Issue:</strong> <span class="issue-tag ${getCategoryClass(imp.category)}">${imp.issue} (${imp.category})</span></p>
                            <p><strong>Description:</strong> ${imp.description}</p>
                            <strong>Suggestions:</strong>
                            <ul>
                                ${imp.suggestions.map(sugg => `<li>${sugg.replace(/~~(.*?)~~/g, '<del>$1</del>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}
                            </ul>
                        </li>
                    `).join('')}
                </ul>
            `;
        };
        
        const getScoreClass = (score: number) => {
            if (score >= 7.5) return 'high';
            if (score >= 6.0) return 'medium-high';
            if (score >= 4.5) return 'medium-low';
            return 'low';
        };
        const overallScoreClass = getScoreClass(feedback.overallBand);
        const scoreGaugeHTML = `
            <div class="score-gauge ${overallScoreClass}">
                <div class="score-value ${overallScoreClass}">${feedback.overallBand.toFixed(1)}</div>
                <div class="score-label">Overall Band</div>
            </div>
        `;

        const generateCriteriaHTML = (): string => {
            const criteria: { title: string; data: FeedbackCriterion; category: Improvement['category'] }[] = [
                { title: 'Task Response', data: feedback.feedback.taskResponse, category: 'Task Response' },
                { title: 'Coherence and Cohesion', data: feedback.feedback.coherenceCohesion, category: 'Coherence and Cohesion' },
                { title: 'Lexical Resource', data: feedback.feedback.lexicalResource, category: 'Lexical Resource' },
                { title: 'Grammatical Range and Accuracy', data: feedback.feedback.grammaticalRangeAccuracy, category: 'Grammatical Range and Accuracy' },
            ];

            return `
                <div class="criteria-grid">
                    ${criteria.map(({ title, data, category }) => `
                        <div class="criterion-card ${getCategoryClass(category)}">
                            <h3>
                                <span>${title}</span>
                                <span class="band-score">${data.band.toFixed(1)}</span>
                            </h3>
                            <p class="comment">"${data.comment}"</p>
                            <ul>
                                ${data.details.map(detail => `<li>${detail}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            `;
        };


        const css = `
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 0; }
            .container { max-width: 900px; margin: 2rem auto; padding: 2rem; background-color: #fff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
            h1, h2, h3 { color: #1e293b; }
            h1 { font-size: 2.25rem; border-bottom: 2px solid #cbd5e1; padding-bottom: 0.5rem; margin-bottom: 1rem; }
            h2 { font-size: 1.875rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-top: 2.5rem; margin-bottom: 1rem; }
            h3 { font-size: 1.5rem; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
            .info-grid p { margin: 0; }
            .essay-box { white-space: pre-wrap; background-color: #f8fafc; padding: 1.5rem; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 1.1rem; line-height: 1.7; }
            
            /* Score Gauge */
            .score-gauge { width: 150px; height: 150px; border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; margin: 1.5rem auto; border-width: 8px; border-style: solid; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .score-gauge.high { border-color: #dcfce7; } /* green-100 */
            .score-gauge.medium-high { border-color: #dbeafe; } /* blue-100 */
            .score-gauge.medium-low { border-color: #fef9c3; } /* yellow-100 */
            .score-gauge.low { border-color: #fee2e2; } /* red-100 */

            .score-value { font-size: 3rem; font-weight: 800; line-height: 1; }
            .score-value.high { color: #166534; } /* green-800 */
            .score-value.medium-high { color: #1e40af; } /* blue-800 */
            .score-value.medium-low { color: #854d0e; } /* yellow-800 */
            .score-value.low { color: #991b1b; } /* red-800 */

            .score-label { font-size: 0.9rem; font-weight: 500; color: #475569; /* slate-600 */ text-transform: uppercase; letter-spacing: 0.05em; }

            /* Criteria Analysis */
            .criteria-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem; }
            .criterion-card { background-color: #ffffff; border: 1px solid #e2e8f0; border-left-width: 5px; padding: 1.25rem; border-radius: 8px; }
            .criterion-card h3 { margin-top: 0; font-size: 1.25rem; display: flex; justify-content: space-between; align-items: center; }
            .criterion-card .band-score { font-size: 1.25rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 6px; }
            .criterion-card .comment { font-style: italic; color: #475569; border-left: 3px solid #cbd5e1; padding-left: 1rem; margin: 1rem 0; }
            .criterion-card ul { list-style-type: '✓ '; padding-left: 20px; color: #334155; }
            .criterion-card ul li { padding-left: 0.5rem; margin-bottom: 0.5rem; }
            
            /* Unified Theme for Export */
            .criterion-card.unified-theme { border-left-color: #6366f1; } /* indigo-500 */
            .criterion-card.unified-theme .band-score { background-color: #e0e7ff; color: #312e81; } /* indigo-100 / indigo-900 */
            
            @media (max-width: 768px) { .criteria-grid { grid-template-columns: 1fr; } }

            /* Essay highlights - Unified Theme */
            .highlight { padding: 0.1em 0.3em; border-radius: 4px; }
            .highlight.unified-theme { background-color: #e0e7ff; border-bottom: 2px solid #6366f1; }

            ul { list-style-type: none; padding-left: 0; }
            .improvement-item { background-color: #ffffff; border: 1px solid #e2e8f0; border-left-width: 5px; padding: 1.25rem; border-radius: 8px; margin-bottom: 1rem; }
            
            /* Unified Theme for Improvement Items */
            .improvement-item.unified-theme { border-left-color: #6366f1; } 

            .improvement-item p { margin: 0 0 0.5rem 0; }
            .improvement-item ul { list-style-type: '✓ '; padding-left: 20px; margin-top: 0.5rem;}
            .improvement-item ul li { margin-bottom: 0.5rem; padding-left: 0.5rem; }
            .original-text { font-style: italic; color: #475569; }
            
            .issue-tag { display: inline-block; font-size: 0.8rem; font-weight: bold; padding: 0.25rem 0.6rem; border-radius: 9999px; margin-bottom: 0.5rem; }
            /* Unified Theme Tags */
            .issue-tag.unified-theme { background-color: #e0e7ff; color: #312e81; }

            /* Modern Diff Styling for Export: No strikethrough, no bold, subtle background pills */
            .improvement-item ul li del { text-decoration: none; color: #64748b; background-color: #f1f5f9; padding: 0.1em 0.3em; border-radius: 4px; border: 1px solid #e2e8f0; } /* Slate style */
            .improvement-item ul li strong { font-weight: normal; color: #4338ca; background-color: #e0e7ff; padding: 0.1em 0.3em; border-radius: 4px; border: 1px solid #c7d2fe; } /* Indigo style */
            
            strong { font-weight: 600; color: #1e293b; }
        `;

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>IELTS Feedback Report for ${studentName}</title>
                <style>${css}</style>
            </head>
            <body>
                <div class="container">
                    <h1>IELTS Writing Feedback Report</h1>
                    <div class="info-grid">
                        <div>
                            <p><strong>Student:</strong> ${studentName}</p>
                            <p><strong>Class:</strong> ${classNameVal}</p>
                        </div>
                        <div style="text-align: right;">
                            <p><strong>Teacher:</strong> ${teacherName}</p>
                            <p><strong>Center:</strong> ${centerName}</p>
                        </div>
                    </div>
                    
                    ${scoreGaugeHTML}

                    <h2>Detailed Criteria Analysis</h2>
                    ${generateCriteriaHTML()}
                    
                    <h2>Question</h2>
                    <p>${question}</p>

                    <h2>Student's Answer with Annotations</h2>
                    <div class="essay-box">${generateHighlightedEssayHTML()}</div>

                    <h2>Annotated Improvement Suggestions</h2>
                    ${generateImprovementsListHTML()}
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        triggerDownload(blob, `ielts_feedback_report_${getSafeFilename()}.html`);
    };

    return (
        <div className="space-y-10">
            {/* Overall Score */}
            <div className="relative flex flex-col items-center justify-center glass-panel p-8 rounded-3xl shadow-lg border border-white/60">
                
                {/* Action Buttons Container */}
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                    {/* Export Menu Dropdown */}
                    <div ref={exportMenuRef} className="relative">
                        <button
                            onClick={() => setIsExportMenuOpen(prev => !prev)}
                            disabled={isLoading}
                            className={`px-4 py-2 bg-white/50 text-slate-700 font-semibold rounded-xl shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-200 flex items-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200/50 ${isCopied ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}`}
                        >
                            {isCopied ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-emerald-700">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span>Export Options</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </>
                            )}
                        </button>
                        {isExportMenuOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white/90 backdrop-blur-xl ring-1 ring-black ring-opacity-5 z-20 animate-fade-in overflow-hidden border border-white/50">
                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                    <button onClick={handleCopyForLMS} className="w-full text-left flex items-center px-4 py-3 text-sm text-slate-800 font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-slate-100" role="menuitem">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                        Copy Summary for LMS
                                    </button>
                                    <button onClick={handleExportHTML} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors" role="menuitem">Export as HTML (Visual)</button>
                                    <button onClick={handleExportPDF} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors" role="menuitem">Export as PDF</button>
                                    <button onClick={handleExportTXT} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors" role="menuitem">Export as TXT</button>
                                    <button onClick={handleExportCSV} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors" role="menuitem">Export as CSV</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <ScoreGauge score={feedback.overallBand} />
            </div>

            {/* Criteria Breakdown */}
            <div>
                <h3 className="text-3xl font-extrabold text-slate-800 mb-8 pb-4 border-b border-slate-200/60 max-w-5xl mx-auto flex items-center">
                     <span className="w-2 h-10 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-4"></span>
                     Criteria Analysis
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CriterionCard title="Task Response" data={feedback.feedback.taskResponse} onScoreChange={(newScore) => onScoreChange('taskResponse', newScore)} />
                    <CriterionCard title="Coherence and Cohesion" data={feedback.feedback.coherenceCohesion} onScoreChange={(newScore) => onScoreChange('coherenceCohesion', newScore)} />
                    <CriterionCard title="Lexical Resource" data={feedback.feedback.lexicalResource} onScoreChange={(newScore) => onScoreChange('lexicalResource', newScore)} />
                    <CriterionCard title="Grammatical Range and Accuracy" data={feedback.feedback.grammaticalRangeAccuracy} onScoreChange={(newScore) => onScoreChange('grammaticalRangeAccuracy', newScore)} />
                </div>
            </div>

            {/* Annotated Feedback */}
            <div>
                 <h3 className="text-3xl font-extrabold text-slate-800 mb-8 pb-4 border-b border-slate-200/60 max-w-5xl mx-auto flex items-center">
                     <span className="w-2 h-10 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-4"></span>
                     Annotated Feedback
                </h3>
                 <p className="text-slate-600 mb-8 text-lg font-medium">Click the glowing blocks in the essay to reveal detailed AI analysis, or <strong className="text-blue-600">select any text</strong> to add your own note.</p>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
                    <div className="lg:col-span-2">
                         <HighlightedFeedback
                            studentAnswer={studentAnswer}
                            improvements={feedback.improvements}
                            selectedImprovement={selectedImprovement}
                            onHighlightClick={handleHighlightClick}
                            onTextSelect={onTextSelect}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <FeedbackSidebar 
                          improvement={selectedImprovement} 
                          onUpdate={onImprovementUpdate}
                        />
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default FeedbackDisplay;
