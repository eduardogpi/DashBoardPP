'use client'

import { useState } from 'react'
import { Card, List, Tag, Button, Modal, Space, Empty } from 'antd'
import { ClockCircleOutlined, TeamOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { getActionsList, Acao, getStatusDescription, getStatusColorById } from '../utils/data-service'
import { useFilters } from '../app/filter-context'

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}

const getDaysSince = (dateString: string) => {
  if (!dateString) return '-'
  const today = new Date()
  const updateDate = new Date(dateString)
  today.setHours(0, 0, 0, 0)
  updateDate.setHours(0, 0, 0, 0)
  
  const diffTime = today.getTime() - updateDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  return `${diffDays} dias atrás`
}

export default function Top5RecentUpdates() {
  const { filters } = useFilters()
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const allActions = getActionsList(filters.setor, filters.status, filters.period, filters.objetivo, filters.risco)
  
  // Ordenar por dataUltimaAtualizacao de forma decrescente
  const sortedActions = [...allActions].sort((a, b) => {
    return new Date(b.dataUltimaAtualizacao).getTime() - new Date(a.dataUltimaAtualizacao).getTime()
  })
  
  const top5Actions = sortedActions.slice(0, 5)

  const ActionItem = ({ acao, showIndex = false, index = 0 }: { acao: Acao, showIndex?: boolean, index?: number }) => (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors">
      {showIndex && (
        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${
          index === 0 ? 'bg-yellow-500 text-white' :
          index === 1 ? 'bg-gray-400 text-white' :
          index === 2 ? 'bg-orange-400 text-white' :
          'bg-gray-200 text-gray-600'
        }`}>
          {index + 1}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark line-clamp-2" title={acao.nome}>
            {acao.nome}
          </h4>
          <Tag color={getStatusColorById(acao.statusId)} className="shrink-0">
            {getStatusDescription(acao.statusId)}
          </Tag>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
          <TeamOutlined />
          <span>{acao.setorSigla || '-'}</span>
          <span>•</span>
          <ClockCircleOutlined />
          <span>{getDaysSince(acao.dataUltimaAtualizacao)}</span>
          <span>•</span>
          <span>{formatDate(acao.dataUltimaAtualizacao)}</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Card 
        title={
          <Space>
            <ClockCircleOutlined className="text-blue-500" />
            <span className="font-bold uppercase text-sm">Últimas Atualizações</span>
          </Space>
        }
        extra={
          <Button 
            type="link" 
            size="small" 
            onClick={() => setIsModalOpen(true)}
          >
            Ver todas
          </Button>
        }
        className="h-full"
      >
        {top5Actions.length === 0 ? (
          <Empty description="Nenhuma atualização recente encontrada." />
        ) : (
          <div className="space-y-2">
            {top5Actions.map((acao, index) => (
              <ActionItem key={acao.id} acao={acao} showIndex={true} index={index} />
            ))}
          </div>
        )}
      </Card>

      <Modal
        title={
          <Space>
            <ClockCircleOutlined className="text-blue-500" />
            <span className="font-bold uppercase">Todas as Atualizações Recentes</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsModalOpen(false)}>
            Fechar
          </Button>
        ]}
        width={800}
      >
        {sortedActions.length === 0 ? (
          <Empty description="Nenhuma atualização recente encontrada." />
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {sortedActions.map((acao, index) => (
              <ActionItem key={acao.id} acao={acao} showIndex={true} index={index} />
            ))}
          </div>
        )}
      </Modal>
    </>
  )
}
