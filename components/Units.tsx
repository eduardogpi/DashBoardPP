'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Badge, 
  Progress, 
  Empty, 
  Collapse, 
  Segmented, 
  Select,
  Tag,
  Alert,
  Button
} from 'antd'
import { 
  BankOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  CaretRightOutlined,
  ApartmentOutlined
} from '@ant-design/icons'
import { getUnitsPerformance, UnitPerformance, getStatusDescription } from '../utils/data-service'
import { useFilters } from '../app/filter-context'
import estruturaData from '../estrutura.json'

const { Panel } = Collapse

type EstruturaNode = {
  id: number
  nome: string
  sigla?: string | null
  idSuperior?: number | null
  superior?: string | null
  tipoEstruturaOrgNome?: string | null
}

const periodLabels: Record<'todos' | 'mes' | 'trimestre' | 'ano', string> = {
  todos: 'Todos os períodos',
  mes: 'Este mês',
  trimestre: 'Trimestre atual',
  ano: 'Ano corrente'
}

const findAncestorByType = (
  startNode: EstruturaNode | undefined,
  nodesMap: Map<number, EstruturaNode>,
  predicate: (node: EstruturaNode) => boolean
): EstruturaNode | null => {
  const visitedIds = new Set<number>()
  let current = startNode

  while (current && !visitedIds.has(current.id)) {
    if (predicate(current)) {
      return current
    }

    visitedIds.add(current.id)

    if (!current.idSuperior || current.idSuperior === current.id) {
      break
    }

    current = nodesMap.get(current.idSuperior)
  }

  return null
}

const resolveHierarchyLabels = (
  unit: UnitPerformance,
  nodesMap: Map<number, EstruturaNode>
) => {
  const unitNode = nodesMap.get(unit.id)
  const immediateParent = unitNode?.idSuperior && unitNode.idSuperior !== unitNode.id
    ? nodesMap.get(unitNode.idSuperior)
    : nodesMap.get(unit.setorSuperiorId) || unitNode

  const coordenadoriaNode = findAncestorByType(
    immediateParent,
    nodesMap,
    (node) => (node.tipoEstruturaOrgNome || '').toLowerCase().includes('coordena')
  )

  const superiorNode = findAncestorByType(
    immediateParent || unitNode,
    nodesMap,
    (node) => {
      const tipo = (node.tipoEstruturaOrgNome || '').toLowerCase()
      return (
        tipo.includes('gerência') ||
        tipo.includes('superintendência') ||
        tipo.includes('diretoria') ||
        tipo.includes('gabinete')
      )
    }
  )

  const superiorNome = superiorNode?.nome || unit.setorSuperiorNome || immediateParent?.nome || 'Outros'
  const coordenadoriaNome =
    coordenadoriaNode?.sigla ||
    coordenadoriaNode?.nome ||
    immediateParent?.nome ||
    unit.sigla ||
    'Sem coordenadoria'

  return {
    superiorNome,
    coordenadoriaNome
  }
}

type EnrichedUnit = UnitPerformance & {
  resolvedSuperior: string
  resolvedCoordenadoria: string
}

export default function Units() {
  const { filters } = useFilters()
  const [units, setUnits] = useState<UnitPerformance[]>([])
  const [mode, setMode] = useState<'grade' | 'cascata'>('grade')
  const [selectedSuperior, setSelectedSuperior] = useState<string>('todos')
  const [selectedCoordenadoria, setSelectedCoordenadoria] = useState<string>('todos')
  const [coordenadoriaHistory, setCoordenadoriaHistory] = useState<Record<string, string>>({})
  const [coordenadoriaWarning, setCoordenadoriaWarning] = useState<string | null>(null)

  useEffect(() => {
    setUnits(getUnitsPerformance(filters.setor, filters.period, filters.objetivo, filters.risco, filters.indicador))
  }, [filters.setor, filters.period, filters.objetivo, filters.risco, filters.indicador])

  const estruturaMap = useMemo(() => {
    const map = new Map<number, EstruturaNode>()
    ;(estruturaData as EstruturaNode[]).forEach(node => {
      map.set(node.id, node)
    })
    return map
  }, [])

  const enrichedUnits = useMemo<EnrichedUnit[]>(() => {
    return units.map(unit => {
      const { superiorNome, coordenadoriaNome } = resolveHierarchyLabels(unit, estruturaMap)
      return {
        ...unit,
        resolvedSuperior: superiorNome,
        resolvedCoordenadoria: coordenadoriaNome
      }
    })
  }, [units, estruturaMap])

  const filterTags = useMemo(() => {
    const tags: { label: string; value: string }[] = []

    if (filters.period !== 'todos') {
      tags.push({ label: 'Período', value: periodLabels[filters.period] })
    }

    if (filters.status !== 'todos') {
      const statusDesc = getStatusDescription(parseInt(filters.status, 10))
      tags.push({ label: 'Status', value: statusDesc })
    }

    if (filters.objetivo !== 'todos') {
      tags.push({ label: 'Objetivo', value: filters.objetivo })
    }

    if (filters.risco !== 'todos') {
      tags.push({ label: 'Risco', value: filters.risco })
    }

    if (filters.indicador !== 'todos') {
      tags.push({ label: 'Indicador', value: filters.indicador })
    }

    const setorValues = Array.isArray(filters.setor)
      ? filters.setor
      : filters.setor
        ? [filters.setor]
        : []

    const setorLabels = setorValues
      .filter(value => value && value !== 'todos')
      .map(value => {
        const id = parseInt(value, 10)
        const node = isNaN(id) ? undefined : estruturaMap.get(id)
        return node?.nome || value
      })

    if (setorLabels.length > 0) {
      tags.push({ label: 'Setores', value: setorLabels.join(', ') })
    }

    return tags
  }, [filters.period, filters.status, filters.objetivo, filters.risco, filters.indicador, filters.setor, estruturaMap])

  // Agrupar unidades por setor superior
  const groupedUnits = useMemo(() => {
    const grouped: Record<string, EnrichedUnit[]> = {}
    
    enrichedUnits.forEach(unit => {
      const superior = unit.resolvedSuperior || 'Outros'
      if (!grouped[superior]) {
        grouped[superior] = []
      }
      grouped[superior].push(unit)
    })
    
    return grouped
  }, [enrichedUnits])

  type CascadeEntry = {
    superior: string
    coordenadorias: [string, EnrichedUnit[]][]
  }

  const cascadeEntries: CascadeEntry[] = useMemo(() => {
    if (mode !== 'cascata') return []

    const map = new Map<string, Map<string, EnrichedUnit[]>>()

    enrichedUnits.forEach(unit => {
      const superior = unit.resolvedSuperior || 'Outros'
      const coordenadoria = unit.resolvedCoordenadoria || 'Sem identificação'

      if (!map.has(superior)) {
        map.set(superior, new Map())
      }

      const coordMap = map.get(superior)!
      if (!coordMap.has(coordenadoria)) {
        coordMap.set(coordenadoria, [])
      }

      coordMap.get(coordenadoria)!.push(unit)
    })

    return Array.from(map.entries()).map(([superior, coordMap]) => ({
      superior,
      coordenadorias: Array.from(coordMap.entries())
    }))
  }, [mode, enrichedUnits])

  const superiorOptions = useMemo(() => {
    if (mode !== 'cascata') return ['todos']
    const labels = Array.from(new Set(cascadeEntries.map(entry => entry.superior)))
    return ['todos', ...labels]
  }, [mode, cascadeEntries])

  const coordenadoriaOptions = useMemo(() => {
    if (mode !== 'cascata') return ['todos']

    if (selectedSuperior !== 'todos') {
      const entry = cascadeEntries.find(item => item.superior === selectedSuperior)
      const coords = entry ? entry.coordenadorias.map(([coordName]) => coordName) : []
      return ['todos', ...coords]
    }

    const allCoords = cascadeEntries.flatMap(entry => entry.coordenadorias.map(([coordName]) => coordName))
    return ['todos', ...Array.from(new Set(allCoords))]
  }, [mode, cascadeEntries, selectedSuperior])

  useEffect(() => {
    if (selectedSuperior !== 'todos' && selectedCoordenadoria !== 'todos') {
      setCoordenadoriaHistory(prev => {
        if (prev[selectedSuperior] === selectedCoordenadoria) return prev
        return { ...prev, [selectedSuperior]: selectedCoordenadoria }
      })
    }
  }, [selectedSuperior, selectedCoordenadoria])

  useEffect(() => {
    if (mode !== 'cascata') {
      setCoordenadoriaWarning(null)
      return
    }

    if (selectedSuperior === 'todos') {
      setCoordenadoriaWarning(null)
      return
    }

    const entry = cascadeEntries.find(item => item.superior === selectedSuperior)

    if (!entry) {
      if (selectedCoordenadoria !== 'todos') {
        setSelectedCoordenadoria('todos')
      }
      setCoordenadoriaWarning('A unidade superior selecionada não possui coordenadorias mapeadas.')
      return
    }

    if (entry.coordenadorias.length === 0) {
      if (selectedCoordenadoria !== 'todos') {
        setSelectedCoordenadoria('todos')
      }
      setCoordenadoriaWarning('Não há coordenadorias registradas para esta unidade superior.')
      return
    }

    const stored = coordenadoriaHistory[selectedSuperior]
    if (
      selectedCoordenadoria === 'todos' &&
      stored &&
      entry.coordenadorias.some(([coordName]) => coordName === stored)
    ) {
      setSelectedCoordenadoria(stored)
      setCoordenadoriaWarning(null)
      return
    }

    if (
      selectedCoordenadoria !== 'todos' &&
      !entry.coordenadorias.some(([coordName]) => coordName === selectedCoordenadoria)
    ) {
      setSelectedCoordenadoria('todos')
      setCoordenadoriaWarning('A coordenadoria selecionada não pertence à unidade superior atual.')
      return
    }

    setCoordenadoriaWarning(null)
  }, [mode, selectedSuperior, selectedCoordenadoria, cascadeEntries, coordenadoriaHistory])

  const filteredCascade = useMemo(() => {
    if (mode !== 'cascata') return []

    const supFiltered = selectedSuperior === 'todos'
      ? cascadeEntries
      : cascadeEntries.filter(entry => entry.superior === selectedSuperior)

    return supFiltered
      .map(entry => ({
        superior: entry.superior,
        coordenadorias:
          selectedCoordenadoria === 'todos'
            ? entry.coordenadorias
            : entry.coordenadorias.filter(([coordName]) => coordName === selectedCoordenadoria)
      }))
      .filter(entry => entry.coordenadorias.length > 0)
  }, [mode, cascadeEntries, selectedSuperior, selectedCoordenadoria])

  const groupedEntries = useMemo(() => {
    return Object.entries(groupedUnits).filter(([, list]) => list.length > 0)
  }, [groupedUnits])

  const handleSuperiorChange = (value: string) => {
    setSelectedSuperior(value)
    if (value === 'todos') {
      setSelectedCoordenadoria('todos')
    }
  }

  const handleCoordenadoriaChange = (value: string) => {
    setSelectedCoordenadoria(value)
  }

  const resetCascadeFilters = () => {
    setSelectedSuperior('todos')
    setSelectedCoordenadoria('todos')
    setCoordenadoriaWarning(null)
  }

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
              <BankOutlined className="text-primary text-lg" role="img" aria-label="Ícone da unidade" />
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
                  <WarningOutlined role="img" aria-label="Ações atrasadas" /> Atrasadas
                </span>
              </div>
            </Col>
            <Col span={12}>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-green-500">
                  {unit.acoesConcluidas}
                </span>
                <span className="text-[10px] uppercase text-text-secondary-light flex items-center gap-1">
                  <CheckCircleOutlined role="img" aria-label="Ações concluídas" /> Concluídas
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

      {filterTags.length > 0 && (
        <Card className="mb-6 border border-dashed border-border-light dark:border-border-dark bg-background-light/60 dark:bg-card-dark/60">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
              Filtros ativos do painel
            </span>
            <div className="flex flex-wrap gap-2">
              {filterTags.map(({ label, value }) => (
                <Tag key={`${label}-${value}`} color="blue" className="rounded-full px-3 py-1 text-xs">
                  <span className="font-semibold">{label}:</span> {value}
                </Tag>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <Segmented
          value={mode}
          onChange={(val) => {
            setMode(val as 'grade' | 'cascata')
          }}
          options={[
            { label: 'Visão em Grade', value: 'grade' },
            { label: 'Visão em Cascata', value: 'cascata' }
          ]}
        />

        {mode === 'cascata' && (
          <div className="flex flex-col lg:flex-row gap-3 w-full">
            <Select
              value={selectedSuperior}
              onChange={handleSuperiorChange}
              options={superiorOptions.map(option => ({
                label: option === 'todos' ? 'Todos os superiores' : option,
                value: option
              }))}
              placeholder="Selecione uma unidade superior"
              className="flex-1"
            />
            <Select
              value={selectedCoordenadoria}
              onChange={handleCoordenadoriaChange}
              options={coordenadoriaOptions.map(option => ({
                label: option === 'todos' ? 'Todas as coordenadorias' : option,
                value: option
              }))}
              placeholder="Selecione uma coordenadoria"
              className="flex-1"
            />
            <Button onClick={resetCascadeFilters} size="small" className="shrink-0">
              Limpar seleção
            </Button>
          </div>
        )}
      </div>

      {coordenadoriaWarning && mode === 'cascata' && (
        <Alert
          type="warning"
          message={coordenadoriaWarning}
          showIcon
          className="mb-4"
        />
      )}

      {enrichedUnits.length === 0 ? (
        <Card>
          <Empty description="Nenhuma unidade com ações registradas." />
        </Card>
      ) : mode === 'grade' ? (
        groupedEntries.length === 0 ? (
          <Card>
            <Empty description="Nenhuma unidade agrupada para os filtros atuais." />
          </Card>
        ) : (
          <Collapse 
            defaultActiveKey={groupedEntries.map(([superiorName]) => superiorName)}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            className="bg-transparent border-none"
          >
            {groupedEntries.map(([superiorName, groupUnits]) => (
              <Panel 
                key={superiorName} 
                header={
                  <div className="flex items-center gap-2 py-1">
                    <ApartmentOutlined className="text-primary text-lg" role="img" aria-label="Ícone de unidade superior" />
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
        )
      ) : (
        <div className="space-y-6">
          {filteredCascade.length === 0 ? (
            <Card>
              <Empty description="Nenhuma coordenadoria encontrada para os filtros selecionados." />
            </Card>
          ) : (
            filteredCascade.map(({ superior: superiorName, coordenadorias }) => (
              <Card key={superiorName} className="border border-border-light dark:border-border-dark">
                <div className="flex items-center gap-3 mb-4">
                  <ApartmentOutlined className="text-primary text-xl" role="img" aria-label="Ícone de unidade superior" />
                  <div>
                    <p className="text-xs uppercase text-text-secondary-light dark:text-text-secondary-dark">Unidade Superior</p>
                    <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">{superiorName}</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  {coordenadorias.map(([coordName, coordUnits]) => (
                    <div key={coordName} className="border border-dashed border-border-light dark:border-border-dark rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[10px] uppercase text-text-secondary-light dark:text-text-secondary-dark">Coordenadoria</p>
                          <h4 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">{coordName}</h4>
                        </div>
                        <Badge count={coordUnits.length} style={{ backgroundColor: '#1d4ed8' }} />
                      </div>

                      <Row gutter={[16, 16]}>
                        {coordUnits.map(renderUnitCard)}
                      </Row>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
