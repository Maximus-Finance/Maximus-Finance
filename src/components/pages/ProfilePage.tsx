'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { useTheme } from '@/hooks/useTheme';
import { useWallet } from '@/context/WalletContext';
import { PageType } from '@/types';
import Button from '@/components/ui/Button';

interface ProfilePageProps {
  onNavigate: (page: PageType) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { isDarkMode } = useTheme();
  const {
    isConnected,
    account,
    balance,
    chainId,
    signer,
    isOnFuji,
    getNetworkName,
    formatAddress,
    connectWallet,
    isMetaMaskInstalled,
    switchToFuji,
    updateBalance,
    CONTRACT_ADDRESSES,
    loading: walletLoading
  } = useWallet();

  const [stakedAmount, setStakedAmount] = useState<string>('0');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  // Contract ABI to match updated SimpleStaking contract
  const STAKING_ABI = useMemo(() => [
    "function getUserDeposit(address user) external view returns (uint256 amount, uint256 depositTime, bool isActive)",
    "function getTotalValue() external view returns (uint256)"
  ], []);

  const fetchStakingData = useCallback(async () => {
    if (signer && account && CONTRACT_ADDRESSES.STAKING_CONTRACT) {
      try {
        const contract = new ethers.Contract(CONTRACT_ADDRESSES.STAKING_CONTRACT, STAKING_ABI, signer);
        
        const [amount, depositTimestamp, active] = await contract.getUserDeposit(account);
        
        setStakedAmount(ethers.utils.formatEther(amount));
        setIsActive(active);
        
        // depositTime not used in UI currently

        console.log('✅ Profile staking data loaded:', {
          amount: ethers.utils.formatEther(amount),
          depositTime: depositTimestamp.toString(),
          isActive: active
        });
      } catch {
        console.log('Contract not deployed or no deposits - showing default values');
        setStakedAmount('0');
        setIsActive(false);
      }
    }
  }, [signer, account, CONTRACT_ADDRESSES.STAKING_CONTRACT, STAKING_ABI]);

  const refreshData = async () => {
    if (isConnected) {
      setIsLoading(true);
      await Promise.all([
        updateBalance(),
        fetchStakingData()
      ]);
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!isMetaMaskInstalled()) {
      alert('Please install MetaMask to continue!');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    await connectWallet();
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToFuji();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert('Failed to switch network: ' + errorMessage);
    }
  };

  useEffect(() => {
    if (isConnected && account) {
      fetchStakingData();
    }
  }, [isConnected, account, fetchStakingData]);


  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (num === 0) return '0';
    return num < 0.0001 ? '< 0.0001' : num.toFixed(4);
  };

  return (
    <div className="pt-16 font-hind">
      <section className="min-h-screen py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className={`text-3xl sm:text-5xl md:text-6xl font-bold mb-6 font-hind ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Your <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">Profile</span>
            </h1>
            <p className={`text-lg sm:text-xl font-hind ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Wallet connection and staking overview
            </p>
          </div>

          {!isConnected ? (
            /* Connect Wallet Section */
            <div className={`text-center p-8 sm:p-12 rounded-3xl ${isDarkMode ? 'glass-3d-dark' : 'glass-3d-light'}`}>
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-3xl">👤</span>
                </div>
                <h2 className={`text-2xl font-bold mb-4 font-hind ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Connect Your Wallet
                </h2>
                <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Connect your wallet to view your profile and staking details
                </p>
              </div>
              <Button onClick={handleConnect} disabled={walletLoading}>
                {walletLoading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </div>
          ) : (
            /* Profile Content */
            <div className="space-y-6 sm:space-y-8">
              {/* Wallet Info Card */}
              <div className={`p-6 sm:p-8 rounded-3xl ${isDarkMode ? 'glass-3d-dark' : 'glass-3d-light'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold font-hind ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Wallet Information
                  </h2>
                  <Button onClick={refreshData} disabled={isLoading} size="sm">
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Wallet Address */}
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                    <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Wallet Address
                    </div>
                    <div className={`font-mono text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatAddress(account || '')}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(account || '')}
                      className={`text-xs mt-2 px-2 py-1 rounded ${isDarkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                    >
                      Copy Full Address
                    </button>
                  </div>

                  {/* Network */}
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                    <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Network
                    </div>
                    <div className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {getNetworkName()}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Chain ID: {chainId}
                      {!isOnFuji && (
                        <button 
                          onClick={handleSwitchNetwork}
                          className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          Switch to Fuji
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance & Staking Card */}
              <div className={`p-6 sm:p-8 rounded-3xl ${isDarkMode ? 'glass-3d-dark' : 'glass-3d-light'}`}>
                <h2 className={`text-2xl font-bold mb-6 font-hind ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Balance & Staking
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* AVAX Balance */}
                  <div className={`p-6 rounded-2xl text-center ${isDarkMode ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50 border border-blue-200/30'}`}>
                    <div className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {formatAmount(balance)}
                    </div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      AVAX Balance
                    </div>
                  </div>

                  {/* Staked Amount */}
                  <div className={`p-6 rounded-2xl text-center ${isDarkMode ? 'bg-green-900/20 border border-green-700/30' : 'bg-green-50 border border-green-200/30'}`}>
                    <div className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {formatAmount(stakedAmount)}
                    </div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                      AVAX Staked
                    </div>
                  </div>

                  {/* Status */}
                  <div className={`p-6 rounded-2xl text-center ${isDarkMode ? 'bg-purple-900/20 border border-purple-700/30' : 'bg-purple-50 border border-purple-200/30'}`}>
                    <div className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {isActive ? '✅' : '⏸️'}
                    </div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                      {isActive ? 'Active Deposit' : 'No Active Deposit'}
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                {parseFloat(stakedAmount) === 0 && (
                  <div className={`mt-6 p-4 rounded-xl text-center ${isDarkMode ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`}>
                    <p className="font-medium">No AVAX staked yet</p>
                    <p className="text-sm mt-1">
                      Start earning enhanced yields by exploring our strategies
                    </p>
                    <Button 
                      onClick={() => onNavigate('protocols')} 
                      className="mt-3"
                      size="sm"
                    >
                      Explore Strategies
                    </Button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className={`p-6 sm:p-8 rounded-3xl ${isDarkMode ? 'glass-3d-dark' : 'glass-3d-light'}`}>
                <h2 className={`text-2xl font-bold mb-6 font-hind ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => onNavigate('protocols')} 
                    variant="secondary"
                    className="justify-center"
                  >
                    View Strategies
                  </Button>
                  <Button 
                    onClick={() => onNavigate('yields')} 
                    variant="outline"
                    className="justify-center"
                  >
                    Explore Yields
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;