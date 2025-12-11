
import React from 'react';
import type { User } from '../types';

interface HeaderProps {
    onHomeClick: () => void;
    onProfileClick: () => void;
    user: User;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHomeClick, onProfileClick, user, onLogout }) => {
    return (
        <header className="sticky top-0 z-20 w-full glass-panel border-b border-white/40 shadow-sm transition-all duration-300">
            <div className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
                {/* Logo Section - Modern Solid Nib */}
                <div className="flex items-center space-x-3 select-none group cursor-pointer" onClick={onHomeClick}>
                     <div className="relative flex items-center justify-center w-10 h-10 bg-slate-900 rounded-xl shadow-lg shadow-blue-900/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                             {/* Solid Nib Silhouette */}
                             <path d="M12 2.25c-3.25 0-6 2.5-6 6.5v2.5l6 10.5 6-10.5V8.75c0-4-2.75-6.5-6-6.5Z" />
                             {/* Breather Hole (Blue Core) */}
                             <circle cx="12" cy="9" r="2" className="text-blue-400" fill="currentColor" />
                             {/* Slit Detail (Matches background) */}
                             <path d="M12 11v7.5" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                     </div>
                     <span className="hidden md:block font-bold text-lg tracking-tight text-slate-800 group-hover:text-blue-900 transition-colors">
                        John Vu's <span className="text-slate-400 font-light group-hover:text-blue-400/80 transition-colors">Grader</span>
                     </span>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="text-right hidden sm:block">
                        <p className="font-semibold text-sm text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500 font-medium tracking-wide">{user.center}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {/* Explicit Home Button - Interactive Rounded Rect */}
                        <button
                            onClick={onHomeClick}
                            className="group px-4 py-2 text-slate-600 font-medium rounded-xl transition-all duration-300 flex items-center hover:bg-white hover:shadow-md hover:text-blue-600 hover:scale-105 active:scale-95"
                            title="Home"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="hidden sm:inline text-sm">Home</span>
                        </button>
                        
                        {/* Profile Button - Interactive Rounded Rect */}
                        <button
                            onClick={onProfileClick}
                            className="group px-4 py-2 text-slate-600 font-medium rounded-xl transition-all duration-300 flex items-center hover:bg-white hover:shadow-md hover:text-blue-600 hover:scale-105 active:scale-95"
                            title="My Profile"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="hidden sm:inline text-sm">Profile</span>
                        </button>
                        
                        {/* Logout Button */}
                         <button
                            onClick={onLogout}
                            className="ml-2 px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center"
                            title="Logout"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
