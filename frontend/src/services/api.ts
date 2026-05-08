import axios from 'axios'
import type { ApiResponse, ExecuteRequest, ExecutionResult } from '@/types'

// ── Points to old server.py on port 8000 ─────────────────────────────────────
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 70_000,
})

export async function executeCode(
  req: ExecuteRequest,
): Promise<ApiResponse<ExecutionResult>> {
  const { data } = await client.post<ApiResponse<ExecutionResult>>(
    '/api/execute',
    req,
  )
  return data
}
