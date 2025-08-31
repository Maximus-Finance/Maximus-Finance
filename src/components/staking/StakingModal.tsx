'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useWallet } from '@/context/WalletContext';

// Updated ABI to match the new SimpleStaking contract
const STAKING_ABI = [
  "function deposit() external payable",
  "function withdraw() external",
  "function getUserDeposit(address user) external view returns (uint256 amount, uint256 depositTime, bool isActive)",
  "function getTotalValue() external view returns (uint256)",
  "event Deposit(address indexed user, uint256 amount)",
  "event Withdrawal(address indexed user, uint256 amount)"
];

interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocol: string;
  baseAPY: string;
  enhancedAPY: string;
  isDarkMode: boolean;
}

const StakingModal: React.FC<StakingModalProps> = ({ 
  isOpen, 
  onClose, 
  protocol, 
  baseAPY, 
  enhancedAPY, 
  isDarkMode 
}) => {
  const {
    isConnected,
    account,
    signer,
    isOnFuji,
    connectWallet,
    switchToFuji,
    updateBalance,
    CONTRACT_ADDRESSES,
    loading: walletLoading,
    error: walletError,
    isMetaMaskInstalled
  } = useWallet();

  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [stakedAmount, setStakedAmount] = useState<string>('0');
  const [depositTime, setDepositTime] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [txHash, setTxHash] = useState<string>('');
  const [txStatus, setTxStatus] = useState<{ message: string; type: string } | null>(null);

  const setupContract = useCallback(async () => {
    if (signer && CONTRACT_ADDRESSES.STAKING_CONTRACT) {
      try {
        const contract = new ethers.Contract(CONTRACT_ADDRESSES.STAKING_CONTRACT, STAKING_ABI, signer);
        setContract(contract);
        console.log('✅ Contract setup complete');
      } catch (error) {
        console.error('Error setting up contract:', error);
      }
    }
  }, [signer, CONTRACT_ADDRESSES.STAKING_CONTRACT]);

  useEffect(() => {
    if (isOpen && isConnected) {
      setupContract();
    }
  }, [isOpen, isConnected, setupContract]);

  const fetchStakingData = useCallback(async () => {
    if (contract && account) {
      try {
        const [amount, depositTimestamp, active] = await contract.getUserDeposit(account);
        
        setStakedAmount(ethers.utils.formatEther(amount));
        setIsActive(active);
        
        if (depositTimestamp.gt(0)) {
          const date = new Date(depositTimestamp.toNumber() * 1000);
          setDepositTime(date.toLocaleDateString());
        } else {
          setDepositTime('');
        }

        console.log('✅ Staking data loaded:', {
          amount: ethers.utils.formatEther(amount),
          depositTime: depositTimestamp.toString(),
          isActive: active
        });
      } catch {
        console.log('Contract not deployed yet or no deposits - using default values');
        setStakedAmount('0');
        setIsActive(false);
      }
    }
  }, [contract, account]);

  useEffect(() => {
    if (isConnected && account && contract) {
      fetchStakingData();
      const interval = setInterval(fetchStakingData, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, account, contract, fetchStakingData]);

  const showStatus = (message: string, type: string = 'info') => {
    setTxStatus({ message, type });
    setTimeout(() => setTxStatus(null), 5000);
  };

  const handleStake = async () => {
    if (!isConnected) {
      showStatus('Please connect your wallet first', 'error');
      return;
    }

    if (!isOnFuji) {
      showStatus('Please switch to Fuji testnet', 'error');
      return;
    }

    if (!contract || !stakeAmount || parseFloat(stakeAmount) <= 0) {
      showStatus('Please enter a valid stake amount', 'error');
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (amount < 0.01 || amount > 1000) {
      showStatus('Amount must be between 0.01 and 1000 AVAX', 'error');
      return;
    }

    try {
      setIsLoading(true);
      showStatus('Processing AVAX deposit...', 'info');
      
      const stakeAmountWei = ethers.utils.parseEther(stakeAmount);
      const tx = await contract.deposit({ 
        value: stakeAmountWei,
        gasLimit: 300000
      });
      
      setTxHash(tx.hash);
      console.log('💰 Deposit transaction sent:', tx.hash);
      showStatus('Transaction submitted! Waiting for confirmation...', 'info');
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        showStatus('🎉 AVAX deposit successful!', 'success');
        setStakeAmount('');
        await fetchStakingData();
        await updateBalance();
        console.log('✅ Real AVAX staking completed successfully!');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: unknown) {
      console.error('Staking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      let displayMessage = 'Staking failed: ';
      if (errorMessage.includes('user rejected')) {
        displayMessage += 'Transaction rejected by user';
      } else if (errorMessage.includes('insufficient funds')) {
        displayMessage += 'Insufficient AVAX balance';
      } else if (errorMessage.includes('CALL_EXCEPTION')) {
        displayMessage += 'Contract not deployed on this network';
      } else {
        displayMessage += errorMessage;
      }
      
      showStatus(displayMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected || !isOnFuji) {
      showStatus('Please connect wallet and switch to Fuji testnet', 'error');
      return;
    }

    if (!contract || parseFloat(stakedAmount) <= 0) {
      showStatus('No deposits to withdraw', 'error');
      return;
    }

    try {
      setIsLoading(true);
      showStatus('Processing withdrawal...', 'info');
      
      const tx = await contract.withdraw({
        gasLimit: 200000
      });
      
      setTxHash(tx.hash);
      console.log('💵 Withdrawal transaction sent:', tx.hash);
      showStatus('Withdrawal transaction submitted...', 'info');
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        showStatus('🏦 Withdrawal successful!', 'success');
        await fetchStakingData();
        await updateBalance();
        console.log('✅ Real AVAX withdrawal completed successfully!');
      } else {
        throw new Error('Withdrawal transaction failed');
      }
    } catch (error: unknown) {
      console.error('Withdrawal error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      let displayMessage = 'Withdrawal failed: ';
      if (errorMessage.includes('user rejected')) {
        displayMessage += 'Transaction rejected by user';
      } else if (errorMessage.includes('No deposits found')) {
        displayMessage += 'No deposits to withdraw';
      } else {
        displayMessage += errorMessage;
      }
      
      showStatus(displayMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!isMetaMaskInstalled()) {
      showStatus('Please install MetaMask to continue', 'error');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    
    try {
      await connectWallet();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToFuji();
    } catch (error) {
      console.error('Network switch failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`relative max-w-md w-full rounded-3xl p-8 ${
        isDarkMode ? 'glass-3d-dark' : 'glass-3d-light'
      }`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 ${
            isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Enhanced Staking
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {protocol} Strategy
          </p>
          {!isOnFuji && isConnected && (
            <div className={`mt-2 p-2 rounded-lg text-xs ${isDarkMode ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`}>
              ⚠️ Please switch to Fuji testnet to continue
              <button 
                onClick={handleSwitchNetwork}
                className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                Switch Network
              </button>
            </div>
          )}
        </div>

        {/* APY Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-2xl border ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-700/30' 
              : 'bg-blue-50 border-blue-200/30'
          }`}>
            <div className="text-center">
              <div className={`font-bold text-xl ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {baseAPY}
              </div>
              <div className={`text-xs font-medium mt-1 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                Base APY
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-2xl border ${
            isDarkMode 
              ? 'bg-green-900/20 border-green-700/30' 
              : 'bg-green-50 border-green-200/30'
          }`}>
            <div className="text-center">
              <div className={`font-bold text-xl ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                {enhancedAPY}
              </div>
              <div className={`text-xs font-medium mt-1 ${
                isDarkMode ? 'text-green-300' : 'text-green-700'
              }`}>
                Enhanced APY
              </div>
            </div>
          </div>
        </div>

        {!isConnected ? (
          <Button 
            onClick={handleConnect} 
            disabled={walletLoading}
            className="w-full mb-4"
          >
            {walletLoading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Account Info */}
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Connected Account
              </div>
              <div className={`text-sm font-mono ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </div>
            </div>

            {/* Staking Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Deposited
                </div>
                <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {parseFloat(stakedAmount).toFixed(4)} AVAX
                </div>
              </div>
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Status
                </div>
                <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isActive ? '✅ Active' : '⏸️ Inactive'}
                </div>
              </div>
            </div>

            {depositTime && (
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Deposit Date: {depositTime}
                </div>
              </div>
            )}

            {/* Deposit Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Deposit Amount (AVAX)
              </label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.01 - 1000"
                step="0.01"
                min="0.01"
                max="1000"
                disabled={!isOnFuji}
                className={`w-full p-3 rounded-xl border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } ${!isOnFuji ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Minimum: 0.01 AVAX • Maximum: 1000 AVAX
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleStake} 
                disabled={isLoading || !stakeAmount || !isOnFuji || parseFloat(stakeAmount) < 0.01}
                className="w-full"
              >
                {isLoading ? '🔄 Processing...' : `💰 Deposit ${stakeAmount || ''} AVAX`}
              </Button>
              
              {parseFloat(stakedAmount) > 0 && isActive && (
                <Button 
                  onClick={handleWithdraw} 
                  disabled={isLoading || !isOnFuji}
                  variant="secondary"
                  className="w-full"
                >
                  {isLoading ? '🔄 Processing...' : '🏦 Withdraw All'}
                </Button>
              )}
            </div>

            {/* Transaction Status */}
            {txStatus && (
              <div className={`p-3 rounded-xl ${
                txStatus.type === 'success' ? 'bg-green-900/20 text-green-300' :
                txStatus.type === 'error' ? 'bg-red-900/20 text-red-300' :
                'bg-blue-900/20 text-blue-300'
              }`}>
                <div className="font-medium">{txStatus.message}</div>
                {txHash && (
                  <div className="mt-2">
                    <a 
                      href={`https://testnet.snowtrace.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline hover:no-underline"
                    >
                      View Transaction: {txHash.slice(0, 10)}...{txHash.slice(-6)}
                    </a>
                  </div>
                )}
              </div>
            )}

            {walletError && (
              <div className="p-3 rounded-xl bg-red-900/20 text-red-300">
                <div className="font-medium">⚠️ {walletError}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StakingModal;