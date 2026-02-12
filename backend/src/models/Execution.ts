import mongoose, { Document, Schema } from 'mongoose';

export interface IExecution extends Document {
  userId: mongoose.Types.ObjectId;
  code: string;
  output: string;
  errors: string[];
  executionTime: number;
  optimizationScore?: number;
  createdAt: Date;
}

const ExecutionSchema = new Schema<IExecution>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      default: '',
    },
    errors: {
      type: [String],
      default: [],
    },
    executionTime: {
      type: Number,
      default: 0,
    },
    optimizationScore: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

export const Execution = mongoose.model<IExecution>('Execution', ExecutionSchema);
