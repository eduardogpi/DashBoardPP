'use client'

import { Layout, Menu } from 'antd'
import { 
  DashboardOutlined, 
  ApartmentOutlined, 
  FileTextOutlined, 
  SettingOutlined 
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

const { Sider } = Layout

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'units',
      icon: <ApartmentOutlined />,
      label: 'Unidades',
    },
    {
      key: 'reports',
      icon: <FileTextOutlined />,
      label: 'Relatórios',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Ajustes',
    },
  ]

  return (
    <Sider
      width={280}
      className="fixed left-0 top-0 bottom-0 z-50 hidden lg:block bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark"
      style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}
    >
      <div className="p-6 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <DashboardOutlined className="text-primary text-2xl" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">Painel CRP</h1>
            <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-bold uppercase tracking-widest">DGPP</p>
          </div>
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[activeTab]}
        items={menuItems}
        onClick={({ key }) => onTabChange(key)}
        className="border-none"
        style={{ backgroundColor: 'transparent' }}
      />

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <span className="text-primary font-bold">CR</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark truncate">Cmd CRP</p>
            <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark truncate">Comando</p>
          </div>
        </div>
      </div>
    </Sider>
  )
}
