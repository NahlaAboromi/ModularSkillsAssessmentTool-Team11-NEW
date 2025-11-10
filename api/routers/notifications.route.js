const express = require('express');
const router = express.Router();
const Notification = require('../models/NotificationSchema');
//nahla
// Creates a new notification for a teacher.
router.post('/create', async (req, res) => {
  try {
    const { teacherId, type, title, read } = req.body;

    const newNotification = new Notification({
      teacherId,
      type,
      title,
      read
    });

    await newNotification.save();

    res.status(201).json({ message: '✅ Notification created successfully', notification: newNotification });
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Retrieves all notifications for a specific teacher, sorted by newest first.
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Sort by createdAt descending to get newest first
    const notifications = await Notification.find({ teacherId }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Marks a single notification as read.
router.patch('/mark-as-read/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const updated = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification marked as read', notification: updated });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Marks all notifications as read for a specific teacher.
router.patch('/mark-all-as-read/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    await Notification.updateMany({ teacherId, read: false }, { read: true });

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
