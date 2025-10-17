export interface YieldData {
    protocol: string;
    category: string;
    pair: string;
    apy: string;
    tvl: string;
    risk: 'Low' | 'Medium' | 'High';
    icon: string;
  }
  
  export interface ProtocolData {
    id: number;
    name: string;
    category: string;
    tvl: string;
    apy: string;
    description: string;
    features: string[];
    icon: string;
  }
  
  export type PageType = 'home' | 'yields' | 'protocols' | 'dashboard';
  
  export interface NavigationProps {
    currentPage: PageType;
    onNavigate: (page: PageType) => void;
  }