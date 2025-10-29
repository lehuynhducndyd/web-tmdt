import mongoose, { Schema } from 'mongoose';

const reviewDeviceSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

const reviewAccSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Accessory',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });



const ReviewDevice = mongoose.model('ReviewDevice', reviewDeviceSchema);
const ReviewAcc = mongoose.model('ReviewAcc', reviewAccSchema);

export { ReviewDevice, ReviewAcc };
