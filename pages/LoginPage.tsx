
import React, { useState } from 'react';
import { validateApiKey, setApiKey } from '../services/geminiService';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Spinner } from '../components/Spinner';
import type { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  // Authentication State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKeyValue] = useState('');
  
  // UI State
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingMessage('');

    if (!email || !password) {
        setError('Please enter your email and password.');
        return;
    }

    if (!apiKey.trim()) {
        setError('Please enter your Gemini API Key.');
        return;
    }

    setIsValidating(true);
    
    try {
        // 1. Authenticate with Firebase
        setLoadingMessage('Authenticating...');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        
        // 2. Validate Gemini API Key
        setLoadingMessage('Verifying Key...');
        const isValid = await validateApiKey(apiKey.trim());
        
        if (!isValid) {
            throw new Error('The API Key provided is invalid or inactive.');
        }

        // 3. Fetch User Profile from Firestore (with fallback to Local Storage)
        setLoadingMessage('Loading Profile...');
        let userData: User;

        try {
            const userDocRef = doc(db, "users", uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                userData = {
                    uid: uid,
                    name: data.displayName || 'Teacher',
                    center: data.centerName || 'GIGI NDC'
                };
                localStorage.setItem(`userProfile_${uid}`, JSON.stringify({ name: userData.name, center: userData.center }));
            } else {
                const cachedProfile = localStorage.getItem(`userProfile_${uid}`);
                if (cachedProfile) {
                     const parsed = JSON.parse(cachedProfile);
                     userData = { uid: uid, name: parsed.name, center: parsed.center };
                     
                     try {
                         await setDoc(userDocRef, {
                             displayName: userData.name,
                             centerName: userData.center
                         });
                     } catch (syncErr) {
                         console.warn("Failed to sync local profile to cloud:", syncErr);
                     }

                } else {
                    const defaultData = {
                        displayName: 'New Teacher',
                        centerName: 'GIGI NDC'
                    };
                    await setDoc(userDocRef, defaultData);
                    
                    userData = {
                        uid: uid,
                        name: defaultData.displayName,
                        center: defaultData.centerName
                    };
                    localStorage.setItem(`userProfile_${uid}`, JSON.stringify({ name: userData.name, center: userData.center }));
                }
            }
        } catch (dbError: any) {
            console.warn("Firestore access failed. Checking local storage fallback.", dbError);
            const cachedProfile = localStorage.getItem(`userProfile_${uid}`);
            if (cachedProfile) {
                const parsed = JSON.parse(cachedProfile);
                userData = {
                    uid: uid,
                    name: parsed.name,
                    center: parsed.center
                };
            } else {
                userData = {
                    uid: uid,
                    name: 'Teacher',
                    center: 'GIGI NDC'
                };
            }
        }
        
        // Success
        setApiKey(apiKey.trim());
        onLogin(userData);

    } catch (err: any) {
        console.error("Login error:", err);
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            setError('Invalid email or password.');
        } else if (err.code === 'auth/too-many-requests') {
            setError('Too many failed attempts. Try again later.');
        } else {
            setError(err.message || 'An error occurred during login.');
        }
    } finally {
        setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
            <div className="flex flex-col items-center justify-center mb-6">
                 {/* Modern Solid Nib Logo Large */}
                 <div className="flex items-center justify-center w-20 h-20 bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/30 mb-6 transform hover:scale-105 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.25c-3.25 0-6 2.5-6 6.5v2.5l6 10.5 6-10.5V8.75c0-4-2.75-6.5-6-6.5Z" />
                        <circle cx="12" cy="9" r="2" className="text-blue-400" fill="currentColor" />
                        <path d="M12 11v7.5" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                 </div>
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">John Vu's <span className="text-blue-600">IELTS Grader</span></h1>
                <p className="text-slate-500 mt-3 font-medium">Advanced AI Writing Assessment System</p>
            </div>
        </div>
        
        {/* Glassmorphism Card */}
        <div className="glass-panel p-8 rounded-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Account Login */}
            <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2">
                    <div className="h-px bg-slate-200 flex-grow"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Login</span>
                    <div className="h-px bg-slate-200 flex-grow"></div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </div>
            </div>

            {/* API Key */}
            <div className="space-y-4 pt-2">
                 <div className="flex items-center space-x-2 pb-2">
                    <div className="h-px bg-slate-200 flex-grow"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Access Key</span>
                    <div className="h-px bg-slate-200 flex-grow"></div>
                </div>
                <div>
                    <input
                        type="password"
                        id="api-key"
                        value={apiKey}
                        onChange={(e) => setApiKeyValue(e.target.value)}
                        placeholder="Paste your Gemini API Key here"
                        className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 font-mono text-sm"
                        required
                    />
                    <div className="flex justify-end mt-2">
                         <a 
                             href="https://www.youtube.com/watch?v=dEdQOGcpSRg" 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="group inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors px-2 py-1 rounded-lg hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                             title="Watch tutorial"
                         >
                            <span className="text-blue-600 group-hover:scale-110 transition-transform duration-200 drop-shadow-sm">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </span>
                             <span>Get your API Key</span>
                         </a>
                    </div>
                </div>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50/80 backdrop-blur-sm text-red-700 border border-red-200 rounded-xl text-sm font-medium animate-fade-in" role="alert">
                {error}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center items-center py-4 px-6 rounded-2xl shadow-lg shadow-blue-600/30 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-1 hover:shadow-blue-600/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 active:scale-[0.99]"
                disabled={isValidating}
              >
                {isValidating ? (
                    <>
                        <Spinner />
                        <span className="ml-3">{loadingMessage}</span>
                    </>
                ) : (
                    'Authenticate'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
