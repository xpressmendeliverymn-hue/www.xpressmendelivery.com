import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import { catalogApi } from '@/services/api';

// const categoryIcons: Record<string, React.ElementType> = {
//   sofa: Sofa,
//   bed: Bed,
//   chair: Armchair,
//   table: Table,
//   default: Package,
// };

export default function Step2FurnitureSelect({ onValidationChange }: { onValidationChange: (v: boolean) => void }) {
  const serviceType = useBookingStore((s) => s.serviceType);
  const items = useBookingStore((s) => s.items);
  const setItems = useBookingStore((s) => s.setItems);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    catalogApi.list().then(setCatalog);
  }, []);

  useEffect(() => {
    onValidationChange(items.length > 0);
  }, [items, onValidationChange]);

  const addItem = (product: any) => {
    const action = serviceType.includes('delivery') ? 'deliver' : 'remove';
    const existing = items.find((i) => i.catalogId === product.id && i.action === action);
    if (existing) {
      setItems(
        items.map((i) =>
          i.catalogId === product.id && i.action === action ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setItems([
        ...items,
        {
          id: crypto.randomUUID(),
          catalogId: product.id,
          category: product.category,
          name: product.name,
          quantity: 1,
          price: action === 'remove' ? Math.round(product.base_price * 0.85) : product.base_price,
          basePrice: product.base_price,
          image: product.image,
          action,
        },
      ]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(
      items
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const filteredCatalog = selectedCategory === 'all' ? catalog : catalog.filter((c) => c.category === selectedCategory);
  const categories = ['all', ...Array.from(new Set(catalog.map((c) => c.category)))];

  // const selectedItemsForAction = (action: string) => items.filter((i) => i.action === action);

  return (
    <div>
      <h2 className="text-heading-m text-[#0A1628] text-center">SELECT YOUR FURNITURE</h2>
      <p className="text-body-m text-[#64748B] text-center mt-2">Choose items for delivery or removal</p>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mt-6 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-[#E63946] text-white'
                : 'bg-white border border-[rgba(15,29,50,0.2)] text-[#0A1628] hover:border-[#E63946]/50'
            }`}
          >
            {cat === 'all' ? 'All Items' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Catalog grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
        {filteredCatalog.map((product) => {
          const action = serviceType.includes('delivery') ? 'deliver' : 'remove';
          const existing = items.find((i) => i.catalogId === product.id && i.action === action);
          return (
            <motion.button
              key={product.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => addItem(product)}
              className={`relative bg-white border rounded-xl p-3 text-left transition-all hover:shadow-md ${
                existing ? 'border-2 border-[#E63946]' : 'border-[rgba(15,29,50,0.2)]'
              }`}
            >
              <img src={product.image} alt={product.name} className="w-full h-24 object-cover rounded-lg mb-2" />
              <p className="text-xs font-medium text-[#0A1628] truncate">{product.name}</p>
              <p className="text-xs text-[#64748B]">
                ${action === 'remove' ? Math.round(product.base_price * 0.85) : product.base_price}
              </p>
              {existing && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-[#E63946] text-white text-xs rounded-full flex items-center justify-center">
                  {existing.quantity}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Items Summary */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-[#0F1D32] rounded-2xl p-5 text-white"
          >
            <h3 className="font-display text-label mb-3">YOUR ITEMS</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt="" className="w-10 h-10 rounded object-cover" />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-[#64748B]">{item.action === 'deliver' ? 'Delivery' : 'Removal'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 bg-white/10 rounded flex items-center justify-center hover:bg-white/20">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 bg-white/10 rounded flex items-center justify-center hover:bg-white/20">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="ml-2 text-[#E63946] hover:text-white">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
