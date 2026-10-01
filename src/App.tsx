/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/LandingPage';
import { AppView } from './components/AppView';
import { AuthModal } from './components/modals/AuthModal';
import { ToastContainer } from './components/Toast';

const Main: React.FC = () => {
  const { state } = useApp();
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup'>('signup');

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signup') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenApp = () => {
    // If not logged in, we can either prompt for signup or launch app in guest demo mode
    if (!state.user) {
      handleOpenAuth('signup');
    } else {
      setViewMode('app');
    }
  };

  return (
    <>
      {viewMode === 'landing' ? (
        <LandingPage
          onOpenApp={() => {
            if (state.user) {
              setViewMode('app');
            } else {
              handleOpenAuth('signup');
            }
          }}
          onOpenAuth={handleOpenAuth}
        />
      ) : (
        <AppView onBackToSite={() => setViewMode('landing')} />
      )}

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setViewMode('app');
        }}
      />

      <ToastContainer />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
}
