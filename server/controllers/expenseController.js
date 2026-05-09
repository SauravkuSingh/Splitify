import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import ErrorResponse from "../utils/errorResponse.js";

// ─── @route   POST /api/expenses ──────────────────────────────
// ─── @access  Private ─────────────────────────────────────────

export const addExpense = async (req, res) => {
  const {
    groupId,
    title,
    amount,
    paidBy,
    splitBetween,
    splitType = "equal",
    category = "other",
    notes,
  } = req.body;
  //Group finding weather it exist or not 
  const group = await Group.findById(groupId);
  if(!group){
    throw new ErrorResponse("Group not found",404)
  }

//   sirf grp members he add karsakte hai expense 
const isMember = group.members.some(
  (memberId) => memberId.toString() === req.user._id.toString()
);
if (!isMember) {
    throw new ErrorResponse('Only group members can add expenses', 403);
  }

  // Already settled group mein expense nahi add ho sakta
  if (group.status === 'settled') {
    throw new ErrorResponse('Cannot add expense to a settled group', 400);
  }

  // splitBetween array process karo
  let processedSplits = [];

  if (splitType === 'equal') {
    // Equal split: amount / number of people
    const shareAmount = parseFloat((amount / splitBetween.length).toFixed(2));
    processedSplits = splitBetween.map((userId) => ({
      user: userId,
      share: shareAmount,
    }));
  } else if (splitType === 'custom' || splitType === 'percentage') {
    // Custom/percentage: splitBetween mein { user, share } objects aane chahiye
    processedSplits = splitBetween;

    // Validation: sum === total amount
    const totalShare = processedSplits.reduce((sum, item) => sum + item.share, 0);

    if (splitType === 'percentage') {
      // Percentage mein sum === 100 hona chahiye
      if (Math.abs(totalShare - 100) > 0.01) {
        throw new ErrorResponse('Percentages must add up to 100', 400);
      }
      // Percentage ko actual amount mein convert karo
      processedSplits = processedSplits.map((item) => ({
        user: item.user,
        share: parseFloat(((item.share / 100) * amount).toFixed(2)),
      }));
    } else {
      // Custom mein sum === total amount hona chahiye
      if (Math.abs(totalShare - amount) > 0.01) {
        throw new ErrorResponse(
          `Split amounts (${totalShare}) must equal total amount (${amount})`,
          400
        );
      }
    }
  }

  const expense = await Expense.create({
    groupId,
    title,
    amount,
    paidBy,
    splitBetween: processedSplits,
    splitType,
    category,
    notes,
  });

  // Populate karke return karo
  await expense.populate('paidBy', 'name email avatar');
  await expense.populate('splitBetween.user', 'name email avatar');
  await expense.populate('groupId', 'name');

  res.status(201).json({ success: true, expense });
};

// ─── @route   GET /api/expenses/group/:groupId ────────────────
// ─── @access  Private ─────────────────────────────────────────
export const getGroupExpenses = async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) {
    throw new ErrorResponse('Group not found', 404);
  }

  // Member check
  const isMember = group.members.some(
    (memberId) => memberId.toString() === req.user._id.toString()
  );
  if (!isMember) {
    throw new ErrorResponse('Not authorized', 403);
  }

  const expenses = await Expense.find({ groupId: req.params.groupId })
    .populate('paidBy', 'name email avatar')
    .populate('splitBetween.user', 'name email avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: expenses.length,
    expenses,
  });
};

// ─── @route   PUT /api/expenses/:id ───────────────────────────
// ─── @access  Private (only paidBy user) ──────────────────────
export const updateExpense = async (req, res) => {
  let expense = await Expense.findById(req.params.id);
  if (!expense) {
    throw new ErrorResponse('Expense not found', 404);
  }

  // Sirf woh user update kar sakta hai jisne pay kiya
  if (expense.paidBy.toString() !== req.user._id.toString()) {
    throw new ErrorResponse('Only the payer can update this expense', 403);
  }

  const { title, category, notes } = req.body;

  expense = await Expense.findByIdAndUpdate(
    req.params.id,
    { title, category, notes },
    { new: true, runValidators: true }
  )
    .populate('paidBy', 'name email avatar')
    .populate('splitBetween.user', 'name email avatar');

  res.status(200).json({ success: true, expense });
};

// ─── @route   DELETE /api/expenses/:id ────────────────────────
// ─── @access  Private (only paidBy user) ──────────────────────
export const deleteExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    throw new ErrorResponse('Expense not found', 404);
  }

  if (expense.paidBy.toString() !== req.user._id.toString()) {
    throw new ErrorResponse('Only the payer can delete this expense', 403);
  }

  await expense.deleteOne();

  res.status(200).json({ success: true, message: 'Expense deleted successfully' });
};

// ─── @route   GET /api/expenses/group/:groupId/balances ───────
// ─── @access  Private ─────────────────────────────────────────
export const getGroupBalances = async (req, res) => {
  const group = await Group.findById(req.params.groupId).populate(
    'members',
    'name email avatar'
  );
  if (!group) {
    throw new ErrorResponse('Group not found', 404);
  }

  const isMember = group.members.some(
    (member) => member._id.toString() === req.user._id.toString()
  );
  if (!isMember) {
    throw new ErrorResponse('Not authorized', 403);
  }

  // Saare expenses fetch karo
  const expenses = await Expense.find({ groupId: req.params.groupId });

  // Net balance calculate karo har member ka
  // balances = { userId: netAmount }
  // Positive = yeh user receive karega
  // Negative = yeh user pay karega
  const balances = {};

  // Pehle sab members ko 0 se initialize karo
  group.members.forEach((member) => {
    balances[member._id.toString()] = 0;
  });

  // Har expense process karo
  expenses.forEach((expense) => {
    const payerId = expense.paidBy.toString();

    // Payer ko poora amount credit karo
    if (balances[payerId] !== undefined) {
      balances[payerId] += expense.amount;
    }

    // Har member ka share debit karo
    expense.splitBetween.forEach((split) => {
      const userId = split.user.toString();
      if (balances[userId] !== undefined) {
        balances[userId] -= split.share;
      }
    });
  });

  // Round off floating point issues
  Object.keys(balances).forEach((userId) => {
    balances[userId] = parseFloat(balances[userId].toFixed(2));
  });

  // Response mein user info ke saath balances do
  const balancesWithUserInfo = group.members.map((member) => ({
    user: {
      _id: member._id,
      name: member.name,
      email: member.email,
      avatar: member.avatar,
    },
    balance: balances[member._id.toString()],
    status:
      balances[member._id.toString()] > 0
        ? 'receives' // Yeh user paise lega
        : balances[member._id.toString()] < 0
        ? 'owes'     // Yeh user paise dega
        : 'settled', // Balanced
  }));

  res.status(200).json({
    success: true,
    groupId: req.params.groupId,
    balances: balancesWithUserInfo,
  });
};
