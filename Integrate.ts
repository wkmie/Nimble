import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AIService {
  private openai: OpenAIApi;

  constructor(private prisma: PrismaService) {
    const configuration = new Configuration({
      apiKey: 'your-openai-api-key', //将OpenAI API的密钥配置到这里
    });
    this.openai = new OpenAIApi(configuration); // 创建OpenAI API实例
  }

  async generateTradingRecommendation(tradingData: string): Promise<string> {
    const prompt = `
      Based on the following trading data, provide a recommendation for the next best trade:
      ${tradingData}
    `;
    const response = await this.openai.createCompletion({
      model: 'text-davinci-003', // 使用GPT-3.5 模型进行推荐
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.data.choices[0].text.trim(); // 返回生成的建议
  }

  async getRecentTrades(walletAddress: string) {
    // 从数据库中获取用户的最近交易记录
    const trades = await this.prisma.trade.findMany({
      where: { walletAddress },
      orderBy: { createdAt: 'desc' },   // 按照创建时间降序排列
      take: 10,
    });

    return trades;
  }
}
