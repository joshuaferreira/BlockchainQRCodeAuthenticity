import React from 'react';
// Icons: alert symbol for the message and an 'X' for optional close action
import { AlertCircle, X } from 'lucide-react';

// ErrorMessage displays a dismissible error/alert box when `message` is provided.
// Props:
// - message: string to display. If falsy, the component returns null (renders nothing).
// - onClose: optional callback invoked when the user clicks the close button; if
//            omitted, no close button is rendered.
const ErrorMessage = ({ message, onClose }) => {
  // Conditional render: nothing to display when there is no message
  if (!message) return null;

  return (
    <div style={{
      // Red background and border to indicate an error state
      padding: '16px',
      background: '#FEE2E2',
      border: '2px solid #F87171',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px'
    }}>
      {/* Alert icon (keeps a fixed size using flexShrink: 0 so it doesn't compress) */}
      <AlertCircle size={24} style={{ color: '#DC2626', flexShrink: 0 }} />

      {/* Message body: flexible so it grows/shrinks with layout */}
      <p style={{ 
        flex: 1, 
        margin: 0, 
        color: '#991B1B',
        fontSize: '14px'
      }}>
        {message}
      </p>

      {/* Optional close button: only render when an onClose handler is provided.
          The button is visually minimal and uses an icon to indicate dismissal. */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
          aria-label="Close error"
        >
          <X size={20} style={{ color: '#DC2626' }} />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;