import { Injectable } from '@nestjs/common';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { PrismaService } from '../prisma/prisma.service';   //通过PrismaService来访问数据库

@Injectable()
export class SolanaService {
  private connection = new Connection(clusterApiUrl('mainnet-beta'));   //连接到主网

  async fetchRecentTrades(walletAddress: string) {
    const signatures = await this.connection.getSignaturesForAddress(new PublicKey(walletAddress), { limit: 10 });  //获取最近10笔交易的签名，返回签名数组
    const trades = await Promise.all(signatures.map(sig => this.connection.getTransaction(sig.signature)));  //根据签名，获取交易详情
    
    // 存入数据库
    await this.prisma.trade.createMany({ 
        data: trades.map(t => ({ 
            signature: t?.transaction.signatures[0],    //提取签名
            data: JSON.stringify(t)     //将交易详情转为JSON字符串
        })) 
    });
    
    return trades;
  }
}
