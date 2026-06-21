import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Order } from '../lib/supabase';
import { Plus, Trash2, Edit2, X, Check, Package } from 'lucide-react';

export default function OrderEntry() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    frame_size: '',
    size_unit: 'inches',
    quantity: 1,
    quality: '',
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    status: 'pending' as 'pending' | 'in_progress' | 'completed',
    notes: '',
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingOrder) {
      const { error } = await supabase
        .from('orders')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingOrder.id);

      if (!error) {
        setEditingOrder(null);
        setShowForm(false);
        fetchOrders();
      }
    } else {
      const { error } = await supabase.from('orders').insert([
        {
          ...formData,
          created_by: user?.id,
        },
      ]);

      if (!error) {
        setShowForm(false);
        resetForm();
        fetchOrders();
      }
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this order?')) {
      await supabase.from('orders').delete().eq('id', id);
      fetchOrders();
    }
  }

  function handleEdit(order: Order) {
    setEditingOrder(order);
    setFormData({
      customer_name: order.customer_name,
      frame_size: order.frame_size,
      size_unit: order.size_unit,
      quantity: order.quantity,
      quality: order.quality,
      order_date: order.order_date,
      delivery_date: order.delivery_date,
      status: order.status,
      notes: order.notes || '',
    });
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      customer_name: '',
      frame_size: '',
      size_unit: 'inches',
      quantity: 1,
      quality: '',
      order_date: new Date().toISOString().split('T')[0],
      delivery_date: '',
      status: 'pending',
      notes: '',
    });
  }

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Order Entry</h2>
          <p className="text-slate-600">Manage customer frame orders</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingOrder(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-amber-500/25"
        >
          <Plus className="w-5 h-5" />
          Add Order
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900">
              {editingOrder ? 'Edit Order' : 'New Order'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingOrder(null);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Frame Size</label>
                <input
                  type="text"
                  required
                  value={formData.frame_size}
                  onChange={(e) => setFormData({ ...formData, frame_size: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="e.g., 16x20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                <select
                  value={formData.size_unit}
                  onChange={(e) => setFormData({ ...formData, size_unit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                >
                  <option value="inches">Inches</option>
                  <option value="cm">CM</option>
                  <option value="mm">MM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mode</label>
              <select
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                required
              >
                <option value="">Select mode</option>
                <option value="D">D</option>
                <option value="M">M</option>
                <option value="LED">LED</option>
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Order Date</label>
              <input
                type="date"
                required
                value={formData.order_date}
                onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Date</label>
              <input
                type="date"
                required
                value={formData.delivery_date}
                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'pending' | 'in_progress' | 'completed',
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all"
              >
                <Check className="w-4 h-4" />
                {editingOrder ? 'Update Order' : 'Save Order'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingOrder(null);
                }}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No orders yet. Add your first order!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">
                    Mode
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">
                    Order Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{order.customer_name}</div>
                      <div className="sm:hidden text-sm text-slate-500">{order.frame_size} {order.size_unit}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                      {order.frame_size} {order.size_unit}
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{order.quality}</td>
                    <td className="px-4 py-3 text-slate-600">{order.quantity}</td>
                    <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(order.delivery_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                          statusColors[order.status]
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(order)}
                          className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
