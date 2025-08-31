import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Create the context
interface WalletContextType {
  isConnected: boolean;
  account: string | null;
  balance: string;
  chainId: number | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  loading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToFuji: () => Promise<void>;
  updateBalance: (address?: string, web3Provider?: ethers.providers.Web3Provider | null) => Promise<void>;
  isMetaMaskInstalled: () => boolean;
  isOnFuji: boolean;
  getNetworkName: () => string;
  formatAddress: (address?: string) => string;
  CONTRACT_ADDRESSES: typeof CONTRACT_ADDRESSES;
  FUJI_CONFIG: typeof FUJI_CONFIG;
}

const WalletContext = createContext<WalletContextType | null>(null);

// Fuji testnet configuration
const FUJI_CONFIG = {
  chainId: '0xA869', // 43113 in hex
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/']
};

// Contract addresses - Updated with your new SimpleStaking contract
export const CONTRACT_ADDRESSES = {
  STAKING_CONTRACT: '0x472257E81fA62d3560Ace49f7d03171990e93C93' // Update with your deployed address
};

// Provider component
const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please check your MetaMask.');
      }

      // Create provider and signer (ethers v5 compatible)
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const web3Signer = web3Provider.getSigner();
      
      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setIsConnected(true);

      // Get network info
      const network = await web3Provider.getNetwork();
      const chainIdNumber = Number(network.chainId);
      console.log('🔍 Detected network:', { 
        name: network.name, 
        chainId: chainIdNumber,
        isFuji: chainIdNumber === 43113
      });
      setChainId(chainIdNumber);

      // Get balance
      await updateBalance(accounts[0], web3Provider);

      // Switch to Fuji if not already
      if (chainIdNumber !== 43113) {
        console.log('⚠️ Not on Fuji, attempting to switch...');
        await switchToFuji();
        // Re-check network after switching
        const newNetwork = await web3Provider.getNetwork();
        const newChainId = Number(newNetwork.chainId);
        console.log('🔄 Network after switch:', newChainId);
        setChainId(newChainId);
      }

      console.log('✅ Wallet connected successfully');

    } catch (err: unknown) {
      console.error('❌ Wallet connection failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMessage);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setBalance('0');
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setError(null);
    console.log('👋 Wallet disconnected');
  };

  // Switch to Fuji network
  const switchToFuji = async () => {
    try {
      console.log('🔄 Attempting to switch to Fuji network...');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: FUJI_CONFIG.chainId }],
      });
      console.log('✅ Successfully switched to Fuji network');
    } catch (switchError: unknown) {
      const error = switchError as { code?: number; message?: string };
      console.log('⚠️ Switch failed, error code:', error.code);
      
      // Network not added, try to add it
      if (switchError.code === 4902) {
        try {
          console.log('📝 Adding Fuji network to MetaMask...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [FUJI_CONFIG],
          });
          console.log('✅ Successfully added and switched to Fuji network');
        } catch (addError: unknown) {
          console.error('❌ Failed to add Fuji network:', addError);
          throw new Error('Could not add Fuji network. Please add it manually in MetaMask.');
        }
      } else if (error.code === 4001) {
        // User rejected the request
        console.log('👤 User rejected network switch');
        throw new Error('Please switch to Fuji testnet to continue');
      } else {
        console.error('❌ Failed to switch to Fuji network:', switchError);
        throw new Error('Failed to switch network: ' + (error.message || 'Unknown error'));
      }
    }
  };

  // Update balance
  const updateBalance = async (address: string = account || '', web3Provider: ethers.providers.Web3Provider | null = provider) => {
    try {
      if (address && web3Provider) {
        const balance = await web3Provider.getBalance(address);
        const balanceInEther = ethers.utils.formatEther(balance);
        setBalance(parseFloat(balanceInEther).toFixed(4));
      }
    } catch (err) {
      console.error('❌ Failed to update balance:', err);
    }
  };

  // Check connection on load
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
          if (accounts.length > 0) {
            // Auto-connect if previously connected
            await connectWallet();
          }
        } catch (err) {
          console.log('No previous connection found');
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          updateBalance(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        const numericChainId = parseInt(chainId, 16);
        setChainId(numericChainId);
        // Reload if not on Fuji
        if (numericChainId !== 43113) {
          console.log('⚠️ Please switch to Fuji testnet');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [account]);

  // Helper functions
  const isOnFuji = chainId === 43113;
  const getNetworkName = () => {
    if (chainId === 43113) return 'Fuji Testnet';
    if (chainId === 43114) return 'Avalanche Mainnet';
    return `Unknown (${chainId})`;
  };

  const formatAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Context value
  const contextValue = {
    // State
    isConnected,
    account,
    balance,
    chainId,
    provider,
    signer,
    loading,
    error,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchToFuji,
    updateBalance,
    
    // Helpers
    isMetaMaskInstalled,
    isOnFuji,
    getNetworkName,
    formatAddress,
    
    // Constants
    CONTRACT_ADDRESSES,
    FUJI_CONFIG
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export default WalletProvider;