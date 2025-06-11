const express = require('express');
const router = express.Router();
const Notification = require('../models/NotificationSchema');

// Creates a new notification for a teacher.
router.post('/create', async (req, res) => {
  try {
       // Extract notification details from the request body
    const { teacherId, type, title, time, read } = req.body;
        // Create a new notification document
    const newNotification = new Notification({
      teacherId,
      type,
      title,
      time,
      read
    });
       // Save the new notification to the database
    await newNotification.save();
    // Respond with a success message and the created notification
    res.status(201).json({ message: '✅ Notification created successfully', notification: newNotification });
  } catch (error) {
      // Log and handle errors during creation
    console.error('❌ Error creating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Retrieves all notifications for a specific teacher.
router.get('/teacher/:teacherId', async (req, res) => {
  try {
        // Extract teacherId from the request parameters
    const { teacherId } = req.params;
    // Find all notifications for the teacher
    const notifications = await Notification.find({ teacherId });

    res.status(200).json(notifications);
  } catch (error) {
      // Log and handle errors during retrieval
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Marks a single notification as read.
router.patch('/mark-as-read/:notificationId', async (req, res) => {
  try {
     // Extract notificationId from the request parameters
    const { notificationId } = req.params;
      // Update the notification's read status to true
    const updated = await Notification.findByIdAndUpdate(notificationId, { read: true });
    // If notification not found, respond with 404
    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    // Respond with a success message
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
      // Log and handle errors during update
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Marks all notifications as read for a specific teacher.
router.patch('/mark-all-as-read/:teacherId', async (req, res) => {
  try {
        // Extract teacherId from the request parameters
    const { teacherId } = req.params;
       // Update all unread notifications for the teacher to read: true
    await Notification.updateMany({ teacherId, read: false }, { read: true });
    // Respond with a success message
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
      // Log and handle errors during bulk update
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
