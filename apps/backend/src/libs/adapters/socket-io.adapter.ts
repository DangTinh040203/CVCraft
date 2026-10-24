import { type INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { type Server, type ServerOptions } from 'socket.io';

/**
 * Socket.IO with the same CORS origin as the HTTP API. Set here rather than
 * in @WebSocketGateway, whose options are read before the env is loaded.
 */
export class SocketIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly origin: string,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    return super.createIOServer(port, {
      ...options,
      cors: { origin: this.origin, credentials: true },
    }) as Server;
  }
}
