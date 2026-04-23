import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidation');

interface EnvVarSpec {
  name: string;
  required: boolean;
  description: string;
}

const ENV_VARS: EnvVarSpec[] = [
  // Required — app will not start without these
  { name: 'NEXT_PUBLIC_SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, description: 'Supabase anonymous key' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Supabase service-role key' },
  { name: 'JWT_SECRET', required: true, description: 'Secret used to sign JWTs' },

  // Optional — warn if missing but allow startup
  { name: 'API_PORT', required: false, description: 'Port the API listens on (default 4000)' },
  { name: 'DATABASE_URL', required: false, description: 'Direct Postgres connection string' },
  { name: 'GEMINI_API_KEY', required: false, description: 'Google Gemini API key for AI features' },
  { name: 'RESEND_API_KEY', required: false, description: 'Resend API key for transactional email' },
  { name: 'SENTRY_DSN', required: false, description: 'Sentry DSN for error tracking' },
  { name: 'CORS_ORIGIN', required: false, description: 'Comma-separated list of allowed CORS origins' },
];

/**
 * Validates that required environment variables are present at startup.
 * Should be called before NestFactory.create() so the process exits early
 * on misconfiguration rather than failing silently later.
 */
export function validateEnv(): void {
  const missing: string[] = [];

  for (const spec of ENV_VARS) {
    const value = process.env[spec.name];
    if (spec.required && (!value || value.trim() === '')) {
      missing.push(spec.name);
    } else if (!spec.required && (!value || value.trim() === '')) {
      logger.warn(`Optional env var ${spec.name} is not set (${spec.description})`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Please check your .env file or environment configuration.',
    );
  }
}
