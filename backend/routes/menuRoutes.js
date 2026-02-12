const express = require('express');
const router = express.Router();

// Notice we only have ONE import line for the controller here!
const { 
  getMenu, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem, 
  getPublicMenu 
} = require('../controllers/menuController');

const auth = require('../middleware/authMiddleware');

// PUBLIC ROUTE (Customers scanning QR code)
router.get('/public/:ownerId', getPublicMenu);

// PROTECTED ROUTES (Owner Dashboard)
router.get('/', auth, getMenu);
router.post('/', auth, addMenuItem);
router.put('/:id', auth, updateMenuItem); // The new Edit route
router.delete('/:id', auth, deleteMenuItem);

module.exports = router;