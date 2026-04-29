require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Proteção de Headers
app.use(helmet());

//  Rate Limiting no Gateway 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // Limita cada IP a 200 requisições
  message: "Muitas requisições vindas deste IP. Proteção do Gateway ativada."
});
app.use(limiter);

//  Proxy para auth-service
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/auth' },
  // Melhoria: Timeout 
  proxyTimeout: 5000, 
  onProxyReq: (proxyReq, req, res) => {
    // Log básico para debug 
    console.log(`[GATEWAY] Roteando para AUTH: ${req.method} ${req.url}`);
  }
}));

// 4. Proxy para product-service
app.use('/api/products', createProxyMiddleware({
  target: process.env.PRODUCT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/products': '/products' },
  proxyTimeout: parseInt(process.env.PROXY_TIMEOUT) || 5000,
  timeout: parseInt(process.env.PROXY_TIMEOUT) || 5000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[GATEWAY] Roteando para PRODUCTS: ${req.method} ${req.url}`);
  }
}));

app.listen(PORT, () => {
  console.log(` Gateway rodando na porta ${PORT}`);
});