import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  userId: { type: String, required: true },
  patientDetails: {
    age: Number,
    gender: String,
    symptoms: String,
  },
  diagnosis: {
    dominantDosha: String,
    confidenceScore: Number,
    diagnosisSummary: String,
    recommendedDiet: [String],
    lifestyleAdvice: [String],
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
