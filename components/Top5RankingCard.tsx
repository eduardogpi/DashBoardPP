'use client'

import { Card, Row, Col, Progress, Empty } from 'antd'
import { TrophyOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { getTop5SuperiorRanking, SuperiorRanking } from '../utils/data-service'
import { useFilters } from '../app/filter-context'

export default function Top5RankingCard() {
  const { filters } = useFilters()
  const ranking = getTop5SuperiorRanking(filters.setor, filters.period, filters.status, filters.objetivo, filters.risco, filters.indicador)

  if (ranking.length === 0) {
    return (
      <Card 
        title={
          <div className="flex items-center gap-2">
            <TrophyOutlined className="text-yellow-500" />
            <span className="font-bold uppercase text-sm">Top 5 Unidades Superiores</span>
          </div>
        }
        className="h-full"
      >
        <Empty description="Nenhuma unidade encontrada para os filtros selecionados." />
      </Card>
    )
  }

  const maxConcluidas = Math.max(...ranking.map(r => r.totalConcluidas))

  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <TrophyOutlined className="text-yellow-500" />
          <span className="font-bold uppercase text-sm">Top 5 Unidades Superiores</span>
        </div>
      }
      extra={<span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Concluídas vs Atrasadas</span>}
      className="h-full"
    >
      <div className="space-y-4">
        {ranking.map((item, index) => (
          <div key={item.setorSuperiorNome} className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                index === 0 ? 'bg-yellow-500 text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                index === 2 ? 'bg-orange-400 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark truncate" title={item.setorSuperiorNome}>
                    {item.setorSuperiorNome}
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-green-500">
                      <CheckCircleOutlined /> {item.totalConcluidas}
                    </span>
                    <span className="flex items-center gap-1 text-red-500">
                      <WarningOutlined /> {item.totalAtrasadas}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-green-500 w-12">Concluídas</span>
                    <Progress 
                      percent={item.totalAcoes > 0 ? (item.totalConcluidas / item.totalAcoes) * 100 : 0}
                      showInfo={false}
                      size="small"
                      strokeColor="#22c55e"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-red-500 w-12">Atrasadas</span>
                    <Progress 
                      percent={item.totalAcoes > 0 ? (item.totalAtrasadas / item.totalAcoes) * 100 : 0}
                      showInfo={false}
                      size="small"
                      strokeColor="#ef4444"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-2">
                  <span>Total: {item.totalAcoes} ações</span>
                  <span>{item.totalConcluidas} concluídas • {item.totalAtrasadas} atrasadas</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
