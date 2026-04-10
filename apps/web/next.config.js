const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: ".next-build"
};

module.exports = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during bundling
    silent: !process.env.CI,
    org: "exam-craft",
    project: "web-app",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,
    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,
    // Routes browser requests to Sentry through a dot-path to avoid ad-blockers (e.g., "/monitoring")
    tunnelRoute: "/monitoring",
    // Hides source maps from visitors
    hideSourceMaps: true,
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
    // Enables automatic instrumentation of Vercel Cron Monitors.
    automaticVercelMonitors: true,
  }
);
