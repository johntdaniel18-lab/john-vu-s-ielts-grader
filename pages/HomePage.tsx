
import React, { useState } from 'react';
import type { TaskType } from '../types';
import { VideoModal } from '../components/VideoModal';

interface HomePageProps {
  onSelectTask: (taskType: TaskType) => void;
  user: { name: string; center: string; };
}

interface TaskCardProps {
    title: string;
    description: string;
    icon: React.ReactElement;
    colorTheme: 'blue' | 'indigo';
    onSelect: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ title, description, icon, colorTheme, onSelect }) => {
    const isBlue = colorTheme === 'blue';
    
    // Dynamic classes based on theme - Switched Cyan to Blue for brand consistency
    const containerHoverClass = isBlue 
        ? "hover:shadow-blue-500/20 hover:border-blue-300" 
        : "hover:shadow-indigo-500/20 hover:border-indigo-300";
        
    const iconBgClass = isBlue ? "bg-blue-50 text-blue-600" : "bg-indigo-50 text-indigo-600";
    const iconGroupHoverBgClass = isBlue ? "group-hover:bg-blue-600 group-hover:text-white" : "group-hover:bg-indigo-600 group-hover:text-white";
    
    const titleHoverClass = isBlue ? "group-hover:text-blue-700" : "group-hover:text-indigo-700";
    const arrowColorClass = isBlue ? "text-blue-400" : "text-indigo-400";
    const barColorClass = isBlue ? "bg-blue-600" : "bg-indigo-600";
    const blobColorClass = isBlue ? "bg-blue-400" : "bg-indigo-400";

    return (
        <div 
            onClick={onSelect}
            className={`group relative bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/60 cursor-pointer transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl overflow-hidden ${containerHoverClass}`}
        >
            {/* Background Gradient Blob effect on hover */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${blobColorClass}`}></div>

            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${arrowColorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </div>

            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 mb-8 shadow-sm ${iconBgClass} ${iconGroupHoverBgClass}`}>
                {React.cloneElement(icon, { className: "h-10 w-10 transition-transform duration-500 group-hover:scale-110" })}
            </div>
            
            <h2 className={`text-3xl font-bold text-slate-800 mb-4 transition-colors duration-300 ${titleHoverClass}`}>{title}</h2>
            
            {/* Animated Bottom Bar - Moved here for consistent alignment */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
                <div className={`h-full w-0 group-hover:w-full transition-all duration-700 ease-in-out ${barColorClass}`}></div>
            </div>

            <p className="text-slate-500 mb-2 leading-relaxed text-lg">{description}</p>
        </div>
    );
};

const HomePage: React.FC<HomePageProps> = ({ onSelectTask, user }) => {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <div className="relative z-10 max-w-6xl mx-auto pt-8 pb-16 px-4">
      
      {/* Active Session Chip - Repositioned to Top Right */}
      <div className="absolute top-0 right-4 md:right-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-100 shadow-sm select-none transition-transform hover:scale-105">
        <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Authorized Session</span>
      </div>

      <div className="text-center mt-16 md:mt-24 animate-fade-in">
        {/* Hero Text with Glow */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-800 mb-8 tracking-tight relative inline-block">
            Welcome, <span className="relative inline-block">
                <span className="absolute -inset-1 rounded-lg bg-blue-500/20 blur-2xl opacity-50"></span>
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user.name}</span>
            </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Select a writing module to initialize the assessment engine.
        </p>

        {/* Tutorial Button Trigger - Cleaned up (Removed animations and bubbles) */}
        <div className="mb-20 flex justify-center">
             <button
                onClick={() => setShowTutorial(true)}
                className="group relative flex items-center gap-4 bg-white hover:bg-slate-50 text-slate-700 pl-2 pr-8 py-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md border border-slate-300 hover:border-blue-400 hover:-translate-y-0.5"
             >
                <div className="relative w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white transition-colors duration-300">
                    <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
                <div className="text-left flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">First time here?</span>
                    <span className="font-bold text-slate-800 text-lg leading-tight group-hover:text-blue-700 transition-colors">Watch the Tutorial</span>
                </div>
             </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left px-4">
            <TaskCard
            title="Writing Task 1"
            description="Analyze visual data. Upload charts, graphs, or diagrams for contextual evaluation."
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            colorTheme="blue"
            onSelect={() => onSelectTask(1)}
            />
            <TaskCard
            title="Writing Task 2"
            description="Evaluate discursive essays. Focus on argumentation, coherence, and lexical precision."
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
            colorTheme="indigo"
            onSelect={() => onSelectTask(2)}
            />
        </div>
      </div>

      {showTutorial && (
        <VideoModal 
            videoId="1145421861" 
            platform="vimeo"
            onClose={() => setShowTutorial(false)} 
        />
      )}
    </div>
  );
};

export default HomePage;
