const express = require('express');
const router = express.Router();

// Ensure all 4 functions are imported here!
const { 
  placeOrder, 
  getLiveOrders, 
  updateOrderStatus, 
  getDashboardStats 
} = require('../controllers/orderController');

const auth = require('../middleware/authMiddleware');

// Public route for customers scanning the QR code
router.post('/place', placeOrder);

// Protected routes for the cafe owner's dashboard
router.get('/live', auth, getLiveOrders);
router.get('/stats', auth, getDashboardStats);
router.put('/:id/status', auth, updateOrderStatus);

module.exports = router;