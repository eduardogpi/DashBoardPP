'use client'

import dynamic from 'next/dynamic'
import { useTheme } from '@/app/theme-provider'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface TrendChartProps {
  series: { name: string; data: number[] }[]
  categories: string[]
}

export default function TrendChart({ series, categories }: TrendChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const options = {
    chart: {
      type: 'area' as const,
      height: 300,
      background: 'transparent',
      toolbar: {
        show: false,
      },
    },
    theme: {
      mode: isDark ? 'dark' as const : 'light' as const,
    },
    series,
    xaxis: {
      categories,
      labels: {
        style: {
          colors: isDark ? '#94a3b8' : '#64748b',
        }
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? '#94a3b8' : '#64748b',
        }
      }
    },
    grid: {
      borderColor: isDark ? '#334155' : '#e2e8f0',
      strokeDashArray: 4,
    },
    colors: ['#197fe6'],
    fill: {
      type: 'gradient' as const,
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2,
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: (val: number) => `${val} ocorrências`,
      },
    },
  }

  return <ReactApexChart options={options} series={series} type="area" height={300} />
}
