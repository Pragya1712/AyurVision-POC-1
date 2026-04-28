// import mongoose, { Document, Model } from "mongoose";

// // 1. Define exactly what a question looks like
// export interface IDynamicQuestion {
//   id: string;
//   text: string;
//   options: string[];
// }

// // 2. Apply it to our main Patient interface
// export interface IPatientRecord extends Document {
//   userId: string;
//   patientName: string;
//   images: {
//     faceUrl: string;
//     tongueUrl?: string;
//   };
//   demographics: {
//     age: number;
//     gender: string;
//     city: string;
//     pincode?: string;
//   };
//   clinical: {
//     symptoms: string;
//     duration: number;
//     medicineTaken: boolean;
//     medicineDetails?: string;
//     medicalHistory: string;
//   };
//   // NO MORE 'any'! We use our strict types here:
//   dynamicQuestions: IDynamicQuestion[];
//   answers?: Record<string, string>; // Maps question IDs to answers, e.g., { "q1": "Option A" }
//   createdAt: Date;
// }

// const PatientRecordSchema = new mongoose.Schema<IPatientRecord>({
//   userId: { type: String, required: true },
//   patientName: { type: String, default: "Unknown" },
//   images: {
//     faceUrl: { type: String, required: true },
//     tongueUrl: { type: String },
//   },
//   demographics: {
//     age: { type: Number, required: true },
//     gender: { type: String, required: true },
//     city: { type: String, required: true },
//     pincode: { type: String },
//   },
//   clinical: {
//     symptoms: { type: String, required: true },
//     duration: { type: Number, required: true },
//     medicineTaken: { type: Boolean, required: true },
//     medicineDetails: { type: String },
//     medicalHistory: { type: String, required: true },
//   },
//   dynamicQuestions: [
//     {
//       id: { type: String, required: true },
//       text: { type: String, required: true },
//       options: [{ type: String }],
//     },
//   ],
// });

// const PatientRecord: Model<IPatientRecord> =
//   mongoose.models.PatientRecord ||
//   mongoose.model<IPatientRecord>("PatientRecord", PatientRecordSchema);
// export default PatientRecord;

import mongoose, { Document, Model } from "mongoose";

export interface IDynamicQuestion {
  id: string;
  text: string;
  options: string[];
}

export interface IPatientRecord extends Document {
  userId: string;
  patientName: string;
  images: { faceUrl: string; tongueUrl?: string };
  demographics: { age: number; gender: string; city: string; pincode?: string };
  clinical: {
    symptoms: string;
    duration: number;
    medicineTaken: boolean;
    medicineDetails?: string;
    medicalHistory: string;
  };
  dynamicQuestions: IDynamicQuestion[];
  answers?: Record<string, string>;

  // NEW: Added structure for the final Ayurvedic report
  finalReport?: {
    doshas: { vata: number; pitta: number; kapha: number };
    diagnosisSummary: string;
    conditions: Array<{ name: string; confidence: number; desc: string }>;
    routines: string[];
    yoga: string[];
    herbs: string[];
    usage: string[];
    recommendations: string[];
  };
  createdAt: Date;
}

const PatientRecordSchema = new mongoose.Schema<IPatientRecord>({
  userId: { type: String, required: true },
  patientName: { type: String, default: "Unknown" },
  images: {
    faceUrl: { type: String, required: true },
    tongueUrl: { type: String },
  },
  demographics: {
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String },
  },
  clinical: {
    symptoms: { type: String, required: true },
    duration: { type: Number, required: true },
    medicineTaken: { type: Boolean, required: true },
    medicineDetails: { type: String },
    medicalHistory: { type: String, required: true },
  },
  dynamicQuestions: [
    {
      id: { type: String, required: true },
      text: { type: String, required: true },
      options: [{ type: String }],
    },
  ],
  answers: { type: mongoose.Schema.Types.Mixed },

  // NEW: Allow saving the final report object
  finalReport: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

const PatientRecord: Model<IPatientRecord> =
  mongoose.models.PatientRecord ||
  mongoose.model<IPatientRecord>("PatientRecord", PatientRecordSchema);
export default PatientRecord;
