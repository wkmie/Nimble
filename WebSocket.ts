import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway()
export class TradeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;  // WebSocket 服务器实例
  private connectedClients: Set<Socket> = new Set();  // 存储连接的客户端

  // 当客户端连接时触发
  handleConnection(client: Socket) {
    console.log('Client connected: ', client.id);
    this.connectedClients.add(client);
  }

  // 当客户端断开连接时触发
  handleDisconnect(client: Socket) {
    console.log('Client disconnected: ', client.id);
    this.connectedClients.delete(client);
  }

  // 客户端发送的订阅消息
  @SubscribeMessage('subscribeToTrades')
  handleTradeSubscription(@MessageBody() walletAddress: string, client: Socket) {
    console.log(`Client ${client.id} subscribed to trades for wallet: ${walletAddress}`);
    // 这里可以根据钱包地址订阅相应的交易事件
    client.join(walletAddress); // 让客户端加入到特定的房间，基于钱包地址区分
  }

  // 向所有客户端广播交易事件
  sendTradeEvent(walletAddress: string, tradeEvent: string) {
    console.log('Broadcasting trade event:', tradeEvent);
    // 向特定房间（钱包地址）广播交易事件
    this.server.to(walletAddress).emit('tradeEvent', tradeEvent);
  }
}
