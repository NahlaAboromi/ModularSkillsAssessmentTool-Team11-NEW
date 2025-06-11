const express = require('express');
const router = express.Router();
const Class = require('../models/ClassSchema');
const Notification = require('../models/NotificationSchema'); // ✅ מוסיפים ייבוא Notification
const { analyzeStudentResponse } = require('../services/studentAnalysisService');

//  Create a new class
router.post('/create', async (req, res) => {
  try {
    const { classCode, className, subject, situation, question, createdBy } = req.body;
    // Check if a class with the same code already exists
    const existingClass = await Class.findOne({ classCode });
    if (existingClass) {
      return res.status(400).json({ message: 'Class Code already exists. Please choose a different code.' });
    }
    // Create and save new class
    const newClass = new Class({
      classCode,
      className,
      subject,
      situation,
      question,
      createdBy
    });

    await newClass.save();

    res.status(201).json({ 
      message: '✅ Class created successfully', 
      classData: newClass, 
      classId: newClass._id
    });
  } catch (error) {
    console.error('❌ Error creating class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//  Get all classes created by a specific teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const classes = await Class.find({ createdBy: teacherId });

    const mappedClasses = classes.map(classItem => ({
      id: classItem.classCode,
      name: classItem.className,
      subject: classItem.subject,
      situation: classItem.situation,
      question: classItem.question,
      createdDate: classItem.createdAt,
      status: 'Active',
      active: true,
      students: classItem.students || []  // <-- זה טוב
    }));

    res.status(200).json(mappedClasses);

  } catch (error) {
    console.error('❌ Error fetching classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//  Submit student's answer and save notification
router.post('/submit-answer', async (req, res) => {
  try {
    const { studentId, classCode, answerText } = req.body;

    const classDoc = await Class.findOne({ classCode });

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }
    const analysisResult = await analyzeStudentResponse({
      situation: classDoc.situation,
      question: classDoc.question,
      studentResponse: answerText,
      studentName: studentId
    });
        // Save student's answer with analysis result
    classDoc.students.push({
      studentId,
      answerText,
      analysisResult, 
      submittedAt: new Date()
    });

    await classDoc.save();

    //  Create notification for teacher about student submission
    const newNotification = new Notification({
      teacherId: classDoc.createdBy,
      type: 'exam',
      title: `Student ${studentId} submitted an answer in class ${classCode}`,
      time: new Date().toLocaleString(),
      read: false
    });

    await newNotification.save();

    res.status(200).json({ message: 'Answer submitted successfully and notification saved' });
  } catch (error) {
    console.error('❌ Error submitting answer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
//  Get class by class code
router.get('/get-class-by-code', async (req, res) => {
  try {
    const { classCode } = req.query;

    const classDoc = await Class.findOne({ classCode });

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.status(200).json({
      classCode: classDoc.classCode,
      className: classDoc.className,
      subject: classDoc.subject,
      situation: classDoc.situation,
      question: classDoc.question,
      createdBy: classDoc.createdBy,
      students: classDoc.students
    });
  } catch (error) {
    console.error('❌ Error fetching class by code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all classes in which a student submitted simulations
router.get('/get-classes-done-simulation/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }
    // Find classes where this student has submitted answers
    const classes = await Class.find({ "students.studentId": studentId });
    const mappedClasses = classes.map(classItem => ({
      _id: classItem._id,
      code: classItem.classCode,
      name: classItem.className,
      subject: classItem.subject,
      situation: classItem.situation,
      question: classItem.question,
      createdBy: classItem.createdBy,
      students: classItem.students,
    }));
    res.status(200).json(mappedClasses);  
  } catch (error) {
    console.error('❌ Error fetching class by code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all classes in the system
router.get('/get-all-classes', async (req, res) => {
  try {
    const classes = await Class.find();
    const mappedClasses = classes.map(classItem => ({
      _id: classItem._id,
      code: classItem.classCode,
      name: classItem.className,
      subject: classItem.subject,
      situation: classItem.situation,
      question: classItem.question,
      createdBy: classItem.createdBy,
      students: classItem.students,
    }));

    res.status(200).json(mappedClasses);  
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  Delete a class by classCode and notify the teacher
router.delete('/delete/:classCode', async (req, res) => {
  try {
    const { classCode } = req.params;

    //  Find the class before deletion
    const classDoc = await Class.findOne({ classCode });
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Create a notification before deletion
    const newNotification = new Notification({
      teacherId: classDoc.createdBy,
      type: 'warning',
      title: `The class "${classDoc.className}" has been deleted.`,
      time: new Date().toLocaleString(),
      read: false
    });
    await newNotification.save();

    //  Delete the class
    await Class.deleteOne({ classCode });

    res.status(200).json({ message: 'Class deleted and notification saved' });
  } catch (error) {
    console.error('❌ Error deleting class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


const { generateClassInsightFromClaude } = require('../services/classInsightService');

// Generate AI-based insight for a class using previous student analyses
router.post('/ai-class-insight', async (req, res) => {
  try {
    const { classCode } = req.body;

    const classDoc = await Class.findOne({ classCode });
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }
    // Filter and collect only valid analysis results
    const studentAnalyses = classDoc.students
      .filter(s => s.analysisResult)
      .map(s => s.analysisResult);

    if (studentAnalyses.length === 0) {
      return res.status(400).json({ message: 'No analyzed data in this class' });
    }

    const insight = await generateClassInsightFromClaude({
      situation: classDoc.situation,
      question: classDoc.question,
      studentAnalyses
    });

    res.status(200).json({ insight });

  } catch (error) {
    console.error('❌ Error generating class insight:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get the most recent answer of a student in a given class
router.get('/:classCode/student/:studentId', async (req, res) => {
  try {
    const { classCode, studentId } = req.params;

    const classDoc = await Class.findOne({ classCode });

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Filter all answers of the student in this class
    const allAnswers = classDoc.students.filter(s => s.studentId === studentId);

    if (allAnswers.length === 0) {
      return res.status(404).json({ message: 'Student answer not found in this class' });
    }

    //  Find the most recent answer by date
    const latestAnswer = allAnswers.reduce((latest, current) => {
      return new Date(current.submittedAt) > new Date(latest.submittedAt) ? current : latest;
    });

    res.status(200).json(latestAnswer);
  } catch (error) {
    console.error('❌ Error fetching student answer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
