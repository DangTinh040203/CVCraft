import { Injectable } from '@nestjs/common';

export interface HealthResponse {
  data: { status: string };
  message: string;
  statusCode: number;
}

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      data: { status: 'ok' },
      message: 'Service is healthy',
      statusCode: 200,
    };
  }
}
