import { useState, useEffect } from 'react';
import NostrConnect from '../components/NostrConnect';
import MarketplacePage from '../components/MarketplacePage';
import { isMobileDevice } from '../utils/deviceDetector';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [pubkey, setPubkey] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const handleConnect = (key) => {
    setPubkey(key);
    setIsConnected(true);
  };

  // If mobile, skip connection and show read-only marketplace
  if (isMobile) {
    return <MarketplacePage readOnly={true} />;
  }

  // For desktop, show connection flow
  if (!isConnected) {
    return <NostrConnect onConnect={handleConnect} />;
  }

  // Connected desktop view
  return <MarketplacePage userPubkey={pubkey} readOnly={false} />;
}