import dadosDashboard from '../response_1768849010110.json'
import estrutura from '../estrutura.json'
import configuracoes from '../configuracoes.json'

// Interfaces baseadas no resposta.json
export interface Risco {
  id: number
  descricao: string
  nivelRisco: string
  impacto: string
}

export interface Indicador {
  id: number
  nome: string
}

export interface Objetivo {
  id: number
  nome: string
}

export interface Acao {
  id: number
  nome: string
  statusId: number
  dataInicio: string
  dataFim: string
  dataUltimaAtualizacao: string
  percentualConcluido: number
  progressoEsperado: number
  situacaoCronograma: string
  diasTotais: number
  diasDecorridos: number
  diasRestantes: number
  setorId: number
  setorNome: string
  setorSigla: string
  setorSuperiorId: number
  setorSuperiorNome: string
  objetivos: Objetivo[]
  indicadores: Indicador[]
  riscos: Risco[]
}

export interface DashboardData {
  totalAcoes: number
  totalCanceladas: number
  totalConcluidas: number
  totalCriadas: number
  totalEmProgresso: number
  totalEmAtrasoStatus: number
  totalSobrestadas: number
  totalAguardandoPrazo: number
  totalAcoesAdiantadas: number
  totalAcoesNoPrazo: number
  totalAcoesAtrasadasCronograma: number
  totalObjetivosEstrategicos: number
  totalObjetivosCumpridos: number
  totalIndicadores: number
  totalRiscos: number
  acoes: Acao[]
}

// Cast do JSON para o tipo correto
const rawData = dadosDashboard as DashboardData

export const getStatusDescription = (statusId: number): string => {
  const status = configuracoes.statusIds.find(s => s.id === statusId)
  return status ? status.descricao : 'Desconhecido'
}

export const getStatusColorById = (statusId: number): string => {
  switch (statusId) {
    case 2: return 'success' // Concluído
    case 4: return 'processing' // Em Progresso
    case 5: return 'error' // Em Atraso
    case 1: return 'default' // Cancelado
    case 6: return 'warning' // Sobrestado
    case 3: return 'default' // Criado
    case 7: return 'warning' // Aguardando Prazo
    default: return 'default'
  }
}

// Helper para datas
const getDateRange = (period: string) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  let start: Date, end: Date

  switch (period) {
    case 'mes':
      start = new Date(year, month, 1)
      end = new Date(year, month + 1, 0) 
      break
    case 'trimestre':
      const quarter = Math.floor(month / 3)
      start = new Date(year, quarter * 3, 1)
      end = new Date(year, (quarter + 1) * 3, 0)
      break
    case 'ano':
      start = new Date(year, 0, 1)
      end = new Date(year, 11, 31)
      break
    default:
      return null
  }
  return { start, end }
}

// Helper para filtrar ações
const getFilteredActions = (filterSetor?: string | string[], period?: string, filterObjetivo?: string, filterRisco?: string) => {
  let actions = rawData.acoes
  
  if (filterSetor && filterSetor !== 'todos' && filterSetor.length > 0) {
    const selectedIds = (Array.isArray(filterSetor) ? filterSetor : [filterSetor])
      .map(id => parseInt(id))
      .filter(id => !isNaN(id))
      
    if (selectedIds.length > 0) {
      const allowedIds = getAllDescendants(selectedIds)
      actions = actions.filter(acao => allowedIds.has(acao.setorId))
    }
  }

  if (period && period !== 'todos') {
    const range = getDateRange(period)
    if (range) {
      actions = actions.filter(acao => {
        if (!acao.dataInicio || !acao.dataFim) return false
        const acaoStart = new Date(acao.dataInicio)
        const acaoEnd = new Date(acao.dataFim)
        
        return acaoStart <= range.end && acaoEnd >= range.start
      })
    }
  }

  if (filterObjetivo && filterObjetivo !== 'todos') {
    actions = actions.filter(a => a.objetivos.some(obj => obj.nome === filterObjetivo))
  }

  if (filterRisco && filterRisco !== 'todos') {
    actions = actions.filter(a => a.riscos.some(risco => risco.descricao === filterRisco))
  }

  return actions
}

export const getDashboardTotals = (filterSetor?: string | string[], period?: string, filterStatus?: string, filterObjetivo?: string, filterRisco?: string) => {
  let actions = getFilteredActions(filterSetor, period, filterObjetivo, filterRisco)

  if (filterStatus && filterStatus !== 'todos') {
    const statusId = parseInt(filterStatus)
    if (!isNaN(statusId)) {
      actions = actions.filter(a => a.statusId === statusId)
    }
  }
  
  // Contadores baseados no ID do status
  let total = 0
  let porStatus: Record<number, number> = {}
  
  // Inicializar contadores
  configuracoes.statusIds.forEach(s => porStatus[s.id] = 0)
  
  let riscos = 0

  actions.forEach(a => {
    total++
    if (porStatus[a.statusId] !== undefined) {
      porStatus[a.statusId]++
    }
    riscos += a.riscos.length
  })

  return {
    total,
    canceladas: porStatus[1] || 0,
    concluidas: porStatus[2] || 0,
    criadas: porStatus[3] || 0,
    emProgresso: porStatus[4] || 0,
    emAtraso: porStatus[5] || 0,
    sobrestadas: porStatus[6] || 0,
    aguardandoPrazo: porStatus[7] || 0,
    riscos
  }
}

export const getActionsList = (filterSetor?: string | string[], filterStatus?: string, period?: string, filterObjetivo?: string, filterRisco?: string) => {
  let filteredActions = getFilteredActions(filterSetor, period, filterObjetivo, filterRisco)

  // Nota: filterStatus aqui provavelmente vinha do dropdown de situacaoCronograma ou algo similar.
  // Se quisermos filtrar por statusId no futuro, precisaremos adaptar. 
  // Por enquanto, mantemos a lógica antiga se o filtro for string, mas se for número (ID), filtramos por statusId.
  // O componente GlobalFilters passava 'todos' ou valores de situacaoCronograma? 
  // Vamos verificar o uso, mas por segurança, se filterStatus for numérico em string, usamos statusId.
  
  if (filterStatus && filterStatus !== 'todos') {
    // Tenta verificar se é um status de cronograma antigo (legado)
    const isCronogramaStatus = ['ATRASADA', 'NO_PRAZO', 'ADIANTADA'].includes(filterStatus.toUpperCase())
    
    if (isCronogramaStatus) {
       filteredActions = filteredActions.filter(a => a.situacaoCronograma.toUpperCase() === filterStatus.toUpperCase())
    } else {
       // Filtra pelo ID do status
       const statusId = parseInt(filterStatus)
       if (!isNaN(statusId)) {
         filteredActions = filteredActions.filter(a => a.statusId === statusId)
       }
    }
  }

  return filteredActions
}

export const getChartData = (filterSetor?: string | string[], period?: string, filterStatus?: string, filterObjetivo?: string, filterRisco?: string) => {
  let actions = getFilteredActions(filterSetor, period, filterObjetivo, filterRisco)

  if (filterStatus && filterStatus !== 'todos') {
    const statusId = parseInt(filterStatus)
    if (!isNaN(statusId)) {
      actions = actions.filter(a => a.statusId === statusId)
    }
  }
  
  // Agrupar por statusId
  const counts = new Map<number, number>()
  configuracoes.statusIds.forEach(s => counts.set(s.id, 0))

  actions.forEach(acao => {
    const current = counts.get(acao.statusId) || 0
    counts.set(acao.statusId, current + 1)
  })

  // Preparar arrays para o gráfico
  const labels: string[] = []
  const series: number[] = []
  const colors: string[] = []

  configuracoes.statusIds.forEach(s => {
    // Só incluir no gráfico se tiver algum valor > 0 ou incluir todos?
    // Vamos incluir todos para consistência de cores
    labels.push(s.descricao)
    series.push(counts.get(s.id) || 0)
    
    // Cores fixas mapeadas
    switch (s.id) {
      case 1: colors.push('#94a3b8'); break; // Cancelado - Cinza
      case 2: colors.push('#22c55e'); break; // Concluído - Verde
      case 3: colors.push('#60a5fa'); break; // Criado - Azul claro
      case 4: colors.push('#3b82f6'); break; // Em Progresso - Azul
      case 5: colors.push('#ef4444'); break; // Em Atraso - Vermelho
      case 6: colors.push('#f59e0b'); break; // Sobrestado - Laranja
      case 7: colors.push('#a855f7'); break; // Aguardando Prazo - Roxo
      default: colors.push('#cbd5e1');
    }
  })

  return {
    series,
    labels,
    colors
  }
}

export const getRisksSummary = (filterSetor?: string | string[], period?: string, filterStatus?: string, filterObjetivo?: string, filterRisco?: string) => {
  let actions = getFilteredActions(filterSetor, period, filterObjetivo, filterRisco)

  if (filterStatus && filterStatus !== 'todos') {
    const statusId = parseInt(filterStatus)
    if (!isNaN(statusId)) {
      actions = actions.filter(a => a.statusId === statusId)
    }
  }
  
  const nivelCounts = { Alto: 0, Médio: 0, Baixo: 0 }
  
  actions.forEach(acao => {
    acao.riscos.forEach(risco => {
      if (risco.nivelRisco in nivelCounts) {
        nivelCounts[risco.nivelRisco as keyof typeof nivelCounts]++
      }
    })
  })

  return {
    series: [nivelCounts.Alto, nivelCounts.Médio, nivelCounts.Baixo],
    labels: ['Alto', 'Médio', 'Baixo'],
    colors: ['#ef4444', '#f59e0b', '#3b82f6']
  }
}

export interface UnitPerformance {
  id: number
  nome: string
  sigla: string
  setorSuperiorId: number
  setorSuperiorNome: string
  totalAcoes: number
  acoesAtrasadas: number
  acoesConcluidas: number
  acoesEmAndamento: number
  mediaProgresso: number
}

const getHierarchyMap = () => {
  const childrenMap = new Map<number, number[]>()
  estrutura.forEach(unit => {
    if (unit.idSuperior && unit.idSuperior !== unit.id) {
      if (!childrenMap.has(unit.idSuperior)) {
        childrenMap.set(unit.idSuperior, [])
      }
      childrenMap.get(unit.idSuperior)?.push(unit.id)
    }
  })
  return childrenMap
}

const hierarchyMap = getHierarchyMap()

const getAllDescendants = (startIds: number[]): Set<number> => {
  const result = new Set<number>(startIds)
  const queue = [...startIds]

  while (queue.length > 0) {
    const current = queue.pop()!
    const children = hierarchyMap.get(current)
    if (children) {
      children.forEach(childId => {
        if (!result.has(childId)) {
          result.add(childId)
          queue.push(childId)
        }
      })
    }
  }
  return result
}

export const getUnitsPerformance = (filterSetor?: string | string[], period?: string, filterObjetivo?: string, filterRisco?: string) => {
  const unitsMap = new Map<number, UnitPerformance>()
  
  const actions = getFilteredActions(filterSetor, period, filterObjetivo, filterRisco)

  actions.forEach(acao => {
    if (!unitsMap.has(acao.setorId)) {
      unitsMap.set(acao.setorId, {
        id: acao.setorId,
        nome: acao.setorNome,
        sigla: acao.setorSigla,
        setorSuperiorId: acao.setorSuperiorId,
        setorSuperiorNome: acao.setorSuperiorNome,
        totalAcoes: 0,
        acoesAtrasadas: 0,
        acoesConcluidas: 0,
        acoesEmAndamento: 0,
        mediaProgresso: 0
      })
    }

    const unit = unitsMap.get(acao.setorId)!
    unit.totalAcoes++
    unit.mediaProgresso += acao.percentualConcluido
    
    if (acao.situacaoCronograma === 'ATRASADA') unit.acoesAtrasadas++
    if (acao.percentualConcluido >= 100) unit.acoesConcluidas++
    else if (acao.percentualConcluido > 0) unit.acoesEmAndamento++
  })

  // Calcular médias finais
  return Array.from(unitsMap.values()).map(unit => ({
    ...unit,
    mediaProgresso: Math.round(unit.mediaProgresso / unit.totalAcoes)
  })).sort((a, b) => b.totalAcoes - a.totalAcoes)
}

export interface SuperiorRanking {
  setorSuperiorNome: string
  totalConcluidas: number
  totalAtrasadas: number
  totalAcoes: number
}

export const getTop5SuperiorRanking = (filterSetor?: string | string[], period?: string, filterStatus?: string, filterObjetivo?: string, filterRisco?: string) => {
  let actions = getFilteredActions(filterSetor, period, filterObjetivo, filterRisco)

  if (filterStatus && filterStatus !== 'todos') {
    const statusId = parseInt(filterStatus)
    if (!isNaN(statusId)) {
      actions = actions.filter(a => a.statusId === statusId)
    }
  }

  const superiorMap = new Map<string, { concluidas: number; atrasadas: number; total: number }>()

  actions.forEach(acao => {
    const superior = acao.setorSuperiorNome || 'Outros'
    
    if (!superiorMap.has(superior)) {
      superiorMap.set(superior, { concluidas: 0, atrasadas: 0, total: 0 })
    }

    const stats = superiorMap.get(superior)!
    stats.total++
    
    if (acao.statusId === 2) { // Concluído
      stats.concluidas++
    } else if (acao.statusId === 5) { // Em Atraso
      stats.atrasadas++
    }
  })

  const ranking = Array.from(superiorMap.entries())
    .map(([nome, stats]) => ({
      setorSuperiorNome: nome,
      totalConcluidas: stats.concluidas,
      totalAtrasadas: stats.atrasadas,
      totalAcoes: stats.total
    }))
    .sort((a, b) => b.totalConcluidas - a.totalConcluidas)
    .slice(0, 5)

  return ranking
}
