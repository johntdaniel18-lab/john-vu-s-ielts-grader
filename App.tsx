
import React, { useState, useCallback } from 'react';
import HomePage from './pages/HomePage';
import MarkingPage from './pages/MarkingPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import { Header } from './components/Header';
import type { TaskType, User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'marking' | 'profile'>('home');
  const [taskType, setTaskType] = useState<TaskType>(1);

  const handleLogin = useCallback((userData: User) => {
    setUser(userData);
    setCurrentPage('home');
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setCurrentPage('home');
  }, []);

  const navigateToMarking = useCallback((type: TaskType) => {
    setTaskType(type);
    setCurrentPage('marking');
  }, []);

  const navigateToHome = useCallback(() => {
    setCurrentPage('home');
  }, []);
  
  const navigateToProfile = useCallback(() => {
    setCurrentPage('profile');
  }, []);

  const handleUpdateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header 
        onHomeClick={navigateToHome} 
        onProfileClick={navigateToProfile}
        user={user} 
        onLogout={handleLogout} 
      />
      <main className="container mx-auto p-4 md:p-8">
        {currentPage === 'home' && <HomePage onSelectTask={navigateToMarking} user={user} />}
        {currentPage === 'marking' && <MarkingPage taskType={taskType} user={user} />}
        {currentPage === 'profile' && <ProfilePage user={user} onUpdateUser={handleUpdateUser} />}
      </main>
    </div>
  );
};

export default App;
