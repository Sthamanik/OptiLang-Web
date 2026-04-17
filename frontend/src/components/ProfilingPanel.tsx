import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { ChevronRight, Zap, Activity, Flame } from 'lucide-react'
import type { ProfilingData } from '@/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

interface Props {
  profiling: ProfilingData | null
}

function heatColor(avgMs: number): string {
  if (avgMs > 5) return '#f87171'
  if (avgMs > 0.5) return '#e8a94a'
  return '#3ecf8e'
}

function AnimatedHeatBar({ pct, color }: { pct: number; color: string }) {
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = fillRef.current
    if (!el) return
    el.style.width = '0%'
    el.style.transition = 'none'
    void el.getBoundingClientRect()
    requestAnimationFrame(() => {
      el.style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
      el.style.width = `${pct}%`
    })
  }, [pct])

  return (
    <div className="pf-heat-track">
      <div ref={fillRef} className="pf-heat-fill" style={{ width: '0%', background: color }} />
      <div className="pf-heat-remain" style={{ flex: 1 }} />
    </div>
  )
}

export default function ProfilingPanel({ profiling }: Props) {
  if (!profiling) {
    return (
      <div className="placeholder">
        <span>Run code with profiling enabled to see metrics</span>
      </div>
    )
  }

  const entries = Object.values(profiling.line_stats).sort((a, b) => a.line - b.line)
  const hottest = [...entries].sort((a, b) => b.avg_time_ms - a.avg_time_ms).slice(0, 5)
  const maxAvg  = hottest[0]?.avg_time_ms ?? 1

  const chartData = {
    labels: entries.map((s) => `L${s.line}`),
    datasets: [{
      label: 'Avg time (ms)',
      data:  entries.map((s) => s.avg_time_ms),
      backgroundColor: entries.map((s) => heatColor(s.avg_time_ms)),
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
            return [`Count: ${s.count}×`, `Avg: ${s.avg_time_ms.toFixed(3)} ms`, `Total: ${s.total_time_ms.toFixed(3)} ms`]
          },
        },
      },
    },
    scales: {
      x: { ticks: { color: '#72727c', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { beginAtZero: true, ticks: { color: '#72727c', font: { size: 9 }, callback: (v: any) => `${v} ms` }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  }

  const fnStats = Object.values(profiling.function_stats)

  return (
    <div className="pf-body">

      {/* Summary cards */}
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

      {/* Chart */}
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

      {/* Hottest lines with animated heat bar */}
      {hottest.length > 0 && (
        <div className="pf-section">
          <p className="pf-section-label">Hottest lines</p>
          <div className="pf-hot-table">
            <div className="pf-hot-header">
              <span>Line</span>
              <span>Time</span>
              <span>Count</span>
              <span>Heat</span>
            </div>
            {hottest.map((s) => {
              const pct   = (s.avg_time_ms / maxAvg) * 100
              const color = heatColor(s.avg_time_ms)
              return (
                <div key={s.line} className="pf-hot-row">
                  <span className="pf-hot-line">L{s.line}</span>
                  <span className="pf-hot-time">{s.avg_time_ms.toFixed(3)} ms</span>
                  <span className="pf-hot-count">{s.count}×</span>
                  <AnimatedHeatBar pct={pct} color={color} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Function calls */}
      {fnStats.length > 0 && (
        <div className="pf-section">
          <p className="pf-section-label">Function calls</p>
          <div className="pf-fn-list">
            {fnStats.map((f) => (
              <div key={f.name} className="pf-fn-card">
                <div className="pf-fn-info">
                  <span className="pf-fn-name">{f.name}()</span>
                  <div className="pf-fn-tags">
                    <span className="pf-tag pf-tag-blue">{f.calls} calls</span>
                    <span className="pf-tag pf-tag-green">{f.total_time_ms.toFixed(1)} ms total</span>
                    <span className="pf-tag pf-tag-amber">depth {f.max_recursion_depth ?? 1}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="pf-fn-arrow" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
