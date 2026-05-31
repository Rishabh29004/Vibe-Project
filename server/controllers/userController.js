import User from '../models/User.js';
import Post from '../models/Post.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username profilePicture bio')
      .populate('following', 'username profilePicture bio');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ user: user._id })
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json({ user, posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, bio, profilePicture, bannerImage, email } = req.body;
    const user = await User.findById(req.user.id);

    if (user) {
      user.username = username || user.username;
      if (bio !== undefined) user.bio = bio;
      user.profilePicture = profilePicture || user.profilePicture;
      user.bannerImage = bannerImage || user.bannerImage;

      if ('email' in req.body) {
        if (!email || email.trim() === '') {
          user.email = undefined;
        } else {
          user.email = email;
        }
      }

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    // Exclude the current user AND everyone they already follow
    const excludeIds = [req.user.id, ...currentUser.following.map(id => id.toString())];

    const users = await User.find({ _id: { $nin: excludeIds } })
      .select('username profilePicture bio followers')
      .limit(10);

    const usersWithFollowStatus = users.map(u => ({
      ...u._doc,
      isFollowing: false // all returned users are not followed by definition
    }));

    res.json(usersWithFollowStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) return res.status(404).json({ message: 'User not found' });

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user.id);
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user.id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ message: isFollowing ? 'Unfollowed' : 'Followed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
