const express = require('express');
const router = express.Router();
const axios = require('axios');
const { verificarToken } = require('../middlewares/auth'); 

const ACCESS_TOKEN = 'APP_USR-2175386756154433-040214-4c5ac939e9defd77f721becc6689e29c-1177027812';

router.post('/crear-preferencia',verificarToken, async (req, res) => {
  
  try {
    const { total } = req.body;
    const monto = Number(total);
    
    if (isNaN(monto) || monto <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }
    
    const preference = {
      items: [
        {
          title: 'Venta en sistema POS',
          quantity: 1,
          currency_id: 'ARS',
          unit_price: monto,
        }
      ],
      back_urls: {
        success: 'http://localhost:4200/ventas?status=success',
        failure: 'http://localhost:4200/ventas?status=failure',
        pending: 'http://localhost:4200/ventas?status=pending'
      },
      external_reference: `venta_${Date.now()}`,
    };
    
    const response = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      preference,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
        
    res.json({
      success: true,
      id: response.data.id,
      init_point: response.data.init_point
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

module.exports = router;