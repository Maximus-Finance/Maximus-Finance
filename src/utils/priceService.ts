interface TokenPrice {
  symbol: string;
  price: number;
  lastUpdated: Date;
}

interface PriceResponse {
  [key: string]: number;
}

export class PriceService {
  private cache: Map<string, TokenPrice> = new Map();
  private cacheTimeout = 30000; // 30 seconds

  async getTokenPrices(symbols: string[]): Promise<PriceResponse> {
    const prices: PriceResponse = {};
    const symbolsToFetch: string[] = [];

    // Check cache first
    for (const symbol of symbols) {
      const cached = this.cache.get(symbol.toLowerCase());
      if (cached && (Date.now() - cached.lastUpdated.getTime()) < this.cacheTimeout) {
        prices[symbol.toLowerCase()] = cached.price;
      } else {
        symbolsToFetch.push(symbol);
      }
    }

    // Fetch missing prices
    if (symbolsToFetch.length > 0) {
      try {
        const freshPrices = await this.fetchPricesFromAPI(symbolsToFetch);
        
        // Update cache and results
        for (const [symbol, price] of Object.entries(freshPrices)) {
          this.cache.set(symbol.toLowerCase(), {
            symbol: symbol.toLowerCase(),
            price,
            lastUpdated: new Date()
          });
          prices[symbol.toLowerCase()] = price;
        }
      } catch (error) {
        console.error('Failed to fetch prices:', error);
        // Use fallback prices
        this.setFallbackPrices(symbolsToFetch, prices);
      }
    }

    return prices;
  }

  private async fetchPricesFromAPI(symbols: string[]): Promise<PriceResponse> {
    // Try multiple price sources for reliability
    const sources = [
      () => this.fetchFromCoinGecko(symbols),
      () => this.fetchFromCoinAPI(symbols),
      () => this.getFallbackPrices(symbols)
    ];

    for (const source of sources) {
      try {
        const prices = await source();
        if (Object.keys(prices).length > 0) {
          return prices;
        }
      } catch (error) {
        console.warn('Price source failed:', error);
        continue;
      }
    }

    return this.getFallbackPrices(symbols);
  }

  private async fetchFromCoinGecko(symbols: string[]): Promise<PriceResponse> {
    const geckoIds = this.mapToGeckoIds(symbols);
    const ids = Object.values(geckoIds).join(',');
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { cache: 'no-cache' }
    );
    
    if (!response.ok) throw new Error('CoinGecko API failed');
    
    const data = await response.json();
    const prices: PriceResponse = {};
    
    for (const [symbol, geckoId] of Object.entries(geckoIds)) {
      if (data[geckoId]?.usd) {
        prices[symbol.toLowerCase()] = data[geckoId].usd;
      }
    }
    
    return prices;
  }

  private async fetchFromCoinAPI(symbols: string[]): Promise<PriceResponse> {
    const prices: PriceResponse = {};
    
    for (const symbol of symbols) {
      try {
        const response = await fetch(
          `https://rest.coinapi.io/v1/exchangerate/${symbol.toUpperCase()}/USD`,
          {
            headers: {
              'X-CoinAPI-Key': process.env.NEXT_PUBLIC_COINAPI_KEY || ''
            },
            cache: 'no-cache'
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.rate) {
            prices[symbol.toLowerCase()] = data.rate;
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch ${symbol} from CoinAPI:`, error);
      }
    }
    
    return prices;
  }

  private mapToGeckoIds(symbols: string[]): Record<string, string> {
    const mapping: Record<string, string> = {
      'avax': 'avalanche-2',
      'eth': 'ethereum',
      'btc': 'bitcoin',
      'usdc': 'usd-coin',
      'usdt': 'tether',
      'dai': 'dai',
      'link': 'chainlink',
      'ggp': 'gogopool',
      'qi': 'benqi',
      'busd': 'binance-usd'
    };

    const result: Record<string, string> = {};
    for (const symbol of symbols) {
      const lowerSymbol = symbol.toLowerCase();
      if (mapping[lowerSymbol]) {
        result[lowerSymbol] = mapping[lowerSymbol];
      }
    }
    
    return result;
  }

  private getFallbackPrices(symbols: string[]): PriceResponse {
    const fallbackPrices: Record<string, number> = {
      'avax': 42.50,
      'eth': 3200.00,
      'btc': 67000.00,
      'usdc': 1.00,
      'usdt': 1.00,
      'dai': 1.00,
      'link': 15.50,
      'ggp': 0.85,
      'qi': 0.007,
      'busd': 1.00
    };

    const prices: PriceResponse = {};
    for (const symbol of symbols) {
      const lowerSymbol = symbol.toLowerCase();
      if (fallbackPrices[lowerSymbol]) {
        prices[lowerSymbol] = fallbackPrices[lowerSymbol];
      }
    }

    return prices;
  }

  private setFallbackPrices(symbols: string[], prices: PriceResponse): void {
    const fallbacks = this.getFallbackPrices(symbols);
    Object.assign(prices, fallbacks);
  }
}

export const priceService = new PriceService();