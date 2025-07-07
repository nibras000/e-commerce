const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deliveryDetails: {
    address: String,
    pincode: String,
    mobile: String
  },
  paymentMethod: String,
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number
    }
  ],
  totalAmount: Number,
  status: {
    type: String,
    default: 'Placed'  // Can be 'Placed', 'Shipped', 'Delivered', etc.
  },
  placedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
