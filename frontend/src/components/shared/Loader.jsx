import React from 'react';
// Using the Loader icon from lucide-react and renaming it to avoid name clash
import { Loader as LoaderIcon } from 'lucide-react';

// Simple presentational Loader component
// Props:
// - message: optional string to display under the spinner (defaults to 'Loading...')
const Loader = ({ message = 'Loading...' }) => {
  return (
    // Centered column layout with spacing to separate icon and message
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      gap: '15px'
    }}>
      {/* Spinner icon. Inline `animation: 'spin ...'` relies on a global CSS
          keyframes rule named `spin` (e.g., @keyframes spin { to { transform: rotate(360deg); } })
          If that rule doesn't exist, consider using a CSS class or inline transform animation. */}
      <LoaderIcon 
        size={48} 
        style={{ 
          color: '#4F46E5',
          animation: 'spin 1s linear infinite'
        }} 
      />
      {/* Message shown beneath the spinner */}
      <p style={{ 
        fontSize: '16px', 
        color: '#6B7280',
        fontWeight: '500'
      }}>
        {message}
      </p>
    </div>
  );
};

export default Loader;