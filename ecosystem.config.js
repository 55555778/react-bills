module.exports = {
  apps: [
    {
      name: 'bills',
      script: 'dist/main.js',
      env: {
        LISTENPORT: 8699, // 明确指定端口
        NODE_ENV: 'production',
      },
    },
  ],
};
