const mongoose = require('mongoose'); // Import mongoose to work with MongoDB

// Define schema for teacher notifications
const NotificationSchema = new mongoose.Schema({
  teacherId: { type: String, required: true }, // The ID of the teacher this notification belongs to
  type: { 
    type: String, 
    enum: ['success', 'exam', 'message', 'schedule', 'warning'], // Allowed types of notifications
    required: true 
  },
  title: { type: String, required: true }, // Short title or subject of the notification
  time: { type: String, required: true }, // Time the notification was created (can be changed to Date type later)
  read: { type: Boolean, default: false } // Whether the notification has been read
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Export the model to use in the application
module.exports = mongoose.model('Notification', NotificationSchema);
