import mongoose from "mongoose";
import bycrpt from 'bcryptjs'

const userSchema = mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // 🔑 Important - query mein by default nahi aayega
    },
    avatar: {
      type: String,
      default: '',
    },
  }, 
  {
    timestamps: true,
  })

  // Encrypt password before saving
  userSchema.pre('save', async function (next) {
    //tab hashed  ho jab password change ho 
    if(!this.isModified('password')) return next();
    //hash password
    const salt = await bycrpt.genSalt(10)
    this.password = await bycrpt.hash(this.password, salt)
    next();
  })
//now password compare karne ke liye method
  userSchema.methods.matchPassword = async function(enteredPassword){
    return await bycrpt.compare(enteredPassword, this.password)
  };
  const User = mongoose.model('User', userSchema);
  export default User;