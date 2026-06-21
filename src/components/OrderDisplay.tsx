import { useState, useEffect, useCallback } from 'react';
import { supabase, Order } from '../lib/supabase';
import { Clock, User, Package, Calendar, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function OrderDisplay() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalPages, setTotalPages] = useState(0);

  const ORDERS_PER_PAGE = 5;
  const INTERVAL_SECONDS = 30;


  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setOrders(data);
      setTotalPages(Math.ceil(data.length / ORDERS_PER_PAGE) || 1);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  useEffect(() => {
    if (orders.length === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
          return INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orders.length, totalPages]);

  const currentOrders = orders.slice(
    currentPage * ORDERS_PER_PAGE,
    (currentPage + 1) * ORDERS_PER_PAGE
  );

  const statusConfig = {
    pending: {
      icon: AlertCircle,
      color: 'bg-amber-500',
      text: 'text-amber-500',
      bgLight: 'bg-amber-50',
    },
    in_progress: {
      icon: Loader2,
      color: 'bg-blue-500',
      text: 'text-blue-500',
      bgLight: 'bg-blue-50',
    },
    completed: {
      icon: CheckCircle2,
      color: 'bg-emerald-500',
      text: 'text-emerald-500',
      bgLight: 'bg-emerald-50',
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Order Display</h2>
          <p className="text-slate-600">Auto-rotating order view</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow border border-slate-200">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="font-mono text-lg font-semibold text-slate-900">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow border border-slate-200">
            <span className="text-slate-600 text-sm">Page </span>
            <span className="font-semibold text-slate-900">{currentPage + 1}</span>
            <span className="text-slate-600 text-sm"> of {totalPages}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex-1 overflow-hidden">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-500">
            <Package className="w-12 h-12 mr-4 text-slate-300" />
            <span>No orders to display</span>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="grid gap-1">
              {currentOrders.map((order, index) => {
                const config = statusConfig[order.status];
                const StatusIcon = config.icon;

                return (
                  <div
                    key={order.id}
                    className={`p-4 md:p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      index === 0 ? 'bg-amber-50/50' : ''
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${config.bgLight}`}>
                          <StatusIcon
                            className={`w-6 h-6 ${config.text} ${
                              order.status === 'in_progress' ? 'animate-spin' : ''
                            }`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="font-semibold text-slate-900 text-lg">
                              {order.customer_name}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <Package className="w-3.5 h-3.5" />
                              {order.frame_size} {order.size_unit}
                            </span>
                            <span className="hidden sm:inline text-slate-300">|</span>
                            <span>Qty: {order.quantity}</span>
                            <span className="hidden sm:inline text-slate-300">|</span>
                            <span className="hidden md:inline">Mode: {order.quality}</span>

                          </div>
                          {order.notes && (
                            <p className="text-sm text-slate-500 mt-1 line-clamp-1">{order.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 md:gap-8 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <div>
                            <div className="text-xs text-slate-400 order-date">Delivery</div>
                            <div className="font-medium">
                              {new Date(order.delivery_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${config.color} text-white`}
                          >
                            {order.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(order.order_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentPage(i);
              setTimeLeft(INTERVAL_SECONDS);
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              i === currentPage ? 'bg-amber-500 scale-125' : 'bg-slate-300 hover:bg-slate-400'
            }`}
            aria-label={`Go to page ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
