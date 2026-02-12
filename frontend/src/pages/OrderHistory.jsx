import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, Package } from 'lucide-react';

export default function OrderHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('https://dashboard.render.com/web/srv-d66sci94tr6s73ai45a0/api/orders/live', { 
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (err) { console.error("Error fetching history", err); }
    };
    fetchHistory();
  }, []);

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Order History</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Date</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {history.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-medium">{order.customerName || 'Guest'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${order.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">₹{order.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}