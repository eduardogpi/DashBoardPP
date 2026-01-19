'use client'

import { Card, Button, Space } from 'antd'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'

export default function Settings() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6">Ajustes</h2>
      
      <div className="space-y-2">
        <Card hoverable className="cursor-pointer">
          <Space>
            <UserOutlined className="text-text-muted-light dark:text-text-muted-dark" />
            <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">Configurações de Perfil</span>
          </Space>
        </Card>

        <Button 
          danger 
          block 
          icon={<LogoutOutlined />}
          className="text-left"
        >
          Terminar Sessão
        </Button>
      </div>
    </div>
  )
}
