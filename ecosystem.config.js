/**
 * PM2 ecosystem for Pasar Jaya frontend (Next.js 16).
 *
 * PENTING — port TIDAK boleh diubah-ubah:
 *   - Production & Dev SAMA-SAMA di PORT 6699.
 *   - Karena port identik, JANGAN jalankan prod & dev bersamaan.
 *     Jalankan salah satu saja via flag --only (lihat bawah).
 *   - KEDUA app TETAP ada di PM2 list; yang tidak dipakai cukup di-STOP
 *     (JANGAN di-delete) biar port tidak tabrakan.
 *
 *   Di laptop lokal Juniko      -> jalankan DEV   (ecommerce-fe-dev)
 *   Di VPS (production) nanti   -> jalankan PROD  (ecommerce-fe-prod)
 *
 * Cara jalanin (dari folder ecommerce-fe):
 *   pm2 start ecosystem.config.js --only ecommerce-fe-dev    # laptop ini
 *   pm2 start ecosystem.config.js --only ecommerce-fe-prod   # VPS
 *
 * Switch dev <-> prod (stop yang lain, jangan delete):
 *   pm2 stop ecommerce-fe-dev  && pm2 start ecosystem.config.js --only ecommerce-fe-prod
 *   pm2 stop ecommerce-fe-prod && pm2 start ecosystem.config.js --only ecommerce-fe-dev
 *
 * Lainnya:
 *   pm2 logs ecommerce-fe-dev      # tail dev logs
 *   pm2 restart ecommerce-fe-dev   # restart dev
 *   pm2 status                     # lihat semua (dev + prod, salah satu stopped)
 *   pm2 save                        # persist list
 */

module.exports = {
  apps: [
    // ── PRODUCTION (untuk VPS) ──────────────────────────────────────
    {
      name: 'ecommerce-fe-prod',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 1000,
      max_memory_restart: '1G',
      out_file: './logs/prod-out.log',
      error_file: './logs/prod-error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      log_rotation: true,
      log_type: 'json',
      watch: false,
      ignore_watch: ['node_modules', '.next', 'logs'],
      kill_timeout: 5000,
      listen_timeout: 8000,
      env: {
        NODE_ENV: 'production',
        PORT: 6699, // JANGAN UBAH — sama dengan dev
      },
    },

    // ── DEV (laptop Juniko) — next dev, port SAMA 6699 ──────────────
    {
      name: 'ecommerce-fe-dev',
      script: 'node_modules/next/dist/bin/next',
      args: 'dev',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 1000,
      max_memory_restart: '1G',
      out_file: './logs/dev-out.log',
      error_file: './logs/dev-error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      log_rotation: true,
      log_type: 'json',
      watch: false,
      ignore_watch: ['node_modules', '.next', 'logs'],
      kill_timeout: 5000,
      listen_timeout: 8000,
      env: {
        NODE_ENV: 'development',
        PORT: 6699, // JANGAN UBAH — sama dengan prod
      },
    },
  ],
};
