import React from 'react';
// Icons: check-circle for success and an 'X' for optional dismissal
import { CheckCircle, X } from 'lucide-react';

// SuccessMessage displays a positive feedback message when `message` is provided.
// Props:
// - message: string to show; when falsy the component renders null
// - onClose: optional callback for dismissing the message; if omitted no
//            close button is rendered
const SuccessMessage = ({ message, onClose }) => {
  // Don't render anything if there is no message
  if (!message) return null;

  return (
    <div style={{
      // Green background and border to indicate success
      padding: '16px',
      background: '#D1FAE5',
      border: '2px solid #34D399',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px'
    }}>
      {/* Success icon with fixed sizing so it doesn't shrink */}
      <CheckCircle size={24} style={{ color: '#059669', flexShrink: 0 }} />

      {/* Message body grows to fill available space */}
      <p style={{ 
        flex: 1, 
        margin: 0, 
        color: '#065F46',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        {message}
      </p>

      {/* Optional dismiss button */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
          aria-label="Close success message"
        >
          <X size={20} style={{ color: '#059669' }} />
        </button>
      )}
    </div>
  );
};

export default SuccessMessage;