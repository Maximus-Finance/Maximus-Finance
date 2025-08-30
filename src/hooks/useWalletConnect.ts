'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export const useWalletConnect = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const handleButtonClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      openConnectModal?.();
    }
  };

  const getButtonText = () => {
    if (isConnected && address) {
      return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }
    return 'Connect Wallet';
  };

  return {
    isConnected,
    address,
    buttonText: getButtonText(),
    handleClick: handleButtonClick,
  };
};