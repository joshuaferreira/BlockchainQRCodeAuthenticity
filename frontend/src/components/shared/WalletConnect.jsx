import React from 'react';
// Custom hook that exposes wallet connection state and actions
import { useWallet } from '../../hooks/useWallet';
// Icons used for the connect button and connected state
import { Wallet, CheckCircle, Loader } from 'lucide-react';

const WalletConnect = () => {
  // Destructure wallet state and actions from the custom hook.
  // - account: the connected account address (string) or undefined
  // - isConnected: boolean flag indicating connection status
  // - connectWallet: async function to prompt/connect the user's wallet
  const { account, isConnected, connectWallet } = useWallet();

  // Local loading state used to disable the button and show progress while
  // waiting for connectWallet to resolve (prevents double-clicks)
  const [loading, setLoading] = React.useState(false);

  // Handler invoked when the user clicks the Connect button.
  // Shows a loading state while the async connectWallet() runs and
  // catches/logs any errors without crashing the UI.
  const handleConnect = async () => {
    setLoading(true);
    try {
      await connectWallet();
    } catch (error) {
      // Keep error handling lightweight here; UI-level notification
      // could be added (toast/modal) if desired.
      console.error('Connection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to shorten long Ethereum addresses for display (e.g. 0x1234...abcd)
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // If already connected, render a non-interactive pill showing the address
  // and a success icon. Styling uses green tones to indicate success.
  if (isConnected) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        background: '#D1FAE5',
        borderRadius: '8px',
        border: '2px solid #34D399'
      }}>
        <CheckCircle size={18} style={{ color: '#059669' }} />
        <span style={{ 
          fontSize: '14px', 
          fontWeight: '600',
          color: '#065F46',
          fontFamily: 'monospace'
        }}>
          {formatAddress(account)}
        </span>
      </div>
    );
  }

  // Not connected: render a primary button. While `loading` is true the
  // button is disabled and shows a loader + 'Connecting...' text.
  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      style={{
        padding: '10px 16px',
        background: loading ? '#9CA3AF' : '#4F46E5',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.2s'
      }}
    >
      {loading ? (
        <>
          {/* Loader icon — CSS `.spin` can rotate it if style exists elsewhere */}
          <Loader size={18} className="spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet size={18} />
          Connect Wallet
        </>
      )}
    </button>
  );
};

export default WalletConnect;