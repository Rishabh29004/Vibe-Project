import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user.id] }
    })
    .populate('participants', 'username profilePicture')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, recipientId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, recipientId]
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      sender: req.user.id,
      text
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
