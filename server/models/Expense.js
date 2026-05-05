import mongoose from "mongoose";
const expenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Paid by user is required'],
    },
    splitBetween: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        share: {
          type: Number,
          required: true,
          min: [0, 'Share cannot be negative'],
        },
        _id: false, // Sub-document mein extra _id nahi chahiye
      },
    ],
    splitType: {
      type: String,
      enum: {
        values: ['equal', 'custom', 'percentage'],
        message: '{VALUE} is not a valid split type',
      },
      default: 'equal',
    },
    category: {
      type: String,
      enum: {
        values: [
          'food',
          'travel',
          'accommodation',
          'entertainment',
          'shopping',
          'utilities',
          'medical',
          'other',
        ],
        message: '{VALUE} is not a valid category',
      },
      default: 'other',
    },
    receiptImage: {
      type: String, // Cloudinary URL
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);
//export expense model
const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;