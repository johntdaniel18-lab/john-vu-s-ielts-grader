import React from 'react';

export const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const percentage = (score / 9) * 100;
    const circumference = 2 * Math.PI * 52; // 2 * pi * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    let colorClass = 'text-red-500';
    if (score >= 7.5) colorClass = 'text-green-500';
    else if (score >= 6.0) colorClass = 'text-blue-500';
    else if (score >= 4.5) colorClass = 'text-yellow-500';
    
    return (
        <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="text-slate-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`${colorClass} transition-all duration-1000 ease-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-extrabold ${colorClass}`}>{score.toFixed(1)}</span>
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Overall</span>
            </div>
        </div>
    );
};
