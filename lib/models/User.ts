// import mongoose, { Document, Model } from "mongoose";

// // Define the TypeScript interface for the User
// export interface IUser extends Document {
//   name?: string;
//   email: string;
//   password?: string;
//   createdAt: Date;
// }

// const UserSchema = new mongoose.Schema<IUser>({
//   name: {
//     type: String,
//     required: false, // Not required for login, only signup
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Prevent Next.js from recompiling the model and crashing
// const User: Model<IUser> =
//   mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

// export default User;

import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
