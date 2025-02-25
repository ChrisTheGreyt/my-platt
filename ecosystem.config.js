module.exports = {
  apps: [{
    name: "myplatt",
    script: "dist/index.js",
    env: {
      NODE_ENV: "production",
      FRONTEND_URL: "https://main.d249lhj5v2utjs.amplifyapp.com"
    }
  }]
}; 