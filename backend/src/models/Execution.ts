import mongoose, { Schema } from "mongoose";

export interface IExecution  {
  userId: mongoose.Types.ObjectId;
  code: string;
  output: string;
  errors: string[];
  executionTime: number;
  optimizationScore?: number;
  complexityClass?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExecutionSchema = new Schema<IExecution>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      maxlength: 20000,
    },
    output: {
      type: String,
      default: "",
    },
    errors: {
      type: [String],
      default: [],
      maxlength: 50000
    },
    executionTime: {
      type: Number,
      required: true,
      min: 0,
    },
    optimizationScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    complexityClass: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// index for history search (userId + code text search + sort fields) 
ExecutionSchema.index({ userId: 1, createdAt: -1 });
ExecutionSchema.index({ code: "text" });

export const Execution = mongoose.model<IExecution>(
  "Execution",
  ExecutionSchema
);