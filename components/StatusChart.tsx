'use client'

import dynamic from 'next/dynamic'
import { useTheme } from '@/app/theme-provider'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface StatusChartProps {
  series: number[]
  labels: string[]
  colors?: string[]
}

export default function StatusChart({ series, labels, colors }: StatusChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const options = {
    chart: {
      type: 'donut' as const,
      height: 300,
      background: 'transparent',
    },
    theme: {
      mode: isDark ? 'dark' as const : 'light' as const,
    },
    labels,
    colors: colors || ['#3b82f6', '#ef4444', '#22c55e'],
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            value: {
              color: isDark ? '#f1f5f9' : '#0f172a',
            },
            total: {
              show: true,
              label: 'Total',
              color: isDark ? '#94a3b8' : '#64748b',
            }
          }
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: 'bottom' as const,
      labels: {
        colors: isDark ? '#f1f5f9' : '#0f172a',
      }
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: (val: number) => `${val} ações`,
      },
    },
    stroke: {
      show: false,
    }
  }

  return <ReactApexChart options={options} series={series} type="donut" height={300} />
}
