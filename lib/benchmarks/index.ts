// Benchmark templates and sport category mapping
export { CATEGORY_TEMPLATES } from "./templates"
export type { SportCategory, TemplateBenchmark } from "./templates"
export { inferSportCategory, mapSportCategoryToBenchmarkCategory } from "./sportCategory"

// Full sports catalog (canonical source of truth)
export { SPORTS_CATALOG } from "./sportsCatalog"
export type { SportSeed, BenchmarkSeed } from "./sportsCatalog"

// PB comparison utilities
export { isBetter, epley1RM, resultToValue } from "./pbCompare"

// Validity, decay, and formatting utilities
export {
  monthsBetween,
  computePbStatus,
  formatTime,
  parseTime,
  formatBenchmarkValue,
} from "./validity"
export type { PbStatus, PbStatusParams } from "./validity"

// Activity benchmark evaluation
export {
  evaluateActivityBenchmarks,
  checkIfPersonalBest,
} from "./evaluateActivityBenchmarks"
export type {
  ActivityForEvaluation,
  BenchmarkDefForEvaluation,
  BenchmarkEvaluationResult,
} from "./evaluateActivityBenchmarks"
