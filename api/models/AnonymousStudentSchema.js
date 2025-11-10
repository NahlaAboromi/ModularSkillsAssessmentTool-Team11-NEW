// File: models/AnonymousStudentSchema.js
const mongoose = require("mongoose");

// ✅ Duplicate of StudentSchema but for anonymous participants
const AnonymousStudentSchema = new mongoose.Schema(
  {
    // ✅ Anonymous identifier (always unique)
    anonId: { type: String, unique: true, required: true, index: true },

    // Demographics (optional)
    gender: { type: String },             // "female" | "male" | "other"
    ageRange: { type: String },           // "18-22" | "23-26" | ...
    fieldOfStudy: { type: String },       // final value or "Other" text
    semester: { type: String },           // "1".."8" or descriptive label

    // Optional fields (if needed in the future)
    id: { type: String },                 
    email: { type: String },              
    password: { type: String },           

    // Housekeeping
    createdAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date },
  },
  {
    collection: "anonymous_students", // 🔹 separate collection
    versionKey: false,
  }
);

// ✅ Indexes (same as student)
AnonymousStudentSchema.index({ email: 1 }, { unique: true, sparse: true });
AnonymousStudentSchema.index({ id: 1 }, { unique: true, sparse: true });

// ✅ Safe export (avoids OverwriteModelError)
module.exports =
  mongoose.models.AnonymousStudent ||
  mongoose.model("AnonymousStudent", AnonymousStudentSchema);
