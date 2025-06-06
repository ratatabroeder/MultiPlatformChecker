import axios from 'axios';
import * as cheerio from 'cheerio';
import { InsertProxy, Proxy } from '@shared/schema';

class ProxyScraper {
  private sources = {
    freeproxylist: 'https://free-proxy-list.net/',
    proxynova: 'https://www.proxynova.com/proxy-server-list/',
    hidemy: 'https://hidemy.name/en/proxy-list/'
  };

  async scrapeProxies(sources: string[] = ['freeproxylist']): Promise<InsertProxy[]> {
    const allProxies: InsertProxy[] = [];
    
    for (const source of sources) {
      try {
        const proxies = await this.scrapeSource(source);
        allProxies.push(...proxies);
      } catch (error) {
        console.error(`Failed to scrape ${source}:`, error);
      }
    }
    
    // Remove duplicates
    const uniqueProxies = allProxies.filter((proxy, index, self) => 
      index === self.findIndex(p => p.host === proxy.host && p.port === proxy.port)
    );
    
    return uniqueProxies;
  }

  private async scrapeSource(source: string): Promise<InsertProxy[]> {
    switch (source) {
      case 'freeproxylist':
        return this.scrapeFreeProxyList();
      case 'proxynova':
        return this.scrapeProxyNova();
      case 'hidemy':
        return this.scrapeHideMy();
      default:
        return [];
    }
  }

  private async scrapeFreeProxyList(): Promise<InsertProxy[]> {
    try {
      const response = await axios.get(this.sources.freeproxylist, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      const proxies: InsertProxy[] = [];
      
      $('#proxylisttable tbody tr').each((_, element) => {
        const cells = $(element).find('td');
        if (cells.length >= 7) {
          const host = $(cells[0]).text().trim();
          const port = parseInt($(cells[1]).text().trim());
          const country = $(cells[3]).text().trim();
          const https = $(cells[6]).text().trim() === 'yes';
          
          if (host && port && !isNaN(port)) {
            proxies.push({
              host,
              port,
              type: https ? 'http' : 'http',
              country: country || null,
              city: null,
              source: 'freeproxylist',
              isWorking: false,
              responseTime: null,
              lastTested: null,
            });
          }
        }
      });
      
      return proxies.slice(0, 50); // Limit to 50 proxies
    } catch (error) {
      console.error('Error scraping FreeProxyList:', error);
      return [];
    }
  }

  private async scrapeProxyNova(): Promise<InsertProxy[]> {
    // Mock implementation for ProxyNova
    return [
      {
        host: '192.168.1.100',
        port: 8080,
        type: 'http',
        country: 'Netherlands',
        city: 'Amsterdam',
        source: 'proxynova',
        isWorking: false,
        responseTime: null,
        lastTested: null,
      },
      {
        host: '10.0.0.50',
        port: 3128,
        type: 'http',
        country: 'Germany',
        city: 'Berlin',
        source: 'proxynova',
        isWorking: false,
        responseTime: null,
        lastTested: null,
      }
    ];
  }

  private async scrapeHideMy(): Promise<InsertProxy[]> {
    // Mock implementation for HideMy
    return [
      {
        host: '172.16.0.10',
        port: 8080,
        type: 'http',
        country: 'Belgium',
        city: 'Brussels',
        source: 'hidemy',
        isWorking: false,
        responseTime: null,
        lastTested: null,
      }
    ];
  }

  async testProxy(proxy: Proxy): Promise<boolean> {
    try {
      const startTime = Date.now();
      const response = await axios.get('http://httpbin.org/ip', {
        proxy: {
          host: proxy.host,
          port: proxy.port,
        },
        timeout: 5000,
      });
      
      const responseTime = Date.now() - startTime;
      return response.status === 200 && responseTime < 10000;
    } catch (error) {
      return false;
    }
  }

  async testProxyBatch(proxies: Proxy[]): Promise<{ proxy: Proxy; isWorking: boolean; responseTime?: number }[]> {
    const results = await Promise.allSettled(
      proxies.map(async proxy => {
        const startTime = Date.now();
        const isWorking = await this.testProxy(proxy);
        const responseTime = isWorking ? Date.now() - startTime : undefined;
        return { proxy, isWorking, responseTime };
      })
    );

    return results
      .filter((result): result is PromiseFulfilledResult<{ proxy: Proxy; isWorking: boolean; responseTime?: number }> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }
}

export const proxyScraper = new ProxyScraper();
