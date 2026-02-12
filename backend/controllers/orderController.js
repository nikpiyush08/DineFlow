const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// 1. Customer places an order
exports.placeOrder = async (req, res) => {
  try {
    const { ownerId, tableNumber, customerName, notes, items, totalAmount } = req.body;

    const newOrder = new Order({
      ownerId,
      tableNumber,
      customerName,
      notes,
      items,
      totalAmount
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error placing order', error: error.message });
  }
};

// 2. Owner fetches live orders for their dashboard
exports.getLiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      ownerId: req.user.id,
      status: { $ne: 'Paid' }
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// 3. Owner updates order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      { status },
      { returnDocument: 'after' }
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

// 4. Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    // 12:00:00 AM of the current day
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // 1st day of the current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Today's Metrics (Resets daily)
    const todayOrdersData = await Order.find({
      ownerId: req.user.id,
      createdAt: { $gte: startOfToday },
      status: { $ne: 'Rejected' }
    });
    const todayOrders = todayOrdersData.length;
    const todayRevenue = todayOrdersData.reduce((sum, order) => sum + order.totalAmount, 0);

    // 2. Monthly Metrics
    const monthOrders = await Order.find({
      ownerId: req.user.id,
      createdAt: { $gte: startOfMonth },
      status: { $ne: 'Rejected' }
    });
    const monthlyRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 3. Active Menu Items
    const activeMenuItems = await MenuItem.countDocuments({
      ownerId: req.user.id,
      isAvailable: true
    });

    res.json({ todayOrders, todayRevenue, monthlyRevenue, activeMenuItems });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};