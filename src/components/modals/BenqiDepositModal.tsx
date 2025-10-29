'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { useBenqiDeposit } from '@/hooks/benqi/useBenqiDeposit';
import { useBenqiBalance } from '@/hooks/benqi/useBenqiBalance';
import type { BenqiBalance } from '@/types/benqi';

interface BenqiDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BenqiDepositModal: React.FC<BenqiDepositModalProps> = ({
  isOpen,
  onClose
}) => {
  const { address: account, chainId: wagmiChainId } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [depositAmount, setDepositAmount] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [txStatus, setTxStatus] = useState<{ message: string; type: string } | null>(null);
  const [isAvalancheMainnet, setIsAvalancheMainnet] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  // Initialize provider and signer from wagmi
  useEffect(() => {
    const initializeEthers = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum as ethers.providers.ExternalProvider);
        const web3Signer = web3Provider.getSigner();
        setProvider(web3Provider);
        setSigner(web3Signer);
      }
    };
    initializeEthers();
  }, [walletClient]);

  // Check if on Avalanche mainnet
  useEffect(() => {
    setIsAvalancheMainnet(wagmiChainId === 43114);
  }, [wagmiChainId]);

  // BENQI hooks
  const { deposit, isDepositing, depositError } = useBenqiDeposit(signer);
  const { balance, loading: balanceLoading, refetch: refetchBalance } = useBenqiBalance(provider, account || '', false) as {
    balance: BenqiBalance | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<BenqiBalance | null>;
  };

  const switchToAvalanche = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xa86a' }], // Avalanche mainnet chainId in hex (43114)
        });
      }
    } catch (error: unknown) {
      // If the chain hasn't been added, add it
      if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 4902) {
        try {
          if (typeof window !== 'undefined' && window.ethereum) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xa86a',
                chainName: 'Avalanche Network',
                nativeCurrency: {
                  name: 'AVAX',
                  symbol: 'AVAX',
                  decimals: 18
                },
                rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
                blockExplorerUrls: ['https://snowtrace.io/']
              }]
            });
          }
        } catch (addError) {
          console.error('Failed to add network:', addError);
        }
      }
    }
  };

  const showStatus = (message: string, type: string = 'info') => {
    setTxStatus({ message, type });
    setTimeout(() => setTxStatus(null), 5000);
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      showStatus('Please enter a valid deposit amount', 'error');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (amount < 0.1) {
      showStatus('Minimum deposit is 0.1 AVAX', 'error');
      return;
    }

    try {
      showStatus('Processing AVAX deposit...', 'info');

      const result = await deposit(depositAmount) as { success?: boolean; receipt?: { transactionHash: string }; error?: string };

      if (result?.success && result?.receipt) {
        setTxHash(result.receipt.transactionHash);
        showStatus('AVAX deposit successful!', 'success');
        setDepositAmount('');
        await refetchBalance();
      } else if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      console.error('Deposit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      let displayMessage = 'Deposit failed: ';
      if (errorMessage.includes('user rejected')) {
        displayMessage += 'Transaction rejected by user';
      } else if (errorMessage.includes('insufficient funds')) {
        displayMessage += 'Insufficient AVAX balance';
      } else {
        displayMessage += errorMessage;
      }

      showStatus(displayMessage, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative max-w-md w-full rounded-xl bg-card border border-border p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <X size={20} className="text-muted-foreground" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            BENQI Leveraged Yield
          </h2>
          <p className="text-sm text-muted-foreground">
            Automated leveraged staking strategy
          </p>
        </div>

        {/* Network Warning */}
        {!isAvalancheMainnet && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <div className="text-sm font-semibold text-yellow-600 mb-1">
                  Wrong Network
                </div>
                <div className="text-xs text-yellow-600/80 mb-3">
                  BENQI strategy is only available on Avalanche mainnet. Please switch networks to continue.
                </div>
                <button
                  onClick={switchToAvalanche}
                  className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-xs font-medium hover:bg-yellow-700 transition-colors"
                >
                  Switch to Avalanche Mainnet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* APY Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-primary-5 border border-border">
            <div className="text-center">
              <div className="font-bold text-xl text-primary">
                5.5%
              </div>
              <div className="text-xs font-medium mt-1 text-muted-foreground">
                Base APY
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary-5 border border-border">
            <div className="text-center">
              <div className="font-bold text-xl text-primary">
                12.5%
              </div>
              <div className="text-xs font-medium mt-1 text-muted-foreground">
                Enhanced APY
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Info */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border mb-6">
          <div className="text-sm font-semibold text-foreground mb-2">
            Strategy Details:
          </div>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• 6-loop leverage strategy on BENQI</li>
            <li>• 30-day cooldown period for withdrawals</li>
            <li>• Target LTV: 65% with 5% safety buffer</li>
            <li>• Minimum deposit: 0.1 AVAX</li>
          </ul>
        </div>

        {/* Account Info */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border mb-4">
          <div className="text-sm text-muted-foreground mb-1">
            Connected Account
          </div>
          <div className="text-sm font-mono text-foreground">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </div>
        </div>

        {/* Position Stats */}
        {!balanceLoading && balance && parseFloat(balance.currentBalance || '0') > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <div className="text-sm text-muted-foreground mb-1">
                Original Deposit
              </div>
              <div className="text-lg font-bold text-foreground">
                {parseFloat(balance.depositAmount).toFixed(4)} AVAX
              </div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <div className="text-sm text-muted-foreground mb-1">
                Current Balance
              </div>
              <div className="text-lg font-bold text-foreground">
                {parseFloat(balance.currentBalance).toFixed(4)} AVAX
              </div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <div className="text-sm text-muted-foreground mb-1">
                Profit
              </div>
              <div className={`text-lg font-bold ${parseFloat(balance.profit || '0') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                +{parseFloat(balance.profit || '0').toFixed(8)} AVAX
              </div>
            </div>
          </div>
        )}

        {/* Deposit Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-foreground">
            Deposit Amount (AVAX)
          </label>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Min: 0.1 AVAX"
            step="0.1"
            min="0.1"
            className="w-full p-3 rounded-lg bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="text-xs mt-1 text-muted-foreground">
            Minimum: 0.1 AVAX
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleDeposit}
          disabled={isDepositing || !depositAmount || parseFloat(depositAmount) < 0.1 || !isAvalancheMainnet}
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover-lift transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!isAvalancheMainnet ? 'Switch to Avalanche Mainnet' : isDepositing ? 'Processing...' : `Deposit ${depositAmount || ''} AVAX`}
        </button>

        {/* Transaction Status */}
        {txStatus && (
          <div className={`p-3 rounded-lg mt-4 ${
            txStatus.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-600' :
            txStatus.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-600' :
            'bg-blue-500/10 border border-blue-500/20 text-blue-600'
          }`}>
            <div className="font-medium text-sm">{txStatus.message}</div>
            {txHash && (
              <div className="mt-2">
                <a
                  href={`https://snowtrace.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline hover:no-underline"
                >
                  View on SnowTrace
                </a>
              </div>
            )}
          </div>
        )}

        {depositError && (
          <div className="p-3 rounded-lg mt-4 bg-red-500/10 border border-red-500/20 text-red-600">
            <div className="font-medium text-sm">{depositError}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BenqiDepositModal;
