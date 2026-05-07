import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Client, ConnectConfig } from 'ssh2';
import { UseGuards } from '@nestjs/common';
import { transport } from 'winston';
// import { WsJwtGuard } from '../auth/ws-jwt.guard'; // à brancher selon ton auth

interface SshSessionMeta {
  client: Client;
  stream: any;
}

@WebSocketGateway({
  namespace: '/ssh',
  cors: { origin: '*', methods: ['GET', 'POST'], credentials: false }, 
  allowEIO3: true, // ← restreindre en prod
  transports: ['polling','websocket'], // ← restreindre en prod
})
export class SshGateway implements OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  // Map socketId → session SSH active
  private sessions = new Map<string, SshSessionMeta>();

  // ── Connexion SSH ─────────────────────────────────────────
  @SubscribeMessage('ssh:connect')
  async handleConnect(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    payload: {
      host: string;
      port?: number;
      username: string;
      password: string;
      cols?: number;
      rows?: number;
    },
  ) {
    // Fermer une session précédente si elle existe
    this.destroySession(socket.id);

    const conn = new Client();

    const config: ConnectConfig = {
      host:     payload.host,
      port:     payload.port ?? 22,
      username: payload.username,
      password: payload.password,
      readyTimeout: 8000,
      // Pour les équipements réseau (Cisco, Fortinet…) qui ont des algos anciens :
      algorithms: {
        kex: [
          'diffie-hellman-group14-sha1',
          'diffie-hellman-group1-sha1',
          'ecdh-sha2-nistp256',
          'ecdh-sha2-nistp384',
        ],
        cipher: [
          'aes128-cbc', '3des-cbc',
          'aes256-cbc', 'aes128-ctr', 'aes256-ctr',
        ],
        serverHostKey: ['ssh-rsa', 'ssh-dss', 'ecdsa-sha2-nistp256'],
        hmac: ['hmac-sha1', 'hmac-sha2-256'],
      },
    };

    conn.on('ready', () => {
      socket.emit('ssh:connected', { message: 'SSH session established' });

      conn.shell(
        {
          term:   'xterm-256color',
          cols:   payload.cols ?? 220,
          rows:   payload.rows ?? 50,
        },
        (err, stream) => {
          if (err) {
            socket.emit('ssh:error', { message: err.message });
            conn.end();
            return;
          }

          this.sessions.set(socket.id, { client: conn, stream });

          // Données SSH → client Angular
          stream.on('data', (data: Buffer) => {
            socket.emit('ssh:data', data.toString('utf-8'));
          });

          stream.stderr.on('data', (data: Buffer) => {
            socket.emit('ssh:data', data.toString('utf-8'));
          });

          stream.on('close', () => {
            socket.emit('ssh:closed', { message: 'Session closed' });
            this.destroySession(socket.id);
          });
        },
      );
    });

    conn.on('error', (err) => {
      socket.emit('ssh:error', { message: err.message });
      this.destroySession(socket.id);
    });

    conn.connect(config);
  }

  // ── Input utilisateur → équipement ───────────────────────
  @SubscribeMessage('ssh:input')
  handleInput(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: string,
  ) {
    const session = this.sessions.get(socket.id);
    if (session?.stream) {
      session.stream.write(data);
    }
  }

  // ── Resize terminal ───────────────────────────────────────
  @SubscribeMessage('ssh:resize')
  handleResize(
    @ConnectedSocket() socket: Socket,
    @MessageBody() size: { cols: number; rows: number },
  ) {
    const session = this.sessions.get(socket.id);
    session?.stream?.setWindow(size.rows, size.cols, 0, 0);
  }

  // ── Déconnexion WebSocket ─────────────────────────────────
  handleDisconnect(socket: Socket) {
    this.destroySession(socket.id);
  }

  private destroySession(socketId: string) {
    const session = this.sessions.get(socketId);
    if (session) {
      try { session.stream?.end(); } catch (_) {}
      try { session.client?.end(); } catch (_) {}
      this.sessions.delete(socketId);
    }
  }
}