import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAI } from 'openai';

@Injectable()
export class TradeRecommendationService {
  constructor(private readonly prisma: PrismaService, private readonly openai: OpenAI) {}

  async getRecommendations(walletAddress: string) {
    // 获取最近的交易数据
    const recentTrades = await this.prisma.trade.findMany({
      where: { walletAddress },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // 生成 AI 交易建议
    const aiResponse = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: '你是一个专业的加密货币交易分析师。' },
        { role: 'user', content: `基于以下交易数据提供建议：${JSON.stringify(recentTrades)}` },
      ],
    });

    return { recommendations: aiResponse.choices[0].message.content };
  }
}