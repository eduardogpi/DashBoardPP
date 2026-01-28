'use client'

import { useState, useMemo } from 'react'
import { Card, Row, Col, Progress, Empty, Segmented, Button, Modal } from 'antd'
import { TrophyOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { getTop5SuperiorRanking, SuperiorRanking } from '../utils/data-service'
import { useFilters } from '../app/filter-context'

/**
 * Propriedades aceitas pelo card Top 5. Quando `selectedUnit` é definido,
 * o componente destaca a unidade correspondente e permite alternar a seleção.
 */
type Top5RankingCardProps = {
  selectedUnit?: string | null
  onSelectUnit?: (unit: string | null) => void
}

/**
 * Card Top5RankingCard
 * Mostra as unidades superiores em destaque, permitindo alternar entre execuções
 * concluídas ou atrasadas. Também disponibiliza um modal com o ranking completo e
 * emite seleções para filtragem cruzada com ActionsBySector.
 */
export default function Top5RankingCard({ selectedUnit = null, onSelectUnit }: Top5RankingCardProps) {
  const { filters } = useFilters()
  const [mode, setMode] = useState<'concluidas' | 'atrasadas'>('concluidas')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const ranking = getTop5SuperiorRanking(
    filters.setor,
    filters.period,
    filters.status,
    filters.objetivo,
    filters.risco,
    filters.indicador,
    mode
  )

  const fullRanking = useMemo(() => {
    return getTop5SuperiorRanking(
      filters.setor,
      filters.period,
      filters.status,
      filters.objetivo,
      filters.risco,
      filters.indicador,
      mode,
      true
    )
  }, [filters.setor, filters.period, filters.status, filters.objetivo, filters.risco, filters.indicador, mode])

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

  const handleSelectUnit = (unitName: string) => {
    if (!onSelectUnit) return
    onSelectUnit(selectedUnit === unitName ? null : unitName)
  }

  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <TrophyOutlined className="text-yellow-500" />
          <span className="font-bold uppercase text-sm">Top 5 Unidades Superiores</span>
        </div>
      }
      extra={
        <div className="flex items-center gap-2">
          <Segmented
            size="small"
            value={mode}
            options={[
              { label: 'Concluídas', value: 'concluidas' },
              { label: 'Em Atraso', value: 'atrasadas' }
            ]}
            onChange={(value) => setMode(value as 'concluidas' | 'atrasadas')}
          />
          <Button size="small" type="link" onClick={() => setIsModalOpen(true)}>
            Ver todas
          </Button>
        </div>
      }
      className="h-full"
    >
      <div className="space-y-4">
        {ranking.map((item, index) => (
          <RankingItem
            key={item.setorSuperiorNome}
            item={item}
            index={index}
            isSelected={selectedUnit === item.setorSuperiorNome}
            onSelect={handleSelectUnit}
          />
        ))}
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <TrophyOutlined className="text-yellow-500" />
            <span className="font-bold uppercase">Todas as Unidades Superiores</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Fechar
          </Button>
        ]}
        width={720}
      >
        {fullRanking.length === 0 ? (
          <Empty description="Nenhuma unidade encontrada." />
        ) : (
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {fullRanking.map((item, index) => (
              <RankingItem
                key={`${item.setorSuperiorNome}-${index}`}
                item={item}
                index={index}
                isSelected={selectedUnit === item.setorSuperiorNome}
                onSelect={(unit) => {
                  handleSelectUnit(unit)
                  setIsModalOpen(false)
                }}
              />
            ))}
          </div>
        )}
      </Modal>
    </Card>
  )
}

type RankingItemProps = {
  item: SuperiorRanking
  index: number
  isSelected: boolean
  onSelect: (unit: string) => void
}

/**
 * Item reutilizável que representa cada unidade superior no ranking.
 * Usado tanto no card quanto no modal para manter consistência visual.
 */
const RankingItem = ({ item, index, isSelected, onSelect }: RankingItemProps) => (
  <button
    type="button"
    aria-pressed={isSelected}
    onClick={() => onSelect(item.setorSuperiorNome)}
    className={`w-full text-left rounded-xl transition-all border p-3 ${
      isSelected
        ? 'border-primary bg-primary/5 shadow-md'
        : 'border-transparent hover:border-border-light hover:bg-gray-50 dark:hover:bg-gray-800'
    }`}
  >
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
    {isSelected && (
      <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">
        Filtrando lista de ações estratégicas
      </span>
    )}
  </button>
)
