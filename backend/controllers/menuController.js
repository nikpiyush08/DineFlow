const MenuItem = require('../models/MenuItem');

// Get all menu items for the logged-in owner
exports.getMenu = async (req, res) => {
  try {
    // req.user.id comes from our authMiddleware!
    const items = await MenuItem.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu', error: error.message });
  }
};

// Add a new menu item
exports.addMenuItem = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;
    
    const newItem = new MenuItem({
      ownerId: req.user.id,
      name,
      price,
      category,
      description
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Error adding item', error: error.message });
  }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
};
// Get public menu for a specific restaurant (No login required)
exports.getPublicMenu = async (req, res) => {
  try {
    // Fetch only items that are marked as available
    const items = await MenuItem.find({ 
      ownerId: req.params.ownerId, 
      isAvailable: true 
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public menu', error: error.message });
  }
};
// Update a menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const updatedItem = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id }, // Security check
      req.body, // The updated data
      { returnDocument: 'after' } // Return the updated document
    );
    
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Error updating item', error: error.message });
  }
};