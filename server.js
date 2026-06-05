require('dotenv').config();
const app = require('./index');
const http = require('http');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}/`);
});