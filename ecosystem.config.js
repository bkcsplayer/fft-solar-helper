module.exports = {
    apps: [
        {
            name: 'fft-solar-api',
            script: 'server/index.js',
            interpreter: '/www/server/nodejs/v22.16.0/bin/node',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'development',
                PORT: 6200
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 6200
            },
            error_file: './logs/err.log',
            out_file: './logs/out.log',
            log_file: './logs/combined.log',
            time: true
        }
    ]
};
