import axios from 'axios'
import type { ApiResponse, ExecuteRequest, ExecutionResult } from '@/types'

const client = axios.create({
  baseURL: '/',
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
