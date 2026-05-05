import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema({
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group ID is required'],
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payer (from) is required'],
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver (to) is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Settlement amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  })

export default mongoose.model("Settlement", settlementSchema);