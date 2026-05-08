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

// ── Auth stubs — used by useStore (wired to real backend when MongoDB is ready)
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
