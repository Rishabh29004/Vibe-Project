import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    default: '',
    maxlength: 2000
  },
  media: [{
    url: String,
    type: { type: String, enum: ['image', 'video'] }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  hashtags: [String],
  isTrending: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
