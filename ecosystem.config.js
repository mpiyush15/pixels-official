module.exports = {
  apps: [
    {
      name: 'pixels-official',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1, // Change to 'max' to use all CPU cores if needed
      exec_mode: 'fork', // Use 'cluster' if instances > 1
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
