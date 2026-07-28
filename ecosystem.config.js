/**
 * PM2 ecosystem for Pasar Jaya frontend (Next.js 16) — PRODUCTION only.
 *
 * Cara jalanin (dari folder ecommerce-fe):
 *   pm2 start ecosystem.config.js
 *   pm2 stop ecommerce-fe
 *   pm2 restart ecommerce-fe
 *   pm2 logs ecommerce-fe
 */

module.exports = {
	apps: [
		{
			name: "ecommerce-fe",
			script: "node_modules/next/dist/bin/next",
			args: "start",
			instances: 1,
			exec_mode: "fork",
			autorestart: true,
			max_restarts: 10,
			min_uptime: "10s",
			restart_delay: 1000,
			max_memory_restart: "1G",
			out_file: "./logs/prod-out.log",
			error_file: "./logs/prod-error.log",
			merge_logs: true,
			log_date_format: "YYYY-MM-DD HH:mm:ss Z",
			log_rotation: true,
			log_type: "json",
			watch: false,
			ignore_watch: ["node_modules", ".next", "logs"],
			kill_timeout: 5000,
			listen_timeout: 8000,
			env: {
				NODE_ENV: "production",
				PORT: 6699,
			},
		},
	],
};
