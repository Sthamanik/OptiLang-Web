import mongoose, { Schema } from "mongoose";

export type ExecutionMode = "execute" | "analyze";

export interface ILineStat {
  line?: number;
  count: number;
  totalTimeMs: number;
  avgTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
  memoryVars: number;
  memoryBytes: number;
}

export interface IFunctionStat {
  name?: string;
  calls: number;
  totalTimeMs: number;
  avgTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
  maxRecursionDepth: number;
  callers: Record<string, number>;
}

export interface IProfilingData {
  lineStats: ILineStat[];
  functionStats: IFunctionStat[];
  totalTimeMs: number;
  totalLinesExecuted: number;
  totalLines: number;
  linesProfiled: number;
  peakMemoryBytes: number;
  complexityEstimate: string;
  complexityMethod: string;
  complexityConfidence: number;
  sampledLines: number;
  skippedLines: number;
  lineSamplingRate: number;
  memoryMode: string;
}

export interface ISuggestion {
  line: number;
  pattern: string;
  severity: string;
  description: string;
  suggestion: string;
  impactScore: number;
}

export interface IDimensionScores {
  correctness: number;
  efficiencyComplexity: number;
  quality: number;
  maintainability: number;
  complexitySubscore: number;
  efficiencySubscore: number;
  profilingPartial: boolean;
  optimizerPartial: boolean;
}

export interface IScoreReport {
  score: number;
  grade: string;
  complexityClass: string;
  dimensions: IDimensionScores;
  narrative: string;
  errorCount: number;
  linesProfiled: number;
  cv: number;
}

export interface IExecution {
  userId: mongoose.Types.ObjectId;
  mode: ExecutionMode;
  success: boolean;
  code: string;
  output: string;
  errors: string[];
  errorCount: number;
  executionTime: number;
  optimizationScore?: number;
  complexityClass?: string;
  profiling?: IProfilingData;
  peakMemoryBytes?: number;
  linesProfiled?: number;
  suggestions: ISuggestion[];
  suggestionCount: number;
  scoreReport?: IScoreReport;
  createdAt: Date;
  updatedAt: Date;
}

const LineStatSchema = new Schema<ILineStat>(
  {
    line: { type: Number, min: 1 },
    count: { type: Number, required: true, min: 0 },
    totalTimeMs: { type: Number, required: true, min: 0 },
    avgTimeMs: { type: Number, required: true, min: 0 },
    minTimeMs: { type: Number, required: true, min: 0 },
    maxTimeMs: { type: Number, required: true, min: 0 },
    memoryVars: { type: Number, required: true, min: 0 },
    memoryBytes: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const FunctionStatSchema = new Schema<IFunctionStat>(
  {
    name: { type: String },
    calls: { type: Number, required: true, min: 0 },
    totalTimeMs: { type: Number, required: true, min: 0 },
    avgTimeMs: { type: Number, required: true, min: 0 },
    minTimeMs: { type: Number, required: true, min: 0 },
    maxTimeMs: { type: Number, required: true, min: 0 },
    maxRecursionDepth: { type: Number, required: true, min: 0 },
    callers: { type: Map, of: Number, default: {} },
  },
  { _id: false },
);

const ProfilingDataSchema = new Schema<IProfilingData>(
  {
    lineStats: { type: [LineStatSchema], default: [] },
    functionStats: { type: [FunctionStatSchema], default: [] },
    totalTimeMs: { type: Number, required: true, min: 0 },
    totalLinesExecuted: { type: Number, required: true, min: 0 },
    totalLines: { type: Number, required: true, min: 0 },
    linesProfiled: { type: Number, required: true, min: 0 },
    peakMemoryBytes: { type: Number, required: true, min: 0 },
    complexityEstimate: { type: String, required: true },
    complexityMethod: { type: String, required: true },
    complexityConfidence: { type: Number, required: true, min: 0, max: 1 },
    sampledLines: { type: Number, required: true, min: 0 },
    skippedLines: { type: Number, required: true, min: 0 },
    lineSamplingRate: { type: Number, required: true, min: 0, max: 1 },
    memoryMode: { type: String, required: true },
  },
  { _id: false },
);

const SuggestionSchema = new Schema<ISuggestion>(
  {
    line: { type: Number, required: true, min: 1 },
    pattern: { type: String, required: true },
    severity: { type: String, required: true },
    description: { type: String, required: true },
    suggestion: { type: String, required: true },
    impactScore: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const DimensionScoresSchema = new Schema<IDimensionScores>(
  {
    correctness: { type: Number, required: true, min: 0 },
    efficiencyComplexity: { type: Number, required: true, min: 0 },
    quality: { type: Number, required: true, min: 0 },
    maintainability: { type: Number, required: true, min: 0 },
    complexitySubscore: { type: Number, required: true, min: 0 },
    efficiencySubscore: { type: Number, required: true, min: 0 },
    profilingPartial: { type: Boolean, required: true },
    optimizerPartial: { type: Boolean, required: true },
  },
  { _id: false },
);

const ScoreReportSchema = new Schema<IScoreReport>(
  {
    score: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String, required: true },
    complexityClass: { type: String, required: true },
    dimensions: { type: DimensionScoresSchema, required: true },
    narrative: { type: String, required: true },
    errorCount: { type: Number, required: true, min: 0 },
    linesProfiled: { type: Number, required: true, min: 0 },
    cv: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const ExecutionSchema = new Schema<IExecution>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ["execute", "analyze"],
      required: true,
      index: true,
    },
    success: {
      type: Boolean,
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
      maxlength: 100000,
    },
    errors: {
      type: [String],
      default: [],
    },
    errorCount: {
      type: Number,
      required: true,
      min: 0,
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
      index: true,
    },
    complexityClass: {
      type: String,
      index: true,
    },
    profiling: {
      type: ProfilingDataSchema,
    },
    peakMemoryBytes: {
      type: Number,
      min: 0,
    },
    linesProfiled: {
      type: Number,
      min: 0,
    },
    suggestions: {
      type: [SuggestionSchema],
      default: [],
    },
    suggestionCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    scoreReport: {
      type: ScoreReportSchema,
    },
  },
  {
    timestamps: true,
  },
);

ExecutionSchema.index({ userId: 1, createdAt: -1 });
ExecutionSchema.index({ userId: 1, mode: 1, createdAt: -1 });
ExecutionSchema.index({ userId: 1, optimizationScore: -1 });
ExecutionSchema.index({ complexityClass: 1, optimizationScore: -1 });
ExecutionSchema.index({ "scoreReport.score": -1 });
ExecutionSchema.index({ code: "text" });
ExecutionSchema.index({ "suggestions.severity": 1 });

export const Execution = mongoose.model<IExecution>(
  "Execution",
  ExecutionSchema,
);
