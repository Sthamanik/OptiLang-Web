import axios from 'axios'
import type { ApiResponse, ExecuteRequest, ExecutionResult } from '@/types'

// ── Points to interpreter-service on port 8000 ────────────────────────────────
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    // Required by interpreter-service auth middleware
    'X-Internal-Service-Secret': import.meta.env.VITE_INTERPRETER_SECRET || 'optilang-secret',
  },
  timeout: 70_000,
})

// ── Execute via /analyze — full pipeline in one shot ─────────────────────────
// Returns: output + profiling + suggestions + score_report
export async function executeCode(
  req: ExecuteRequest,
): Promise<ApiResponse<ExecutionResult>> {
  const { data } = await client.post('/analyze', req)

  // Normalize interpreter-service response to match our ExecutionResult shape:
  // - score_report → score  (old server.py used 'score', interpreter-service uses 'score_report')
  // - execution_time (seconds) → execution_time_ms (milliseconds)
  const normalized: ExecutionResult = {
    ...data,
    score:             data.score_report ?? data.score ?? null,
    execution_time_ms: data.execution_time != null
                         ? data.execution_time * 1000
                         : (data.execution_time_ms ?? 0),
  }

  return {
    success: data.success ?? true,
    message: '',
    data:    normalized,
  }
}

// ── Auth stubs — localStorage fallback (backend not connected) ────────────────
export async function loginUser(
  _email: string, _pass: string
): Promise<ApiResponse<{ user: { _id:string; name:string; email:string } }>> {
  throw new Error('Backend not connected — using localStorage auth')
}

export async function registerUser(
  _name: string, _email: string, _pass: string
): Promise<ApiResponse<{ user: { _id:string; name:string; email:string } }>> {
  throw new Error('Backend not connected — using localStorage auth')
}

export async function logoutUser(): Promise<void> {
  // no-op until backend is connected
}
