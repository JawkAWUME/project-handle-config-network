import { Module } from '@nestjs/common';
import { SshGateway } from './ssh.gateway';

@Module({
  providers: [SshGateway],
})
export class SshModule {}