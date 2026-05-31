import User from '../models/User.js';
import Post from '../models/Post.js';

export const searchVibe = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({ users: [], posts: [] });

    const users = await User.find({
      username: { $regex: query, $options: 'i' }
    }).select('username profilePicture bio').limit(5);

    const posts = await Post.find({
      $or: [
        { content: { $regex: query, $options: 'i' } },
        { hashtags: { $in: [new RegExp(query, 'i')] } }
      ]
    }).populate('user', 'username profilePicture').limit(10);

    res.json({ users, posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
