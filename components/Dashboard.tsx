'use client'

import { useState, useEffect } from 'react'
import { Row, Col, Card, Badge, Space, Alert } from 'antd'
import { 
  FileTextOutlined, 
  SyncOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  FilterOutlined,
  AlertOutlined
} from '@ant-design/icons'
import GlobalFilters from './GlobalFilters'
import ActionsBySector from './ActionsBySector'
import StatusChart from './StatusChart'
import Top5RankingCard from './Top5RankingCard'
import Top5RecentUpdates from './Top5RecentUpdates'
import { getDashboardTotals, getChartData, getRisksSummary } from '../utils/data-service'
import { useFilters } from '../app/filter-context'

export default function Dashboard() {
  const { filters } = useFilters()
  const [selectedTopSuperior, setSelectedTopSuperior] = useState<string | null>(null)
  const [kpiData, setKpiData] = useState({
    total: 0,
    emProgresso: 0,
    concluidas: 0,
    canceladas: 0,
    criadas: 0,
    emAtraso: 0,
    sobrestadas: 0,
    aguardandoPrazo: 0
  })

  const [chartData, setChartData] = useState({
    series: [0, 0, 0, 0, 0, 0, 0],
    labels: ['Cancelado', 'Concluído', 'Criado', 'Em Progresso', 'Em Atraso', 'Sobrestado', 'Aguardando Prazo'],
    colors: ['#94a3b8', '#22c55e', '#60a5fa', '#3b82f6', '#ef4444', '#f59e0b', '#a855f7']
  })

  const [risksData, setRisksData] = useState({
    series: [0, 0, 0],
    labels: ['Alto', 'Médio', 'Baixo'],
    colors: ['#ef4444', '#f59e0b', '#3b82f6']
  })

  useEffect(() => {
    // Carregar dados com filtro
    const totals = getDashboardTotals(
      filters.setor,
      filters.period,
      filters.status,
      filters.objetivo,
      filters.risco,
      filters.indicador
    )
    setKpiData({
      total: totals.total,
      emProgresso: totals.emProgresso,
      concluidas: totals.concluidas,
      canceladas: totals.canceladas,
      criadas: totals.criadas,
      emAtraso: totals.emAtraso,
      sobrestadas: totals.sobrestadas,
      aguardandoPrazo: totals.aguardandoPrazo
    })

    const charts = getChartData(
      filters.setor,
      filters.period,
      filters.status,
      filters.objetivo,
      filters.risco,
      filters.indicador
    )
    setChartData(charts)

    const risks = getRisksSummary(
      filters.setor,
      filters.period,
      filters.status,
      filters.objetivo,
      filters.risco,
      filters.indicador
    )
    setRisksData(risks)
  }, [filters.setor, filters.period, filters.status, filters.objetivo, filters.risco, filters.indicador])

  return (
    <div className="space-y-6">
      <GlobalFilters />

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6} lg={3}>
          <Card className="h-full hover:shadow-lg transition-shadow bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900">
            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{kpiData.total}</span>
              <span className="text-xs text-blue-600/80 dark:text-blue-400/80 uppercase font-bold mt-1">Total</span>
            </div>
          </Card>
        </Col>
        
        <Col xs={12} md={6} lg={3}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-2xl font-bold text-green-500">{kpiData.concluidas}</span>
              <span className="text-xs text-text-secondary-light uppercase font-bold mt-1">Concluídas</span>
            </div>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-2xl font-bold text-blue-500">{kpiData.emProgresso}</span>
              <span className="text-xs text-text-secondary-light uppercase font-bold mt-1">Em Progresso</span>
            </div>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-2xl font-bold text-red-500">{kpiData.emAtraso}</span>
              <span className="text-xs text-text-secondary-light uppercase font-bold mt-1">Em Atraso</span>
            </div>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-2xl font-bold text-purple-500">{kpiData.aguardandoPrazo}</span>
              <span className="text-xs text-text-secondary-light uppercase font-bold mt-1">Ag. Prazo</span>
            </div>
          </Card>
        </Col>
        
        <Col xs={12} md={6} lg={3}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-2xl font-bold text-orange-500">{kpiData.sobrestadas}</span>
              <span className="text-xs text-text-secondary-light uppercase font-bold mt-1">Sobrestadas</span>
            </div>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-2xl font-bold text-blue-300">{kpiData.criadas}</span>
              <span className="text-xs text-text-secondary-light uppercase font-bold mt-1">Criadas</span>
            </div>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-2xl font-bold text-gray-400">{kpiData.canceladas}</span>
              <span className="text-xs text-text-secondary-light uppercase font-bold mt-1">Canceladas</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <FilterOutlined />
                <span className="font-bold uppercase text-sm">Status das Ações</span>
              </Space>
            }
            className="h-full"
          >
            <StatusChart series={chartData.series} labels={chartData.labels} colors={chartData.colors} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <AlertOutlined />
                <span className="font-bold uppercase text-sm">Monitoramento de Riscos</span>
              </Space>
            }
            extra={<span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Nível de Risco</span>}
            className="h-full"
          >
             <StatusChart series={risksData.series} labels={risksData.labels} colors={risksData.colors} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Top5RankingCard 
            selectedUnit={selectedTopSuperior}
            onSelectUnit={setSelectedTopSuperior}
          />
        </Col>
        <Col xs={24} lg={12}>
          <Top5RecentUpdates />
        </Col>
      </Row>

      {selectedTopSuperior && (
        <Alert 
          type="info"
          showIcon
          message={`Filtrando ações estratégicas para a unidade superior: ${selectedTopSuperior}`}
          className="mt-2"
        />
      )}

      <ActionsBySector filterSuperior={selectedTopSuperior} />
    </div>
  )
}
