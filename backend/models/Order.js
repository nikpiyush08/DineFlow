const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tableNumber: { type: String, required: true },
  
  // --- NEW FIELDS ---
  customerName: { type: String, required: true },
  notes: { type: String }, // Optional special instructions
  // ------------------

  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  
  // --- UPGRADED STATUS FLOW ---
  status: { 
    type: String, 
    enum: ['Pending', 'Preparing', 'Ready', 'Served', 'Paid', 'Rejected'], 
    default: 'Pending' // Orders now start as Pending!
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);