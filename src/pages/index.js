import { useState } from 'react';
import NostrConnect from '../components/NostrConnect';
import MarketplacePage from '../components/MarketplacePage';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [pubkey, setPubkey] = useState(null);

  const handleConnect = (key) => {
    setPubkey(key);
    setIsConnected(true);
  };

  // If not connected, show connection screen
  if (!isConnected) {
    return <NostrConnect onConnect={handleConnect} />;
  }

  // If connected, show marketplace
  return <MarketplacePage userPubkey={pubkey} />;
}