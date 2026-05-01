const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, default: '' },
  message: { type: String, required: true },
  replies: [
    {
      replyText: { type: String, required: true },
      replyDate: { type: Date, default: Date.now },
      adminName: { type: String, default: 'Expert' },
    },
  ],
  reply: { type: String, default: null }, // Latest reply (for backward compatibility)
  replyDate: { type: Date, default: null }, // Latest reply date (for backward compatibility)
  notified: { type: Boolean, default: false }, // Whether user has been notified about the reply
  userRead: { type: Boolean, default: false }, // Whether user has read the reply notification
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Inquiry', inquirySchema);
