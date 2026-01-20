'use client'

import { useMemo, useState } from 'react'
import { Card, Row, Col, Progress, Badge, Space, Tooltip, Empty, Tag, Button, Modal, Descriptions, List, Divider } from 'antd'
import { 
  CalendarOutlined,
  TeamOutlined,
  AimOutlined,
  WarningOutlined,
  ProjectOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import { useFilters } from '../app/filter-context'
import { getActionsList, Acao, getStatusDescription, getStatusColorById } from '../utils/data-service'

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}

const getDaysLabel = (acao: Acao) => {
  // Se status for Cancelado (id: 1), não mostrar contagem de dias
  if (acao.statusId === 1) {
    return null
  }

  // Se status for Concluído (id: 2), mostrar data da última atualização
  if (acao.statusId === 2) {
    return (
      <span className="text-green-500 font-bold">
        Atualizado: {formatDate(acao.dataUltimaAtualizacao)}
      </span>
    )
  }

  // Para outros status, mostrar contagem de dias
  const today = new Date()
  const endDate = new Date(acao.dataFim)
  today.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)
  
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return (
      <span className="text-red-500 font-bold">
        {diffDays} dias
      </span>
    )
  }
  
  return <span>{diffDays} dias rest.</span>
}

interface ActionCardProps {
  acao: Acao
  onOpenModal: (acao: Acao) => void
}

const ActionCard = ({ acao, onOpenModal }: ActionCardProps) => {
  const [showExpected, setShowExpected] = useState(false)

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 border-l-4 h-full"
      style={{ 
        borderLeftColor: '#1890ff'
      }}
      bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Cabeçalho */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-2">
          <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark line-clamp-2" title={acao.nome}>
            {acao.nome}
          </h4>
          <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-1 flex items-center gap-1">
            <TeamOutlined /> {acao.setorSigla || '-'} - {acao.setorNome}
          </p>
        </div>
        <Tag color={getStatusColorById(acao.statusId)}>
          {getStatusDescription(acao.statusId)}
        </Tag>
      </div>

      {/* Datas */}
      <div className="flex items-center gap-2 text-xs text-text-secondary-light dark:text-text-secondary-dark mb-4 bg-background-light dark:bg-background-dark p-2 rounded border border-border-light dark:border-border-dark">
        <CalendarOutlined />
        <span>{formatDate(acao.dataInicio)}</span>
        <span>→</span>
        <span>{formatDate(acao.dataFim)}</span>
        {getDaysLabel(acao) && (
          <span className="ml-auto font-mono text-[10px]">
            {getDaysLabel(acao)}
          </span>
        )}
      </div>

      {/* Progresso */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
            {showExpected ? 'Progresso Esperado' : 'Execução Física'}
          </span>
          <span className={`text-xs font-bold ${showExpected ? 'text-blue-500' : 'text-text-primary-light dark:text-text-primary-dark'}`}>
            {showExpected ? acao.progressoEsperado : acao.percentualConcluido}%
          </span>
        </div>
        <Progress 
          percent={showExpected ? acao.progressoEsperado : acao.percentualConcluido} 
          size="small"
          status={showExpected ? "active" : "active"}
          strokeColor={showExpected ? "#1890ff" : undefined}
          showInfo={false}
        />
        <div className="flex justify-end mt-1">
          <Tooltip 
            title={`Deveria estar em: ${acao.progressoEsperado}%. Situação atual: ${acao.situacaoCronograma}`}
            placement="bottomRight"
          >
            <span 
              className="text-[10px] text-text-muted-light cursor-help border-b border-dotted border-gray-400"
              onMouseEnter={() => setShowExpected(true)}
              onMouseLeave={() => setShowExpected(false)}
            >
              Esperado: {acao.progressoEsperado}%
            </span>
          </Tooltip>
        </div>
      </div>

      {/* Rodapé com indicadores de Objetivos/Riscos */}
      <div className="mt-auto pt-3 border-t border-border-light dark:border-border-dark flex justify-between items-center">
        <div className="flex gap-3 text-xs">
          <Tooltip title={`${acao.objetivos.length} Objetivos Estratégicos vinculados`}>
            <Space className="cursor-help text-text-secondary-light">
              <AimOutlined /> {acao.objetivos.length}
            </Space>
          </Tooltip>

          <Tooltip title={`${acao.riscos.length} Riscos monitorados`}>
            <Space className={`cursor-help ${acao.riscos.length > 0 ? 'text-orange-500' : 'text-text-secondary-light'}`}>
              <WarningOutlined /> {acao.riscos.length}
            </Space>
          </Tooltip>
        </div>
        
        <Button 
          type="primary" 
          ghost 
          size="small" 
          icon={<InfoCircleOutlined />}
          onClick={() => onOpenModal(acao)}
        >
          Detalhar
        </Button>
      </div>
    </Card>
  )
}

export default function ActionsBySector() {
  const { filters } = useFilters()
  const [selectedAction, setSelectedAction] = useState<Acao | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const data = useMemo(() => {
    return getActionsList(filters.setor, filters.status, filters.period)
  }, [filters.setor, filters.status, filters.period])

  const handleOpenModal = (acao: Acao) => {
    setSelectedAction(acao)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAction(null)
  }

  if (data.length === 0) {
    return (
      <Card className="mt-6">
        <Empty description="Nenhuma ação encontrada para os filtros selecionados." />
      </Card>
    )
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark uppercase flex items-center gap-2">
          <ProjectOutlined /> Lista de Ações Estratégicas
        </h3>
        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
          {data.length} ações listadas
        </span>
      </div>

      <Row gutter={[16, 16]}>
        {data.map((acao) => (
          <Col xs={24} md={12} xl={8} key={acao.id}>
            <ActionCard acao={acao} onOpenModal={handleOpenModal} />
          </Col>
        ))}
      </Row>

      {/* Modal de Detalhes */}
      <Modal
        title={
          <div className="flex items-center gap-2 pr-8">
            <ProjectOutlined className="text-primary" />
            <span className="line-clamp-1" title={selectedAction?.nome}>
              {selectedAction?.nome}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Fechar
          </Button>
        ]}
        width={800}
      >
        {selectedAction && (
          <div className="space-y-6">
            {/* Status e Setor */}
            <div className="flex flex-wrap gap-4 justify-between items-center bg-background-light dark:bg-background-dark p-4 rounded-lg">
              <div className="space-y-1">
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Setor Responsável</p>
                <p className="font-semibold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
                  <TeamOutlined /> {selectedAction.setorNome} ({selectedAction.setorSigla || '-'})
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-xs text-text-secondary-light">Situação</p>
                <Tag color={getStatusColorById(selectedAction.statusId)} className="m-0 text-sm py-1 px-3">
                  {getStatusDescription(selectedAction.statusId)}
                </Tag>
              </div>
            </div>

            {/* Cronograma e Progresso */}
            <div>
              <Divider orientation="left" className="!m-0 !mb-4"><ClockCircleOutlined /> Cronograma e Execução</Divider>
              <Row gutter={[24, 24]}>
                <Col span={12}>
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="Início">{formatDate(selectedAction.dataInicio)}</Descriptions.Item>
                    <Descriptions.Item label="Término">{formatDate(selectedAction.dataFim)}</Descriptions.Item>
                    <Descriptions.Item label="Última Atualização">{formatDate(selectedAction.dataUltimaAtualizacao)}</Descriptions.Item>
                    <Descriptions.Item label="Dias Restantes">
                      {getDaysLabel(selectedAction)}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={12}>
                  <div className="h-full flex flex-col justify-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Execução Física</span>
                      <span className="font-bold">{selectedAction.percentualConcluido}%</span>
                    </div>
                    <Progress percent={selectedAction.percentualConcluido} status="active" />
                    
                    <div className="flex justify-between mt-4 mb-2">
                      <Tooltip title={`Situação: ${selectedAction.situacaoCronograma}`}>
                        <span className="cursor-help border-b border-dotted border-gray-400">Progresso Esperado</span>
                      </Tooltip>
                      <span className="font-bold">{selectedAction.progressoEsperado}%</span>
                    </div>
                    <Progress percent={selectedAction.progressoEsperado} size="small" strokeColor="#faad14" />
                  </div>
                </Col>
              </Row>
            </div>

            {/* Estratégia */}
            <div>
              <Divider orientation="left" className="!m-0 !mb-4"><AimOutlined /> Alinhamento Estratégico</Divider>
              
              <div className="mb-4">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-500" /> Objetivos Estratégicos
                </h4>
                <List
                  size="small"
                  bordered
                  dataSource={selectedAction.objetivos}
                  renderItem={(item) => <List.Item>{item.nome}</List.Item>}
                  locale={{ emptyText: 'Nenhum objetivo vinculado' }}
                />
              </div>

              <div>
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <CheckCircleOutlined className="text-blue-500" /> Indicadores
                </h4>
                <List
                  size="small"
                  bordered
                  dataSource={selectedAction.indicadores}
                  renderItem={(item) => <List.Item>{item.nome}</List.Item>}
                  locale={{ emptyText: 'Nenhum indicador vinculado' }}
                />
              </div>
            </div>

            {/* Riscos */}
            <div>
              <Divider orientation="left" className="!m-0 !mb-4"><WarningOutlined /> Riscos</Divider>
              <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={selectedAction.riscos}
                renderItem={(item) => (
                  <List.Item>
                    <Card size="small" className="border-l-4 border-l-orange-500">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {item.descricao}
                        </span>
                        <div className="flex gap-2">
                          <Tag color={item.nivelRisco === 'Alto' ? 'red' : item.nivelRisco === 'Médio' ? 'orange' : 'blue'}>
                            {item.nivelRisco}
                          </Tag>
                          <Tag>{item.impacto}</Tag>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
                locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum risco mapeado" /> }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
