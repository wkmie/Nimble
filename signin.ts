import { Controller, Post, Body } from '@nestjs/common';
import { PublicKey, verifySignature } from '@solana/web3.js';

@Controller('auth') //用于认证的控制器，路径为 /auth
export class AuthController {
  @Post('login')    //路径为 /auth/login
  async login(@Body() { address, signature, message }: { address: string; signature: string; message: string }) {
    const pubKey = new PublicKey(address);  //根据地址创建公钥
    const isValid = verifySignature(Buffer.from(message), Buffer.from(signature), pubKey.toBytes());    //验证签名

    if (!isValid) throw new Error('Invalid signature'); //签名无效的情况下抛出异常

    return { token: 'JWT_TOKEN_HERE' }; //返回JWT token
  }
}
