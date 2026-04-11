import { Injectable } from "@nestjs/common";

@Injectable()
export class FlagsService {
  async getFlags() {
    // Stub: feature flag CRUD
    return { 
      flags: [
        { key: "ai_generation", enabled: true, description: "Enable AI question generation" },
        { key: "bulk_import", enabled: true, description: "Enable bulk question import" },
      ] 
    };
  }

  async updateFlag(key: string, value: boolean) {
    // Stub: feature flag update
    return { key, value, updated: true, timestamp: new Date().toISOString() };
  }
}
