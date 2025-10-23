import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5174;

// Serve static files from the built admin directory
app.use('/admin', express.static(path.join(__dirname, 'dist/admin')));

// Proxy API requests to Django backend
app.use('/api', createProxyMiddleware({
  target: 'http://127.0.0.1:8001',
  changeOrigin: true,
  secure: false,
}));

// Proxy media requests to Django backend
app.use('/media', createProxyMiddleware({
  target: 'http://127.0.0.1:8001',
  changeOrigin: true,
  secure: false,
}));

// Handle SPA routing for admin - serve index.html for all admin routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/admin/index.html'));
});

// Catch all other admin routes
app.get('/admin/:path*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/admin/index.html'));
});

// Redirect root to admin
app.get('/', (req, res) => {
  res.redirect('/admin/');
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Admin panel server running at http://127.0.0.1:${PORT}/admin/`);
  console.log('API requests will be proxied to http://127.0.0.1:8001');
});
