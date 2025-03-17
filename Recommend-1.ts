import { Controller, Get, Query } from '@nestjs/common';
import { TradeRecommendationService } from './trade-recommendation.service';

@Controller('recommendations')
export class TradeRecommendationController {
  constructor(private readonly tradeRecommendationService: TradeRecommendationService) {}

  @Get()
  async getTradeRecommendations(@Query('walletAddress') walletAddress: string) {
    return this.tradeRecommendationService.getRecommendations(walletAddress);
  }
}