import { Injectable } from '@nestjs/common';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class SolanaService {
  private connection = new Connection(clusterApiUrl('mainnet-beta'));

  constructor(private cacheService: CacheService) {}

  async fetchRecentTrades(walletAddress: string) {
    // 构建缓存的 key，使用钱包地址作为缓存的标识符
    const cacheKey = `trades:${walletAddress}`;
    
    // 先检查 Redis 是否有缓存数据
    const cachedData = await this.cacheService.getCachedData(cacheKey);
    if (cachedData) {
      console.log('Cache hit, returning cached data');
      return JSON.parse(cachedData);  // 返回缓存的交易数据
    }

    // 缓存未命中，查询 Solana 网络
    const pubKey = new PublicKey(walletAddress);
    const signatures = await this.connection.getSignaturesForAddress(pubKey, { limit: 10 });
    const trades = await Promise.all(
      signatures.map(sig => this.connection.getTransaction(sig.signature))
    );

    // 将查询结果缓存到 Redis，设置 60 秒后过期
    await this.cacheService.setCache(cacheKey, JSON.stringify(trades), 60);

    return trades;
  }
}
