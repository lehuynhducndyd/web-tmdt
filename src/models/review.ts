import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device', // Tham chiếu đến model Device
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // Tham chiếu đến model User
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

const Review = mongoose.model('Review', reviewSchema);

export default Review;