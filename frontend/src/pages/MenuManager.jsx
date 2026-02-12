import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Edit2, Trash2, Image as ImageIcon, X } from 'lucide-react';

export default function MenuManager() {
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Tracks if we are editing
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Main Course',
    description: '',
    image: ''
  });

  const fetchMenu = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://dineflow-backend-h5hw.onrender.com/api/menu',{
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenuItems(response.data);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Open modal for editing an existing item
  const openEditModal = (item) => {
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description || '',
      image: item.image || ''
    });
    setEditingId(item._id);
    setIsModalOpen(true);
  };

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', price: '', category: 'Main Course', description: '' });
  };

  // Handle Form Submission (Handles BOTH Add and Edit!)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      if (editingId) {
        // We are EDITING an existing item
        await axios.put(`https://dineflow-backend-h5hw.onrender.com/api/menu/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // We are ADDING a new item
        await axios.post('https://dineflow-backend-h5hw.onrender.com/api/menu', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      fetchMenu();
      closeModal();
    } catch (error) {
      alert(editingId ? 'Failed to update item' : 'Failed to add item');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a temporary URL to preview the image
      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, image: previewUrl });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://dineflow-backend-h5hw.onrender.com/api/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMenu();
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  return (
    <div className="relative animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-800">Manage Your Menu</h2>
          <p className="mt-1 text-gray-500">Add, edit, and organize your delicious offerings.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', price: '', category: 'Main Course', description: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center px-5 py-2.5 text-white transition-all transform rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:scale-105 shadow-md font-semibold"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add New Item
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => (
          <div key={item._id} className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-xl group">
            <div className="relative flex items-center justify-center w-full h-40 overflow-hidden bg-gray-100">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-300" />
              )}
              <div className="absolute px-2 py-1 text-xs font-bold text-gray-700 shadow-sm top-3 right-3 bg-white/90 backdrop-blur-sm rounded-md">
                ₹{item.price}
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <p className="mb-4 text-sm font-medium text-orange-500">{item.category}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-blue-600"
                >
                  <Edit2 className="w-4 h-4 mr-1" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingId ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Item Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Price (₹)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Starters">Starters</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-24"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="mt-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">Upload Photo</label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  </label>
                </div>
                {/* Show a preview if an image is selected */}
                {formData.image && (
                  <div className="mt-4 relative w-full h-32 rounded-lg overflow-hidden">
                    <img src={formData.image} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-4 text-white font-bold rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md transition-all"
              >
                {editingId ? 'Update Item' : 'Save to Menu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}