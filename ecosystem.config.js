/**
 * PM2 ecosystem configuration for Snowy's Store (Next.js 16 production).
 *
 * Usage:
 *   npm install -g pm2                # install PM2 globally
 *   npm run build                     # build production bundle
 *   pm2 start ecosystem.config.js     # start with PM2
 *   pm2 save                          # save process list for restart on boot
 *   pm2 startup                       # generate startup script
 *
 * Common commands:
 *   pm2 status                        # check status
 *   pm2 logs ecommerce-fe             # tail logs
 *   pm2 restart ecommerce-fe          # restart app
 *   pm2 reload ecommerce-fe           # zero-downtime reload
 *   pm2 stop ecommerce-fe             # stop
 *   pm2 delete ecommerce-fe           # remove from PM2
 *   pm2 monit                         # live monitoring dashboard
 */

module.exports = {
  apps: [
    {
      name: "ecommerce-fe",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      // Run Next.js production server on port 3000 (override with PORT env)
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Working directory — uncomment if PM2 runs from elsewhere
      // cwd: "/var/www/ecommerce-fe",

      // ─── Process management ──────────────────────────────────────
      // Run as cluster for multi-core CPUs. Set to 1 for single instance.
      instances: 1, // use "max" or -1 to use all CPU cores
      exec_mode: "fork", // use "cluster" if you set instances > 1

      // Auto-restart on crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 1000, // 1s between restarts

      // Memory limit — restart if exceeded (1GB)
      max_memory_restart: "1G",

      // ─── Logging ──────────────────────────────────────────────────
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      log_rotation: true,
      // Keep last 7 daily rotations, max 50MB each
      log_type: "json",

      // ─── Watch & reload (disabled for production) ────────────────
      watch: false,
      ignore_watch: ["node_modules", ".next", "logs"],

      // ─── Process metadata ─────────────────────────────────────────
      pm2_version: ">=5.0.0",
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 8000,

      // ─── Environment overrides (optional) ────────────────────────
      // env_production: {
      //   NODE_ENV: "production",
      //   PORT: 3000,
      // },
    },
  ],

  // ─── Deploy block (optional — for pm2 deploy) ─────────────────────
  // Uncomment and configure if you use `pm2 deploy production` for CI/CD.
  // deploy: {
  //   production: {
  //     user: "deploy",
  //     host: ["your-server-ip"],
  //     ref: "origin/main",
  //     repo: "git@github.com:Arcson-Development/ecommerce-fe.git",
  //     path: "/var/www/ecommerce-fe",
  //     "pre-deploy-local": "",
  //     "post-deploy":
  //       "npm ci && npm run build && pm2 reload ecosystem.config.js",
  //     "pre-setup": "",
  //   },
  // },
};
