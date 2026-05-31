import Post from '../models/Post.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createPost = async (req, res) => {
  try {
    const { content, media } = req.body;

    // Process media: save base64 images as files
    const processedMedia = [];
    if (media && media.length > 0) {
      for (const item of media) {
        if (item.url && item.url.startsWith('data:')) {
          // It's a base64 image — save to disk
          const matches = item.url.match(/^data:(.+);base64,(.+)$/);
          if (matches) {
            const ext = matches[1].split('/')[1] || 'png';
            const fileName = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
            const uploadsDir = path.join(__dirname, '..', 'uploads');
            const filePath = path.join(uploadsDir, fileName);

            // Write file
            fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));

            processedMedia.push({
              url: `/uploads/${fileName}`,
              type: item.type || 'image'
            });
          }
        } else {
          // Already a URL, keep as-is
          processedMedia.push(item);
        }
      }
    }

    const post = await Post.create({
      user: req.user.id,
      content: content || '',
      media: processedMedia
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { 'stats.posts': 1 } });

    const populatedPost = await post.populate('user', 'username profilePicture');
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const followingIds = currentUser.following.map(id => id.toString());

    // Get all posts, populated
    const allPosts = await Post.find()
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 });

    // Split into followed-user posts and the rest
    const followedPosts = [];
    const otherPosts = [];

    allPosts.forEach(post => {
      const postUserId = post.user._id.toString();
      // Skip the user's own posts
      if (postUserId === req.user.id) return;
      
      if (followingIds.includes(postUserId)) {
        followedPosts.push(post);
      } else {
        otherPosts.push(post);
      }
    });

    // Shuffle the "other" posts randomly (Fisher-Yates)
    for (let i = otherPosts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [otherPosts[i], otherPosts[j]] = [otherPosts[j], otherPosts[i]];
    }

    // Combine: followed posts first, then random discover posts
    const feed = [...followedPosts, ...otherPosts];
    res.json(feed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({
      user: req.user.id,
      text
    });

    await post.save();
    const updatedPost = await Post.findById(req.params.id)
      .populate('user', 'username profilePicture')
      .populate('comments.user', 'username profilePicture');
    
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Assert authorization (only author can delete)
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete post media from disk if it exists
    if (post.media && post.media.length > 0) {
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      for (const item of post.media) {
        if (item.url && item.url.startsWith('/uploads/')) {
          const fileName = item.url.split('/').pop();
          const filePath = path.join(uploadsDir, fileName);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (err) {
              console.error('Failed to delete file:', filePath, err);
            }
          }
        }
      }
    }

    await Post.findByIdAndDelete(req.params.id);

    // Decrement stats
    await User.findByIdAndUpdate(req.user.id, { $inc: { 'stats.posts': -1 } });

    res.json({ message: 'Post removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
