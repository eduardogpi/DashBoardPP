'use client'

import { ConfigProvider, theme as antTheme } from 'antd'
import { useTheme } from './theme-provider'
import { useEffect, useState } from 'react'
import { FilterProvider } from './filter-context'

export default function Providers({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <FilterProvider>
        {children}
      </FilterProvider>
    )
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#197fe6',
          borderRadius: 12,
          ...(theme === 'dark' ? {
            colorBgContainer: '#1e293b',
            colorBgElevated: '#1e293b',
            colorBgLayout: '#0f172a',
            colorText: '#f1f5f9',
            colorTextSecondary: '#94a3b8',
            colorTextTertiary: '#64748b',
            colorTextQuaternary: '#475569',
            colorTextHeading: '#f1f5f9',
            colorTextDescription: '#94a3b8',
            colorTextPlaceholder: '#64748b',
            colorBorder: '#334155',
            colorBorderSecondary: '#1e293b',
            colorSplit: '#334155',
          } : {
            colorBgContainer: '#ffffff',
            colorBgLayout: '#f8fafc',
            colorText: '#0f172a',
            colorTextSecondary: '#64748b',
            colorTextTertiary: '#94a3b8',
            colorTextQuaternary: '#cbd5e1',
            colorTextHeading: '#0f172a',
            colorTextDescription: '#64748b',
            colorTextPlaceholder: '#94a3b8',
            colorBorder: '#e2e8f0',
            colorBorderSecondary: '#f1f5f9',
            colorSplit: '#e2e8f0',
          })
        },
      }}
    >
      <FilterProvider>
        {children}
      </FilterProvider>
    </ConfigProvider>
  )
}
