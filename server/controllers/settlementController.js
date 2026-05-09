import Settlement from '../models/Settlement.js';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import ErrorResponse from '../utils/errorResponse.js';
import { calculateSettlements } from '../utils/settlementAlgorithm.js';

// ─── @route   POST /api/settlements/run/:groupId ──────────────
// ─── @access  Private ─────────────────────────────────────────
export const runSettlement = async (req, res) => {
  const group = await Group.findById(req.params.groupId).populate(
    'members',
    'name email avatar'
  );

  if (!group) {
    throw new ErrorResponse('Group not found', 404);
  }

  // Member check
  const isMember = group.members.some(
    (member) => member._id.toString() === req.user._id.toString()
  );
  if (!isMember) {
    throw new ErrorResponse('Not authorized', 403);
  }

  // Saare expenses fetch karo
  const expenses = await Expense.find({ groupId: req.params.groupId });

  if (expenses.length === 0) {
    throw new ErrorResponse('No expenses found in this group', 400);
  }

  // Balances calculate karo (same logic as getGroupBalances)
  const balances = {};
  group.members.forEach((member) => {
    balances[member._id.toString()] = 0;
  });

  expenses.forEach((expense) => {
    const payerId = expense.paidBy.toString();
    if (balances[payerId] !== undefined) {
      balances[payerId] += expense.amount;
    }
    expense.splitBetween.forEach((split) => {
      const userId = split.user.toString();
      if (balances[userId] !== undefined) {
        balances[userId] -= split.share;
      }
    });
  });

  // Round off
  Object.keys(balances).forEach((userId) => {
    balances[userId] = parseFloat(balances[userId].toFixed(2));
  });

  // Algorithm chalao
  const settlementTransactions = calculateSettlements(balances);

  if (settlementTransactions.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'All balances are already settled!',
      settlements: [],
    });
  }

  // Purane pending settlements delete karo (fresh run)
  await Settlement.deleteMany({
    groupId: req.params.groupId,
    status: 'pending',
  });

  // Naye Settlement documents create karo
  const settlements = await Settlement.insertMany(
    settlementTransactions.map((t) => ({
      groupId: req.params.groupId,
      from: t.from,
      to: t.to,
      amount: t.amount,
      status: 'pending',
    }))
  );

  // Populate karke return karo
  const populatedSettlements = await Settlement.find({
    _id: { $in: settlements.map((s) => s._id) },
  })
    .populate('from', 'name email avatar')
    .populate('to', 'name email avatar');

  res.status(200).json({
    success: true,
    message: `${settlements.length} settlement transactions calculated`,
    settlements: populatedSettlements,
  });
};

// ─── @route   GET /api/settlements/group/:groupId ─────────────
// ─── @access  Private ─────────────────────────────────────────
export const getSettlements = async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) {
    throw new ErrorResponse('Group not found', 404);
  }

  const isMember = group.members.some(
    (memberId) => memberId.toString() === req.user._id.toString()
  );
  if (!isMember) {
    throw new ErrorResponse('Not authorized', 403);
  }

  const settlements = await Settlement.find({ groupId: req.params.groupId })
    .populate('from', 'name email avatar')
    .populate('to', 'name email avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: settlements.length,
    settlements,
  });
};

// ─── @route   PUT /api/settlements/:id/complete ───────────────
// ─── @access  Private ─────────────────────────────────────────
export const markSettlementComplete = async (req, res) => {
  const settlement = await Settlement.findById(req.params.id);

  if (!settlement) {
    throw new ErrorResponse('Settlement not found', 404);
  }

  // Sirf woh user mark kar sakta hai jo pay kar raha hai (from)
  if (settlement.from.toString() !== req.user._id.toString()) {
    throw new ErrorResponse('Only the payer can mark settlement as complete', 403);
  }

  if (settlement.status === 'completed') {
    throw new ErrorResponse('Settlement is already completed', 400);
  }

  settlement.status = 'completed';
  settlement.completedAt = Date.now();
  await settlement.save();

  await settlement.populate('from', 'name email avatar');
  await settlement.populate('to', 'name email avatar');

  // Check karo kya group ke saare settlements complete hain
  const pendingSettlements = await Settlement.countDocuments({
    groupId: settlement.groupId,
    status: 'pending',
  });

  // Agar sab complete ho gaye toh group status update karo
  if (pendingSettlements === 0) {
    await Group.findByIdAndUpdate(settlement.groupId, { status: 'settled' });
  }

  res.status(200).json({
    success: true,
    message: 'Settlement marked as complete',
    settlement,
    groupFullySettled: pendingSettlements === 0,
  });
};