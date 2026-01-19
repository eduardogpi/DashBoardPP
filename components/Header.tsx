'use client'

import { Layout, Button, Badge, Avatar, Dropdown } from 'antd'
import { 
  MoonOutlined, 
  SunOutlined, 
  NotificationOutlined,
  PlusOutlined,
  UserOutlined 
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useTheme } from '@/app/theme-provider'

const { Header: AntHeader } = Layout

interface HeaderProps {
  activeTab: string
}

export default function Header({ activeTab }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Perfil',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'Configurações',
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Sair',
      icon: <UserOutlined />,
      danger: true,
    },
  ]

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Visão geral das ações e operações' }
      case 'units':
        return { title: 'Estrutura Organizacional', subtitle: 'Unidades CRP e hierarquia' }
      case 'reports':
        return { title: 'Relatórios Técnicos', subtitle: 'Documentos e análises' }
      case 'settings':
        return { title: 'Ajustes', subtitle: 'Configurações do sistema' }
      default:
        return { title: 'Dashboard', subtitle: 'Visão geral das ações e operações' }
    }
  }

  const { title, subtitle } = getTitle()

  return (
    <AntHeader className="sticky top-0 z-40 px-4 lg:px-8 py-3 lg:py-4 bg-white/80 dark:bg-card-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex flex-col">
          <h1 className="text-xl font-bold leading-none tracking-tight text-text-primary-light dark:text-text-primary-dark">{title}</h1>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium leading-tight pt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          className="hidden lg:flex items-center gap-2"
        >
          Nova Ocorrência
        </Button>

        <Button
          type="text"
          icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          className="flex items-center justify-center"
        />

        <Badge count={3} size="small">
          <Button
            type="text"
            icon={<NotificationOutlined />}
            className="flex items-center justify-center"
          />
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Avatar 
            icon={<UserOutlined />} 
            className="cursor-pointer bg-primary/20 border border-primary/30"
          />
        </Dropdown>
      </div>
    </AntHeader>
  )
}
