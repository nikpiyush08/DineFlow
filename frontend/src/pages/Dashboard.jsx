import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Added 'History' to the lucide-react imports
import { LayoutDashboard, UtensilsCrossed, QrCode, LogOut, Clock, CheckCircle, ChefHat, Check, XCircle, User, AlertCircle, TrendingUp, ShoppingBag, History } from 'lucide-react';

// Importing our other sections
import MenuManager from './MenuManager';
import QRCodeManager from './QRCodeManager';
import OrderHistory from './OrderHistory'; // Ensure this component is created

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'overview');

  // --- STATE FOR EVERYTHING ---
  // Added todayRevenue to stats state
  const [stats, setStats] = useState({ todayOrders: 0, todayRevenue: 0, monthlyRevenue: 0, activeMenuItems: 0 });
  const [orders, setOrders] = useState([]);

  // Save tab state
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // --- ONE FUNCTION TO FETCH EVERYTHING ---
  const fetchAllData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch Stats AND Orders in parallel
      const [statsRes, ordersRes] = await Promise.all([
        axios.get('https://dineflow-backend-h5hw.onrender.com/api/orders/stats', config),
        axios.get('https://dineflow-backend-h5hw.onrender.com/api/orders/live', config)
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);

    } catch (error) {
      console.error("Error loading dashboard data", error);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    }
  };

  // Initial Load & Auto-Refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchAllData(); // Fetch immediately
    const interval = setInterval(fetchAllData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [navigate]);

  // Logout Logic
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeTab');
    navigate('/login');
  };

  // Update Order Status Logic
  const updateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://dineflow-backend-h5hw.onrender.com/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // REFRESH EVERYTHING IMMEDIATELY AFTER UPDATE
      fetchAllData();
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  const activeOrders = orders.filter(order => order.status !== 'Rejected');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm relative">
        <div className="p-6">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
            DineFlow
          </h1>
        </div>
        <nav className="mt-2">
          <button onClick={() => setActiveTab('overview')} className={`flex items-center w-full px-6 py-4 text-left font-medium transition-colors ${activeTab === 'overview' ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" /> Overview
          </button>
          {/* Added Order History Button */}
          <button onClick={() => setActiveTab('history')} className={`flex items-center w-full px-6 py-4 text-left font-medium transition-colors ${activeTab === 'history' ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            <History className="w-5 h-5 mr-3" /> Order History
          </button>
          <button onClick={() => setActiveTab('menu')} className={`flex items-center w-full px-6 py-4 text-left font-medium transition-colors ${activeTab === 'menu' ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            <UtensilsCrossed className="w-5 h-5 mr-3" /> Manage Menu
          </button>
          <button onClick={() => setActiveTab('qr')} className={`flex items-center w-full px-6 py-4 text-left font-medium transition-colors ${activeTab === 'qr' ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            <QrCode className="w-5 h-5 mr-3" /> QR Code
          </button>
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 font-bold text-red-600 transition-colors rounded-xl hover:bg-red-50">
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Dashboard Overview</h2>

            {/* TOP STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Today's Orders</h3>
                <p className="text-4xl font-black text-gray-800 mt-2">{stats.todayOrders || 0}</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Active Menu Items</h3>
                <p className="text-4xl font-black text-gray-800 mt-2">{stats.activeMenuItems || 0}</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Revenue</h3>
                <p className="text-4xl font-black text-green-600 mt-2">₹{stats.monthlyRevenue || 0}</p>
              </div>
            </div>

            {/* LIVE KITCHEN SECTION */}
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">Live Kitchen Orders</h2>
                <p className="mt-1 text-gray-500">Auto-updating every 5 seconds. Keep the food flowing!</p>
              </div>
              <div className="flex items-center px-3 py-1 text-sm font-bold text-green-600 bg-green-100 rounded-full animate-pulse">
                <span className="w-2 h-2 mr-2 bg-green-600 rounded-full"></span>
                System Live
              </div>
            </div>

            {/* COLORFUL STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between transition-transform hover:scale-[1.02]">
                <div>
                  <p className="text-orange-100 font-bold uppercase tracking-wider text-sm mb-1">Today's Revenue</p>
                  {/* Updated to use stats.todayRevenue specifically */}
                  <h3 className="text-4xl font-black">₹{stats.todayRevenue || 0}</h3>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02]">
                <div>
                  <p className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-1">Total Orders Today</p>
                  <h3 className="text-4xl font-black text-gray-800">{stats.todayOrders || 0}</h3>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                  <ShoppingBag className="w-10 h-10 text-orange-500" />
                </div>
              </div>
            </div>

            {/* ORDERS LIST */}
            {activeOrders.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center border-2 border-gray-200 border-dashed rounded-2xl bg-gray-50">
                <ChefHat className="w-16 h-16 mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-500">Kitchen is quiet...</h3>
                <p className="mt-2 text-gray-400">Waiting for new orders to arrive.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeOrders.map((order) => (
                  <div key={order._id} className="flex flex-col overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
                    <div className={`p-4 text-white flex justify-between items-center ${order.status === 'Pending' ? 'bg-amber-500' :
                        order.status === 'Preparing' ? 'bg-orange-500' :
                          order.status === 'Ready' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}>
                      <div>
                        <div className="text-2xl font-black text-white">Table {order.tableNumber}</div>
                        <div className="flex items-center mt-1 text-sm font-semibold opacity-90">
                          <User className="w-4 h-4 mr-1" /> {order.customerName || 'Guest'}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="px-2 py-1 mb-1 text-xs font-bold tracking-wider text-gray-900 uppercase bg-white rounded-md shadow-sm">
                          {order.status}
                        </span>
                        <div className="flex items-center text-xs font-bold">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-5 bg-stone-50">
                      <ul className="space-y-3">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex items-start justify-between pb-2 border-b border-gray-200 last:border-0 last:pb-0">
                            <div className="text-lg font-bold text-gray-800">
                              <span className="mr-2 text-orange-600">{item.quantity}x</span>
                              {item.name}
                            </div>
                          </li>
                        ))}
                      </ul>
                      {order.notes && (
                        <div className="p-3 mt-4 border border-yellow-200 rounded-xl bg-yellow-50">
                          <div className="flex items-center mb-1 text-sm font-bold text-yellow-800">
                            <AlertCircle className="w-4 h-4 mr-1" /> Cooking Notes:
                          </div>
                          <p className="text-sm font-medium text-yellow-900">{order.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-white border-t border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium tracking-wider text-gray-500 uppercase">Total</span>
                        <span className="text-xl font-black text-gray-900">₹{order.totalAmount}</span>
                      </div>

                      {order.status === 'Pending' && (
                        <div className="flex gap-3">
                          <button onClick={() => updateStatus(order._id, 'Rejected')} className="flex items-center justify-center flex-1 py-3 font-bold text-red-600 transition-colors bg-red-100 rounded-xl hover:bg-red-200">
                            <XCircle className="w-5 h-5 mr-2" /> Reject
                          </button>
                          <button onClick={() => updateStatus(order._id, 'Preparing')} className="flex items-center justify-center flex-1 py-3 font-bold text-white transition-colors bg-orange-500 rounded-xl hover:bg-orange-600 shadow-md">
                            <ChefHat className="w-5 h-5 mr-2" /> Accept
                          </button>
                        </div>
                      )}
                      {order.status === 'Preparing' && (
                        <button onClick={() => updateStatus(order._id, 'Ready')} className="flex items-center justify-center w-full py-3 font-bold text-white transition-colors bg-emerald-500 rounded-xl hover:bg-emerald-600 shadow-md">
                          <CheckCircle className="w-5 h-5 mr-2" /> Mark as Ready
                        </button>
                      )}
                      {order.status === 'Ready' && (
                        <button onClick={() => updateStatus(order._id, 'Served')} className="flex items-center justify-center w-full py-3 font-bold text-white transition-colors bg-blue-500 rounded-xl hover:bg-blue-600 shadow-md">
                          <User className="w-5 h-5 mr-2" /> Mark as Served
                        </button>
                      )}
                      {order.status === 'Served' && (
                        <button onClick={() => updateStatus(order._id, 'Paid')} className="flex items-center justify-center w-full py-3 font-bold text-gray-600 transition-colors bg-gray-200 rounded-xl hover:bg-gray-300">
                          <Check className="w-5 h-5 mr-2" /> Settle Bill & Clear
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Added History Tab Rendering */}
        {activeTab === 'history' && <OrderHistory />}
        {activeTab === 'menu' && <MenuManager />}
        {activeTab === 'qr' && <QRCodeManager />}
      </main>
    </div>
  );
}