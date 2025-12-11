
import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { User } from '../types';
import { Spinner } from '../components/Spinner';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [center, setCenter] = useState(user.center);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: name,
        centerName: center
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.warn("Firestore update failed (likely permission issues). Updating locally only.", error);
      // If DB write fails, we still treat it as a success for the current session
      setMessage({ type: 'success', text: 'Profile saved to local device (Cloud sync failed).' });
    } finally {
      // Save to local storage for persistence across reloads/re-logins
      localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify({ name, center }));
      
      // Update local state so the changes are reflected in the UI/Reports immediately
      onUpdateUser({ ...user, name, center });
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 md:py-12 animate-fade-in relative">
      {/* Background Decorative Blobs */}
       <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none mix-blend-multiply"></div>
       <div className="absolute top-40 -right-20 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none mix-blend-multiply"></div>

      <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-3">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Profile</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium">Manage your teaching credentials and display preferences.</p>
      </div>
      
      <div className="glass-panel p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden border border-white/60">
        {/* Top Decorative Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            
            {/* Display Name */}
            <div className="space-y-3">
              <label htmlFor="display-name" className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                Teacher Display Name
              </label>
              <input
                type="text"
                id="display-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-white/60 border border-slate-200 rounded-2xl text-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
                placeholder="e.g., John Vu"
                required
              />
              <p className="text-sm text-slate-400 pl-1 font-medium">This name will appear on all student feedback reports.</p>
            </div>

            {/* Center Selection */}
            <div className="space-y-3">
              <label htmlFor="center-name" className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                Center Name
              </label>
              <div className="relative">
                  <select
                    id="center-name"
                    value={center}
                    onChange={(e) => setCenter(e.target.value)}
                    className="w-full px-5 py-4 bg-white/60 border border-slate-200 rounded-2xl text-lg text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 appearance-none cursor-pointer backdrop-blur-sm"
                  >
                    <option value="GIGI NDC">GIGI NDC</option>
                    <option value="GIGI TN">GIGI TN</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-slate-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
              </div>
              <p className="text-sm text-slate-400 pl-1 font-medium">Select the branch associated with your grading reports.</p>
            </div>

            {/* Status Message */}
            {message && (
              <div className={`p-4 rounded-xl flex items-center space-x-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'} animate-fade-in shadow-sm`}>
                {message.type === 'success' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
                <span className="font-semibold text-sm md:text-base">{message.text}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex justify-center items-center py-4 px-6 rounded-2xl shadow-lg shadow-blue-900/20 text-lg font-bold text-white bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 active:scale-[0.99]"
              >
                {isSaving ? (
                  <>
                    <Spinner />
                    <span className="ml-3">Saving Changes...</span>
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default ProfilePage;
