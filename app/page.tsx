'use client'

import { useState } from 'react'
import { Layout } from 'antd'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Dashboard from '@/components/Dashboard'
import Units from '@/components/Units'
import Reports from '@/components/Reports'
import Settings from '@/components/Settings'

const { Content } = Layout

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'units':
        return <Units />
      case 'reports':
        return <Reports />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout className="min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <Layout className="lg:pl-[280px]">
        <Header activeTab={activeTab} />
        <Content className="p-4 lg:p-8 bg-background-light dark:bg-background-dark">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  )
}
