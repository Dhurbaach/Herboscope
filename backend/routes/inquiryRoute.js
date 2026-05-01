const express = require('express');
const router = express.Router();
const Inquiry = require('../models/inquiryModel');

const plantSelection = 'plantName scientificName imagePath';

// GET /inquiries/plant/:plantId - Fetch all inquiries for a plant
router.get('/plant/:plantId', async (req, res) => {
  try {
    const { plantId } = req.params;
    
    const inquiries = await Inquiry.find({ plantId })
      .populate('plantId', plantSelection)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ message: 'Error fetching inquiries', error: error.message });
  }
});

// POST /inquiries/plant/:plantId - Create a new inquiry
router.post('/plant/:plantId', async (req, res) => {
  try {
    const { plantId } = req.params;
    const { message, userName, userEmail } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (!userName || !userName.trim()) {
      return res.status(400).json({ message: 'User name is required' });
    }

    const newInquiry = new Inquiry({
      plantId,
      userName: userName.trim(),
      userEmail: userEmail || '',
      message: message.trim(),
    });

    const savedInquiry = await newInquiry.save();

    res.status(201).json({
      message: 'Inquiry created successfully',
      inquiry: savedInquiry,
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ message: 'Error creating inquiry', error: error.message });
  }
});

// GET /inquiries - Fetch all inquiries (Admin only)
router.get('/', async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate('plantId', plantSelection)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ message: 'Error fetching inquiries', error: error.message });
  }
});

// PUT /inquiries/:inquiryId - Add a reply to an inquiry (Admin only, supports multiple replies)
router.put('/:inquiryId', async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { reply, adminName } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const newReply = {
      replyText: reply.trim(),
      replyDate: new Date(),
      adminName: adminName || 'Expert',
    };

    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      inquiryId,
      {
        $push: { replies: newReply }, // Add reply to array
        reply: reply.trim(), // Also update latest reply for backward compatibility
        replyDate: new Date(),
        notified: true, // Mark that notification should be sent to user
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedInquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    res.status(200).json({
      message: 'Reply added successfully',
      inquiry: updatedInquiry,
    });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    res.status(500).json({ message: 'Error updating inquiry', error: error.message });
  }
});

// DELETE /inquiries/:inquiryId - Delete an inquiry (Admin only)
router.delete('/:inquiryId', async (req, res) => {
  try {
    const { inquiryId } = req.params;

    const deletedInquiry = await Inquiry.findByIdAndDelete(inquiryId);

    if (!deletedInquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    res.status(200).json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({ message: 'Error deleting inquiry', error: error.message });
  }
});

// GET /inquiries/user/notifications/:userEmail - Get unread notifications for a user
router.get('/user/notifications/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;

    if (!userEmail || !userEmail.trim()) {
      return res.status(400).json({ message: 'User email is required' });
    }

    const notifications = await Inquiry.find({
      userEmail: userEmail.trim(),
      reply: { $ne: null }, // Has a reply
      userRead: false, // Not yet read by user
      notified: true, // Notification flag is set
    })
      .populate('plantId', plantSelection)
      .sort({ replyDate: -1 })
      .lean();

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// GET /inquiries/user/replies/:userEmail - Get all replied inquiries (read + unread) for a user
router.get('/user/replies/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;

    if (!userEmail || !userEmail.trim()) {
      return res.status(400).json({ message: 'User email is required' });
    }

    const repliedInquiries = await Inquiry.find({
      userEmail: userEmail.trim(),
      reply: { $ne: null },
    })
      .populate('plantId', plantSelection)
      .sort({ replyDate: -1 })
      .lean();

    res.status(200).json(repliedInquiries);
  } catch (error) {
    console.error('Error fetching replied inquiries:', error);
    res.status(500).json({ message: 'Error fetching replied inquiries', error: error.message });
  }
});

// PUT /inquiries/user/mark-read/:inquiryId - Mark notification as read
router.put('/user/mark-read/:inquiryId', async (req, res) => {
  try {
    const { inquiryId } = req.params;

    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      inquiryId,
      {
        userRead: true,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedInquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    res.status(200).json({
      message: 'Notification marked as read',
      inquiry: updatedInquiry,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
});

module.exports = router;
