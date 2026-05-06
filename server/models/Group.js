import mongoose from "mongoose";
import crypto from 'crypto'//nodejs built in

const groupSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [100, 'Group name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to User model
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    inviteToken: {
      type: String,
      unique: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'settled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
  },
  {
    timestamps: true,
  });
groupSchema.pre('save', function() {
  if(!this.inviteToken) { 
    this.inviteToken = crypto.randomBytes(20).toString('hex');
  }
});
//now export group model
const Group = mongoose.model('Group', groupSchema);
export default Group;