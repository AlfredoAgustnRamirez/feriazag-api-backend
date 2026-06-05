const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const conection = require('./conection');

const productoRoute = require('./routes/productoRoute');
const ventaRoute = require('./routes/ventaRoute');
const ventaDetalleRoute = require('./routes/ventaDetalleRoute');
const userRoute = require('./routes/userRoute');
const mpRoute = require('./routes/mpRoute');
const backupRoute = require('./routes/backupRoute');
const compraRoute = require('./routes/compraRoute');
const proveedorRoute = require('./routes/proveedorRoute');
const cajaRoute = require('./routes/cajaRoute');
const reporteRoute = require('./routes/reporteRoute');
const dashboardRoute = require('./routes/dashboardRoute');
const bitacoraRoute = require('./routes/bitacoraRoute');
const localRoute = require('./routes/localRoute');
const pagoRoute = require('./routes/pagoRoute');
const categoriaRoute = require('./routes/categoriaRoute');
const clienteRoute = require('./routes/clienteRoute');

const app = express();


app.use(express.json({ limit: '50mb' }));        
app.use(express.urlencoded({ extended: true, limit: '50mb' })); 
app.use(express.raw({ type: 'application/json', limit: '50mb' }));

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
}));

app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  if (req.method === 'POST' && req.path.includes('/producto/stock/transferir')) {
  }
  next();
});

app.use('/user', userRoute);        
app.use('/dashboard', dashboardRoute);
app.use('/reporte', reporteRoute);
app.use('/bitacora', bitacoraRoute);
app.use('/compra', compraRoute);
app.use('/proveedor', proveedorRoute);
app.use('/caja', cajaRoute);
app.use('/venta', ventaRoute);
app.use('/ventaDetalle', ventaDetalleRoute);
app.use('/pago', pagoRoute);
app.use('/mp', mpRoute);
app.use('/producto', productoRoute); 
app.use('/categoria', categoriaRoute);
app.use('/cliente', clienteRoute);
app.use('/backup', backupRoute);
app.use('/local', localRoute);

app.get('/', (req, res) => {
  res.send('API funcionando correctamente ✅');
});

app.use('*', (req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

module.exports = app;