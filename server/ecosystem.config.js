
module.exports = {
  apps: [{
    name: 'custodian-1',
    script: 'server.js',
    instance_var: 'INSTANCE_ID',
    instances: 1,
    autorestart: true,
    max_memory_restart: '300M',
    watch: false,
    output: './logs/output-1.log',
    error: './logs/error-1.log',
    env: {
      NODE_ENV: 'production',
      PORT: 6464,
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 6464,
    },
  }],
};
