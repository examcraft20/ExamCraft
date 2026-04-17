import { Controller, Get } from "@nestjs/common";
import { Public } from "./auth/decorators/public.decorator";

@Controller({ path: "health", version: "1" })
export class AppController {
  @Public()
  @Get()
  getHealth() {
    return {
      status: "ok",
      service: "examcraft-api",
      timestamp: new Date().toISOString()
    };
  }
}

