import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import ErrorResponse from '../utils/errorResponse.js';

// @route   POST /api/expenses
export const addExpense = async (req, res) => {
  const { description, title, amount, category, group, groupId, splitType, receiptUrl, receiptImage, splitBetween } = req.body;

  // Handle both naming conventions for compatibility
  const finalTitle = title || description;
  const finalGroupId = groupId || group;
  const finalReceipt = receiptImage || receiptUrl;

  // If splitBetween is not provided, default to equal split among all group members
  let finalSplitBetween = splitBetween;
  if (!finalSplitBetween) {
    const groupDoc = await Group.findById(finalGroupId);
    if (!groupDoc) throw new ErrorResponse('Group not found', 404);
    
    const share = amount / groupDoc.members.length;
    finalSplitBetween = groupDoc.members.map(mId => ({
      user: mId,
      share: share
    }));
  }

  const expense = await Expense.create({
    title: finalTitle,
    amount,
    category,
    groupId: finalGroupId,
    paidBy: req.user._id,
    splitType,
    receiptImage: finalReceipt,
    splitBetween: finalSplitBetween
  });

  res.status(201).json({ success: true, expense });
};

// @route   GET /api/expenses/group/:groupId
export const getGroupExpenses = async (req, res) => {
  const expenses = await Expense.find({ groupId: req.params.groupId })
    .populate('paidBy', 'name email avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: expenses.length, expenses });
};

// @route   PUT /api/expenses/:id
export const updateExpense = async (req, res) => {
  let expense = await Expense.findById(req.params.id);

  if (!expense) {
    throw new ErrorResponse('Expense not found', 404);
  }

  if (expense.paidBy.toString() !== req.user._id.toString()) {
    throw new ErrorResponse('Not authorized to update this expense', 403);
  }

  expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, expense });
};

// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    throw new ErrorResponse('Expense not found', 404);
  }

  if (expense.paidBy.toString() !== req.user._id.toString()) {
    throw new ErrorResponse('Not authorized to delete this expense', 403);
  }

  await expense.deleteOne();

  res.status(200).json({ success: true, message: 'Expense deleted' });
};

// @route   GET /api/expenses/group/:groupId/balances
export const getGroupBalances = async (req, res) => {
  const groupId = req.params.groupId;
  const group = await Group.findById(groupId).populate('members', 'name email avatar');
  
  if (!group) throw new ErrorResponse('Group not found', 404);

  const expenses = await Expense.find({ groupId: groupId });
  const members = group.members;
  const memberCount = members.length;

  // Initialize balances
  const balances = {};
  members.forEach(m => {
    balances[m._id.toString()] = {
      user: m,
      paid: 0,
      share: 0,
      balance: 0
    };
  });

  // Calculate based on expenses
  expenses.forEach(exp => {
    const payerId = exp.paidBy.toString();
    if (balances[payerId]) {
      balances[payerId].paid += exp.amount;
    }

    // Use splitBetween if available, otherwise fallback to equal
    if (exp.splitBetween && exp.splitBetween.length > 0) {
      exp.splitBetween.forEach(split => {
        const userId = split.user.toString();
        if (balances[userId]) {
          balances[userId].share += split.share;
        }
      });
    } else {
      const sharePerPerson = exp.amount / memberCount;
      members.forEach(m => {
        balances[m._id.toString()].share += sharePerPerson;
      });
    }
  });

  // Final balance
  Object.values(balances).forEach(b => {
    b.balance = b.paid - b.share;
  });

  res.status(200).json({ success: true, balances: Object.values(balances) });
};

// @route   GET /api/expenses/stats
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId });
    const groupIds = groups.map(g => g._id);
    const expenses = await Expense.find({ groupId: { $in: groupIds } }).populate('groupId', 'name');

    const groupStats = {};
    const categoryStats = { food: 0, travel: 0, accommodation: 0, entertainment: 0, shopping: 0, utilities: 0, medical: 0, other: 0 };
    let totalGroupVolume = 0;
    let userPaidTotal = 0;

    expenses.forEach(expense => {
      totalGroupVolume += expense.amount;
      if (expense.paidBy.toString() === userId.toString()) {
        userPaidTotal += expense.amount;
      }

      if (expense.groupId) {
        const gId = expense.groupId._id.toString();
        if (!groupStats[gId]) groupStats[gId] = { name: expense.groupId.name, amount: 0 };
        groupStats[gId].amount += expense.amount;
      }

      const cat = expense.category || 'other';
      if (categoryStats.hasOwnProperty(cat)) categoryStats[cat] += expense.amount;
      else categoryStats.other += expense.amount;
    });

    const spendingByGroup = Object.values(groupStats);
    const spendingByCategory = Object.keys(categoryStats).map(cat => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: categoryStats[cat]
    })).filter(cat => cat.value > 0);

    res.status(200).json({
      success: true,
      totalGroupVolume,
      userPaidTotal,
      spendingByGroup,
      spendingByCategory,
      groupCount: groups.length,
      expenseCount: expenses.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
