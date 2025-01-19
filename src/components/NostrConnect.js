import React, { useState } from 'react';
import { AlertCircle, Shield, Key } from 'lucide-react';

const NostrConnect = ({ onConnect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExtensionConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Check if nostr extension exists
      if (!window.nostr) {
        throw new Error('No Nostr extension found. Please install Alby or another Nostr extension.');
      }

      // Request public key
      const pubkey = await window.nostr.getPublicKey();
      if (pubkey) {
        onConnect(pubkey);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
          Welcome to NostrMarket
        </h1>
        <h2 className="text-center text-lg text-gray-600 mb-8">
          Connect to start buying and selling
        </h2>

        {/* Security Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-700">
              This site never stores your private keys. All interactions are signed locally using your Nostr extension.
            </p>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Extension Connection Option */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Recommended Connection Method
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Shield className="h-6 w-6 text-green-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Browser Extension</h3>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Recommended
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                Connect using Alby or another Nostr browser extension for the most secure experience.
              </p>

              <button
                onClick={handleExtensionConnect}
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
              >
                {isLoading ? 'Connecting...' : 'Connect with Extension'}
              </button>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Coming Soon</span>
              </div>
            </div>

            {/* Future Connection Options */}
            <div className="space-y-4">
              <button
                disabled
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-500 bg-gray-50 cursor-not-allowed"
              >
                <Key className="h-4 w-4 mr-2" />
                Create New Account
              </button>

              <button
                disabled
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-500 bg-gray-50 cursor-not-allowed"
              >
                <Key className="h-4 w-4 mr-2" />
                Import Existing Keys
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Don't have a Nostr extension?
              </span>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <a
              href="https://getalby.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Install Alby
            </a>
            <span className="text-gray-500">•</span>
            <a
              href="https://github.com/nostr-protocol/nips/blob/master/07.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NostrConnect;