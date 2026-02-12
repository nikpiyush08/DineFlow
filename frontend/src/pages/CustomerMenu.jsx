import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, X, Utensils, Info } from 'lucide-react';

export default function CustomerMenu() {
  const { ownerId } = useParams();
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get(`https://dineflow-backend-h5hw.onrender.com/api/menu/public/${ownerId}`);
        setMenu(res.data);
      } catch (err) { console.error("Error fetching menu", err); }
    };
    fetchMenu();
  }, [ownerId]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(i => i._id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!customerName || !tableNumber) return alert("Please enter name and table number");
    try {
      await axios.post('https://dineflow-backend-h5hw.onrender.com/api/orders/place', {
        ownerId, customerName, tableNumber, notes, items: cart, totalAmount: cartTotal
      });
      alert("Order placed successfully!");
      setCart([]);
      setIsCartOpen(false);
    } catch (err) { alert("Order failed. Please try again."); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-30 p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-orange-600">DineFlow</h1>
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-orange-100 text-orange-600 rounded-full">
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cart.length}</span>}
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 overflow-x-auto whitespace-nowrap py-4 flex gap-2 no-scrollbar">
        {['All', ...new Set(menu.map(item => item.category))].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu List */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {menu
          .filter(item => activeCategory === 'All' || item.category === activeCategory)
          .map(item => (
            <div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex h-32 border border-gray-100">
              {/* Food Photo */}
              <div className="w-32 h-full bg-gray-200">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Utensils className="text-gray-400" /></div>
                )}
              </div>

              {/* Food Info */}
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 leading-tight">{item.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                </div>
                <div className="flex justify-between items-end">
                  <span className="font-black text-lg text-gray-900">₹{item.price}</span>
                  <button onClick={() => addToCart(item)} className="bg-orange-500 text-white p-1.5 rounded-lg shadow-md hover:bg-orange-600 active:scale-95 transition-all">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm">
          <div className="w-full bg-white rounded-t-3xl max-w-md mx-auto p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-800">Your Order</h2>
              <button onClick={() => setIsCartOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>

            <div className="max-h-60 overflow-y-auto mb-6 space-y-4">
              {cart.map(item => (
                <div key={item._id} className="flex justify-between items-center">
                  <div className="font-bold text-gray-800">{item.name}</div>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => updateQuantity(item._id, -1)} className="p-1 rounded-md border border-gray-200"><Minus className="w-4 h-4" /></button>
                    <span className="font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} className="p-1 rounded-md bg-gray-100"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <input type="text" placeholder="Your Name" className="w-full p-3 border rounded-xl" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
              <input type="text" placeholder="Table Number" className="w-full p-3 border rounded-xl" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} required />
              <textarea placeholder="Any special notes?" className="w-full p-3 border rounded-xl h-20" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
              <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg">Confirm Order (₹{cartTotal})</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}