import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '../utils/axios'

const CATEGORIES = [
  { value: 'food', label: '🍔 Food' },
  { value: 'travel', label: '✈️ Travel' },
  { value: 'accommodation', label: '🏨 Accommodation' },
  { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'utilities', label: '💡 Utilities' },
  { value: 'medical', label: '💊 Medical' },
  { value: 'other', label: '📦 Other' },
]

const AddExpenseModal = ({ group, currentUser, onClose, onExpenseAdded }) => {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    paidBy: currentUser._id,
    splitBetween: group.members.map(m => m._id), // default: sab selected
    splitType: 'equal',
    category: 'other',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState(null)
  const fileInputRef = useRef(null)

  // Equal split mein per-person amount calculate karo
  const perPersonAmount = form.splitType === 'equal' && form.amount && form.splitBetween.length > 0
    ? (parseFloat(form.amount) / form.splitBetween.length).toFixed(2)
    : 0

  // Member select/deselect toggle
  const toggleMember = (memberId) => {
    setForm(prev => ({
      ...prev,
      splitBetween: prev.splitBetween.includes(memberId)
        ? prev.splitBetween.filter(id => id !== memberId)
        : [...prev.splitBetween, memberId]
    }))
  }

  // AI Receipt Scan
  const handleReceiptScan = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setScanning(true)
    const formData = new FormData()
    formData.append('receipt', file)

    try {
      const res = await api.post('/ai/scan-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (res.data.scanned && res.data.receipt) {
        const { total, storeName } = res.data.receipt
        setForm(prev => ({
          ...prev,
          amount: total?.toString() || prev.amount,
          title: storeName || prev.title,
        }))
        setScannedData(res.data.receipt)
        toast.success('Receipt scanned! Amount auto-filled ✨')
      } else {
        toast.error('Could not read receipt. Please enter manually.')
      }
    } catch (err) {
      toast.error('Scan failed. Try again.')
    } finally {
      setScanning(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title.trim()) return toast.error('Please add a title')
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.error('Enter a valid amount')
    if (form.splitBetween.length === 0) return toast.error('Select at least one person to split with')

    setLoading(true)
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
      })

      toast.success('Expense added! 💸')
      onExpenseAdded() // Parent mein refresh trigger
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  // Backdrop click se close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900">Add expense</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* AI Receipt Scan Button */}
          <div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleReceiptScan}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={scanning}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-orange-200 text-orange-500 py-3 rounded-2xl text-sm font-medium hover:bg-orange-50 transition-colors disabled:opacity-60"
            >
              {scanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin"></div>
                  Scanning receipt...
                </>
              ) : (
                <>📷 Scan receipt with AI</>
              )}
            </button>

            {/* Scanned data preview */}
            {scannedData && (
              <div className="mt-3 bg-orange-50 rounded-2xl p-3 border border-orange-100">
                <p className="text-xs font-semibold text-orange-600 mb-2">✨ AI extracted:</p>
                <div className="space-y-1">
                  {scannedData.items?.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-gray-600">
                      <span>{item.name}</span>
                      <span className="font-medium">₹{item.price}</span>
                    </div>
                  ))}
                  {scannedData.items?.length > 3 && (
                    <p className="text-xs text-gray-400">+{scannedData.items.length - 3} more items</p>
                  )}
                  <div className="flex justify-between text-xs font-bold text-gray-900 pt-1 border-t border-orange-200">
                    <span>Total</span>
                    <span>₹{scannedData.total}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">What was it for?</label>
            <input
              type="text"
              placeholder="Hotel stay, dinner, cab..."
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Total amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
              <input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})}
                min="0.01"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                required
              />
            </div>
          </div>

          {/* Paid by */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Paid by</label>
            <select
              value={form.paidBy}
              onChange={e => setForm({...form, paidBy: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white"
            >
              {group.members.map(member => (
                <option key={member._id} value={member._id}>
                  {member._id === currentUser._id ? `${member.name} (you)` : member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm({...form, category: cat.value})}
                  className={`py-2 px-1 rounded-xl text-xs font-medium transition-all border ${
                    form.category === cat.value
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-orange-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Split type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Split type</label>
            <div className="flex gap-2">
              {['equal', 'custom', 'percentage'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({...form, splitType: type})}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border capitalize ${
                    form.splitType === type
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-orange-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Split between — member checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Split between
              {form.splitType === 'equal' && form.amount && (
                <span className="text-orange-500 ml-2 font-normal">
                  ₹{perPersonAmount} each
                </span>
              )}
            </label>
            <div className="space-y-2">
              {group.members.map(member => {
                const isSelected = form.splitBetween.includes(member._id)
                return (
                  <button
                    key={member._id}
                    type="button"
                    onClick={() => toggleMember(member._id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        isSelected ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {member._id === currentUser._id ? `${member.name} (you)` : member.name}
                      </span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes <span className="text-gray-300 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Any details..."
              value={form.notes}
              onChange={e => setForm({...form, notes: e.target.value})}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60 text-base"
          >
            {loading ? 'Adding...' : 'Add expense'}
          </button>

        </form>
      </div>
    </div>
  )
}

export default AddExpenseModal