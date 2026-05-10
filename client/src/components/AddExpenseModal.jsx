import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  X, 
  Receipt, 
  Search, 
  IndianRupee, 
  Users, 
  Plus, 
  FileText,
  Utensils,
  Plane,
  Home,
  Film,
  ShoppingBag,
  Zap,
  Stethoscope,
  MoreHorizontal,
  Sparkles
} from "lucide-react";

const CATEGORIES = [
  { value: 'food', label: 'Food', icon: Utensils },
  { value: 'travel', label: 'Travel', icon: Plane },
  { value: 'accommodation', label: 'Stay', icon: Home },
  { value: 'entertainment', label: 'Fun', icon: Film },
  { value: 'shopping', label: 'Shop', icon: ShoppingBag },
  { value: 'utilities', label: 'Bills', icon: Zap },
  { value: 'medical', label: 'Health', icon: Stethoscope },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

const AddExpenseModal = ({ group, currentUser, onClose, onExpenseAdded }) => {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    paidBy: currentUser._id,
    splitBetween: group.members.map(m => m._id),
    splitType: 'equal',
    category: 'food',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const fileInputRef = useRef(null);

  const perPersonAmount = form.splitType === 'equal' && form.amount && form.splitBetween.length > 0
    ? (parseFloat(form.amount) / form.splitBetween.length).toFixed(2)
    : 0;

  const toggleMember = (memberId) => {
    setForm(prev => ({
      ...prev,
      splitBetween: prev.splitBetween.includes(memberId)
        ? prev.splitBetween.filter(id => id !== memberId)
        : [...prev.splitBetween, memberId]
    }));
  };

  const handleReceiptScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const res = await api.post('/ai/scan-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.scanned && res.data.receipt) {
        const { total, storeName, category } = res.data.receipt;
        setForm(prev => ({
          ...prev,
          amount: total?.toString() || prev.amount,
          title: storeName || prev.title,
          category: category?.toLowerCase() || prev.category
        }));
        setScannedData(res.data.receipt);
        toast.success('Receipt scanned successfully! ✨');
      } else {
        toast.error('Could not read receipt details.');
      }
    } catch (err) {
      toast.error('Scan failed. Please enter manually.');
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Please enter a description');
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.error('Enter a valid amount');
    if (form.splitBetween.length === 0) return toast.error('Select at least one member');

    setLoading(true);
    try {
      await api.post('/expenses', {
        groupId: group._id,
        title: form.title.trim(),
        amount: parseFloat(form.amount),
        paidBy: form.paidBy,
        splitBetween: form.splitBetween,
        splitType: form.splitType,
        category: form.category,
        notes: form.notes,
      });

      toast.success('Expense added to group! 💸');
      onExpenseAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Add Expense</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Split smarter with Splitify</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full bg-gray-50 hover:bg-gray-100 h-10 w-10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          
          {/* AI Scan Action */}
          <div>
             <input type="file" accept="image/*" ref={fileInputRef} onChange={handleReceiptScan} className="hidden" />
             <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={scanning}
                className="w-full group relative overflow-hidden bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center justify-center gap-3 transition-all hover:bg-primary/10"
             >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-all"></div>
                {scanning ? (
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                ) : (
                  <Receipt className="w-5 h-5 text-primary" />
                )}
                <span className="text-xs font-black text-primary uppercase tracking-widest">
                  {scanning ? 'AI is analyzing...' : 'Scan receipt with AI'}
                </span>
             </button>
          </div>

          {/* Title & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">What was it for?</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g. Dinner at Taj"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Total amount</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Paid By */}
          <div className="space-y-3">
             <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Paid by</label>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {group.members.map(member => (
                  <button
                    key={member._id}
                    type="button"
                    onClick={() => setForm({...form, paidBy: member._id})}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                      form.paidBy === member._id 
                        ? 'bg-primary/5 border-primary shadow-sm' 
                        : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                      form.paidBy === member._id ? 'bg-primary text-white' : 'bg-gray-100 text-muted-foreground'
                    }`}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[11px] font-bold truncate">
                       {member._id === currentUser._id ? 'You' : member.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
             </div>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm({...form, category: cat.value})}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                      form.category === cat.value
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                        : 'bg-white text-muted-foreground border-gray-100 hover:border-primary/30'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1.5" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split Settings */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Split between</label>
              {form.splitType === 'equal' && form.amount > 0 && (
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">₹{perPersonAmount} each</span>
              )}
            </div>
            <div className="space-y-2">
              {group.members.map(member => {
                const isSelected = form.splitBetween.includes(member._id);
                return (
                  <button
                    key={member._id}
                    type="button"
                    onClick={() => toggleMember(member._id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isSelected ? 'bg-primary/5 border-primary/20' : 'bg-gray-50/50 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                        isSelected ? 'bg-primary text-white shadow-lg' : 'bg-gray-200 text-muted-foreground'
                      }`}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-foreground">
                        {member._id === currentUser._id ? `${member.name} (You)` : member.name}
                      </span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                      isSelected ? 'bg-primary border-primary' : 'border-gray-300'
                    }`}>
                       {isSelected && <Plus className="w-3 h-3 text-white rotate-45" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </form>

        {/* Footer Action */}
        <div className="p-8 border-t border-gray-50 bg-gray-50/30">
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            rounded="full"
            className="w-full h-14 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            {loading ? 'Processing...' : 'Add Expense Now'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;