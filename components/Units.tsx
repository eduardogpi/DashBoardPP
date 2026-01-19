'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, Row, Col, Badge, Progress, Empty, Collapse } from 'antd'
import { 
  BankOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  CaretRightOutlined,
  ApartmentOutlined
} from '@ant-design/icons'
import { getUnitsPerformance, UnitPerformance } from '../utils/data-service'
import { useFilters } from '../app/filter-context'

const { Panel } = Collapse

export default function Units() {
  const { filters } = useFilters()
  const [units, setUnits] = useState<UnitPerformance[]>([])

  useEffect(() => {
    setUnits(getUnitsPerformance(filters.setor, filters.period))
  }, [filters.setor, filters.period])

  // Agrupar unidades por setor superior
  const groupedUnits = useMemo(() => {
    const grouped: Record<string, UnitPerformance[]> = {}
    
    units.forEach(unit => {
      const superior = unit.setorSuperiorNome || 'Outros'
      if (!grouped[superior]) {
        grouped[superior] = []
      }
      grouped[superior].push(unit)
    })
    
    return grouped
  }, [units])

  const renderUnitCard = (unit: UnitPerformance) => (
    <Col xs={24} md={12} lg={8} key={unit.id}>
      <Card 
        className="hover:shadow-lg transition-all duration-300 h-full border-t-4"
        style={{ 
          borderTopColor: unit.acoesAtrasadas > 0 ? '#ff4d4f' : '#52c41a' 
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 min-w-[2.5rem] rounded-xl bg-primary/10 flex items-center justify-center">
              <BankOutlined className="text-primary text-lg" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark truncate" title={unit.nome}>
                {unit.sigla}
              </h3>
              <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark truncate" title={unit.nome}>
                {unit.nome}
              </p>
            </div>
          </div>
          <Badge 
            count={unit.totalAcoes} 
            overflowCount={99} 
            style={{ backgroundColor: '#1890ff' }} 
            title="Total de Ações"
          />
        </div>

        <div className="space-y-4">
          {/* Progresso Médio */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Progresso Médio</span>
              <span className="text-xs font-bold">{unit.mediaProgresso}%</span>
            </div>
            <Progress percent={unit.mediaProgresso} showInfo={false} size="small" />
          </div>

          {/* Métricas Detalhadas */}
          <Row gutter={8} className="bg-background-light dark:bg-background-dark p-3 rounded-lg">
            <Col span={12} className="border-r border-border-light dark:border-border-dark">
              <div className="flex flex-col items-center">
                <span className={`text-lg font-bold ${unit.acoesAtrasadas > 0 ? 'text-red-500' : 'text-text-muted-light'}`}>
                  {unit.acoesAtrasadas}
                </span>
                <span className="text-[10px] uppercase text-text-secondary-light flex items-center gap-1">
                  <WarningOutlined /> Atrasadas
                </span>
              </div>
            </Col>
            <Col span={12}>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-green-500">
                  {unit.acoesConcluidas}
                </span>
                <span className="text-[10px] uppercase text-text-secondary-light flex items-center gap-1">
                  <CheckCircleOutlined /> Concluídas
                </span>
              </div>
            </Col>
          </Row>

          <div className="text-center pt-2">
            <span className="text-xs text-text-muted-light">
              {unit.acoesEmAndamento} ações em andamento
            </span>
          </div>
        </div>
      </Card>
    </Col>
  )

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6">
        Desempenho por Unidade
      </h2>

      {units.length === 0 ? (
        <Card>
          <Empty description="Nenhuma unidade com ações registradas." />
        </Card>
      ) : (
        <Collapse 
          defaultActiveKey={Object.keys(groupedUnits)} // Abre todos por padrão ou vazio
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          className="bg-transparent border-none"
        >
          {Object.entries(groupedUnits).map(([superiorName, groupUnits]) => (
            <Panel 
              key={superiorName} 
              header={
                <div className="flex items-center gap-2 py-1">
                  <ApartmentOutlined className="text-primary text-lg" />
                  <span className="text-base font-bold text-text-primary-light dark:text-text-primary-dark uppercase">
                    {superiorName}
                  </span>
                  <Badge 
                    count={groupUnits.length} 
                    className="ml-2"
                    style={{ backgroundColor: '#f5f5f5', color: '#666', boxShadow: 'none' }}
                  />
                </div>
              }
              className="mb-4 bg-white dark:bg-card-dark rounded-lg border-2 border-border-light dark:border-gray-600 overflow-hidden"
            >
              <Row gutter={[16, 16]}>
                {groupUnits.map(renderUnitCard)}
              </Row>
            </Panel>
          ))}
        </Collapse>
      )}
    </div>
  )
}
