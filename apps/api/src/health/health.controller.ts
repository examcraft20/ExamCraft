import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';

@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('api-status', 'http://localhost:4000/api/v1/health/live'),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
    return this.health.check([
      () => this.http.pingCheck('supabase-api', `${supabaseUrl}/auth/v1/health`),
    ]);
  }

  @Get('live')
  @HealthCheck()
  live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
