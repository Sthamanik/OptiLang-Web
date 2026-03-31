import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Tooltip, Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Flame, Zap, Activity } from 'lucide-react'
import type { ProfilingData } from '@/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface Props { profiling: ProfilingData | null }

export default function ProfilingPanel({ profiling }: Props) {
  if (!profiling) {
    return (
      <div className="placeholder">
        <Activity size={18} />
        <span>Run code with profiling enabled to see metrics</span>
      </div>
    )
  }

  const entries = Object.values(profiling.line_stats).sort(
    (a, b) => a.line - b.line,
  )

  const barColors = entries.map((s) => {
    if (s.avg_time_ms > 5)   return 'rgba(226,75,74,0.8)'
    if (s.avg_time_ms > 0.5) return 'rgba(239,159,39,0.8)'
    return                         'rgba(29,158,117,0.8)'
  })

  const chartData = {
    labels: entries.map((s) => `L${s.line}`),
    datasets: [{
      label: 'Avg time (ms)',
      data: entries.map((s) => s.avg_time_ms),
      backgroundColor: barColors,
      borderRadius: 3,
      borderSkipped: false,
    }],
  }

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: any[]) => `Line ${entries[items[0].dataIndex].line}`,
          label: (item: any) => {
            const s = entries[item.dataIndex]
            return [
              ` Count: ${s.count}×`,
              ` Avg: ${s.avg_time_ms.toFixed(3)} ms`,
              ` Total: ${s.total_time_ms.toFixed(3)} ms`,
              ` Memory: ${s.memory_bytes}B`,
            ]
          },
        },
      },
    },
    scales: {
      x: { ticks: { color: '#6e7681', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: {
        ticks: { color: '#6e7681', font: { size: 11 }, callback: (v: any) => `${v}ms` },
        grid: { color: 'rgba(255,255,255,0.04)' },
        beginAtZero: true,
      },
    },
  }

  // Top 3 hottest lines
  const hottest = [...entries].sort((a, b) => b.avg_time_ms - a.avg_time_ms).slice(0, 3)

  return (
    <div className="panel-body profiling-body">

      {/* Summary pills */}
      <div className="stat-grid">
        <div className="stat-card">
          <Zap size={14} className="stat-icon amber" />
          <span className="stat-label">Total time</span>
          <span className="stat-value">{profiling.total_time_ms.toFixed(2)} ms</span>
        </div>
        <div className="stat-card">
          <Activity size={14} className="stat-icon teal" />
          <span className="stat-label">Lines executed</span>
          <span className="stat-value">{profiling.total_lines_executed}</span>
        </div>
        <div className="stat-card">
          <Flame size={14} className="stat-icon red" />
          <span className="stat-label">Complexity</span>
          <span className="stat-value">{profiling.complexity_estimate}</span>
        </div>
        <div className="stat-card">
          <Activity size={14} className="stat-icon purple" />
          <span className="stat-label">Peak memory</span>
          <span className="stat-value">{(profiling.peak_memory_bytes / 1024).toFixed(1)} KB</span>
        </div>
      </div>

      {/* Bar chart */}
      {entries.length > 0 && (
        <>
          <p className="section-label">Line execution time</p>
          <div style={{ height: 180 }}>
            <Bar data={chartData} options={chartOpts as any} />
          </div>
          <div className="heat-legend">
            <span className="dot cold" /> &lt;0.5ms
            <span className="dot warm" /> 0.5–5ms
            <span className="dot hot"  /> &gt;5ms
          </div>
        </>
      )}

      {/* Hottest lines table */}
      {hottest.length > 0 && (
        <>
          <p className="section-label">Hottest lines</p>
          <table className="profile-table">
            <thead>
              <tr>
                <th>Line</th><th>Count</th><th>Avg (ms)</th><th>Total (ms)</th>
              </tr>
            </thead>
            <tbody>
              {hottest.map((s) => (
                <tr key={s.line}>
                  <td className="line-num">L{s.line}</td>
                  <td>{s.count}×</td>
                  <td className={s.avg_time_ms > 5 ? 'hot' : ''}>{s.avg_time_ms.toFixed(3)}</td>
                  <td>{s.total_time_ms.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Function stats */}
      {Object.keys(profiling.function_stats).length > 0 && (
        <>
          <p className="section-label">Function calls</p>
          <table className="profile-table">
            <thead>
              <tr>
                <th>Function</th><th>Calls</th><th>Avg (ms)</th><th>Total (ms)</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(profiling.function_stats).map((f) => (
                <tr key={f.name}>
                  <td className="fn-name">{f.name}()</td>
                  <td>{f.calls}×</td>
                  <td>{f.avg_time_ms.toFixed(3)}</td>
                  <td>{f.total_time_ms.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
