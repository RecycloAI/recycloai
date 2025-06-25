import React from 'react';
import { Button } from './ui/button';

interface LoginPromptProps {
  onLogin?: () => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ onLogin }) => (
  <div style={{ textAlign: 'center', padding: '2rem' }}>
    <h2>Please log in to access your dashboard.</h2>
    {onLogin && (
      <Button onClick={onLogin} style={{ marginTop: '1rem' }}>
        Log In
      </Button>
    )}
  </div>
);

export default LoginPrompt; 