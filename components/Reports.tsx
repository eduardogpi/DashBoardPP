"use client"

import { ReactNode, useMemo, useState } from 'react'
import { Card, Button } from 'antd'
import {
  FilePdfOutlined,
  DownloadOutlined,
  PieChartOutlined,
  TableOutlined,
  AlertOutlined
} from '@ant-design/icons'
import jsPDF from 'jspdf'
import autoTable, { RowInput } from 'jspdf-autotable'
import { useFilters } from '../app/filter-context'
import {
  getDashboardTotals,
  getActionsList,
  getRisksSummary,
  getStatusDescription,
  getStatusIdByDescription,
  Acao
} from '../utils/data-service'

type ReportSection = {
  title: string
  description?: string
  table?: {
    headers: string[]
    rows: RowInput[]
  }
}

type Report = {
  id: number
  title: string
  description: string
  icon: ReactNode
  date: string
  fileName: string
  sections: ReportSection[]
}

const getTopSectorsTable = (actions: Acao[]) => {
  const concluidoId = getStatusIdByDescription('Concluído')
  const atrasadoId = getStatusIdByDescription('Em Atraso')
  const map = new Map<string, { total: number; concluidas: number; atrasadas: number }>()

  actions.forEach((acao) => {
    const key = acao.setorSuperiorNome || acao.setorNome || 'Outros'
    if (!map.has(key)) {
      map.set(key, { total: 0, concluidas: 0, atrasadas: 0 })
    }

    const stats = map.get(key)!
    stats.total += 1
    if (concluidoId && acao.statusId === concluidoId) stats.concluidas += 1
    if (atrasadoId && acao.statusId === atrasadoId) stats.atrasadas += 1
  })

  const rows = Array.from(map.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([nome, stats]) => [nome, stats.total, stats.concluidas, stats.atrasadas])

  return {
    headers: ['Setor / Unidade', 'Total', 'Concluídas', 'Em atraso'],
    rows: rows.length ? (rows as RowInput[]) : [['Sem registros', '-', '-', '-']]
  }
}

const getActionHighlightsTable = (actions: Acao[]) => {
  const rows = actions.slice(0, 5).map((acao) => [
    acao.nome,
    acao.setorSigla || acao.setorNome,
    getStatusDescription(acao.statusId),
    `${Math.round(acao.percentualConcluido)}%`
  ])

  return {
    headers: ['Ação', 'Setor', 'Status', 'Execução'],
    rows: rows.length ? (rows as RowInput[]) : [['Sem ações listadas', '-', '-', '-']]
  }
}

const getDelayedActionsTable = (actions: Acao[]) => {
  const atrasadoId = getStatusIdByDescription('Em Atraso')
  const rows = actions
    .filter((acao) => atrasadoId ? acao.statusId === atrasadoId : false)
    .slice(0, 5)
    .map((acao) => [acao.nome, acao.dataFim, acao.setorSigla || acao.setorNome])

  return {
    headers: ['Ação em atraso', 'Prazo previsto', 'Setor responsável'],
    rows: rows.length ? (rows as RowInput[]) : [['Nenhuma ação em atraso', '-', '-']]
  }
}

const getRisksRepeatingTable = (actions: Acao[]) => {
  const map = new Map<string, { nivel: string; impacto: string; count: number }>()

  actions.forEach((acao) => {
    acao.riscos.forEach((risco) => {
      if (!map.has(risco.descricao)) {
        map.set(risco.descricao, { nivel: risco.nivelRisco, impacto: risco.impacto, count: 0 })
      }

      map.get(risco.descricao)!.count += 1
    })
  })

  const rows = Array.from(map.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([descricao, info]) => [descricao, info.nivel, info.impacto, info.count])

  return {
    headers: ['Risco', 'Nível', 'Impacto', 'Qtd. de ações'],
    rows: rows.length ? (rows as RowInput[]) : [['Nenhum risco encontrado', '-', '-', '-']]
  }
}

const addParagraph = (doc: jsPDF, text: string, startY: number) => {
  let cursorY = startY
  const lines = doc.splitTextToSize(text, 170)
  lines.forEach((line: string) => {
    doc.text(line, 20, cursorY)
    cursorY += 7
  })
  return cursorY
}

const generateReportPdf = (report: Report) => {
  const doc = new jsPDF()
  let cursorY = 20

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(report.title, 20, cursorY)

  cursorY += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, cursorY)

  cursorY += 12
  doc.setFontSize(12)
  cursorY = addParagraph(doc, report.description, cursorY)

  report.sections.forEach((section) => {
    if (cursorY > 250) {
      doc.addPage()
      cursorY = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(section.title, 20, cursorY)

    cursorY += 8
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)

    if (section.description) {
      cursorY = addParagraph(doc, section.description, cursorY)
      cursorY += 4
    }

    if (section.table) {
      autoTable(doc, {
        head: [section.table.headers],
        body: section.table.rows,
        startY: cursorY,
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 }
      })
      cursorY = (doc as any).lastAutoTable.finalY + 10
    }
  })

  doc.save(report.fileName)
}

export default function Reports() {
  const { filters } = useFilters()
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const totals = useMemo(
    () =>
      getDashboardTotals(
        filters.setor,
        filters.period,
        filters.status,
        filters.objetivo,
        filters.risco,
        filters.indicador
      ),
    [filters.setor, filters.period, filters.status, filters.objetivo, filters.risco, filters.indicador]
  )

  const actions = useMemo(
    () =>
      getActionsList(
        filters.setor,
        filters.status,
        filters.period,
        filters.objetivo,
        filters.risco,
        filters.indicador
      ),
    [filters.setor, filters.period, filters.status, filters.objetivo, filters.risco, filters.indicador]
  )

  const risks = useMemo(
    () =>
      getRisksSummary(
        filters.setor,
        filters.period,
        filters.status,
        filters.objetivo,
        filters.risco,
        filters.indicador
      ),
    [filters.setor, filters.period, filters.status, filters.objetivo, filters.risco, filters.indicador]
  )

  const reports = useMemo<Report[]>(() => {
    const riscosGeral = risks.labels
      .map((label, index) => [label, risks.series[index]])
      .filter(([, value]) => value !== undefined)

    const statusResumo = {
      headers: ['Indicador', 'Valor'],
      rows: [
        ['Total de ações', totals.total],
        ['Concluídas', totals.concluidas],
        ['Em Progresso', totals.emProgresso],
        ['Em Atraso', totals.emAtraso],
        ['Canceladas', totals.canceladas]
      ] as RowInput[]
    }

    const statusDetalhado = {
      headers: ['Status', 'Quantidade'],
      rows: [
        ['Criadas', totals.criadas],
        ['Sobrestadas', totals.sobrestadas],
        ['Aguardando Prazo', totals.aguardandoPrazo]
      ] as RowInput[]
    }

    return [
      {
        id: 1,
        title: 'Status Report Executivo',
        description:
          'Panorama consolidado do portfólio considerando KPIs de execução, distribuição de status e riscos monitorados.',
        icon: <PieChartOutlined className="text-blue-500" />,
        date: 'Atualizado hoje',
        fileName: 'status-report-executivo.pdf',
        sections: [
          {
            title: 'Resumo Executivo',
            table: statusResumo
          },
          {
            title: 'Distribuição por Status',
            table: statusDetalhado
          },
          {
            title: 'Monitoramento de Riscos',
            description: `Total de riscos associados às ações filtradas: ${totals.riscos}.`,
            table: {
              headers: ['Nível de risco', 'Quantidade'],
              rows:
                riscosGeral.length > 0
                  ? (riscosGeral as RowInput[])
                  : ([[['Sem registros', '-']]] as unknown as RowInput[])
            }
          }
        ]
      },
      {
        id: 2,
        title: 'Detalhamento Operacional por Setor',
        description:
          'Distribuição das ações por unidades responsáveis, evidenciando volume, andamento e pontos críticos por setor.',
        icon: <TableOutlined className="text-green-500" />,
        date: 'Atualizado hoje',
        fileName: 'detalhamento-operacional.pdf',
        sections: [
          {
            title: 'Setores com maior volume de ações',
            table: getTopSectorsTable(actions)
          },
          {
            title: 'Ações em destaque',
            table: getActionHighlightsTable(actions)
          },
          {
            title: 'Pontos críticos do cronograma',
            description: 'Ações com status atual "Em Atraso".',
            table: getDelayedActionsTable(actions)
          }
        ]
      },
      {
        id: 3,
        title: 'Matriz de Riscos',
        description:
          'Consolida os principais riscos do portfólio, seus níveis e os setores/ações impactados para priorização das respostas.',
        icon: <AlertOutlined className="text-orange-500" />,
        date: 'Atualizado ontem',
        fileName: 'matriz-de-riscos.pdf',
        sections: [
          {
            title: 'Distribuição por nível de risco',
            table: {
              headers: ['Nível', 'Quantidade'],
              rows:
                riscosGeral.length > 0
                  ? (riscosGeral as RowInput[])
                  : [['Sem registros', '-']]
            }
          },
          {
            title: 'Riscos que mais se repetem',
            table: getRisksRepeatingTable(actions)
          }
        ]
      }
    ]
  }, [actions, risks.labels, risks.series, totals])

  const handleDownload = (report: Report) => {
    try {
      setDownloadingId(report.id)
      generateReportPdf(report)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6">
        Relatórios Gerenciais
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-background-light dark:bg-background-dark rounded-lg text-2xl">
                  {report.icon}
                </div>
                <FilePdfOutlined className="text-red-500 text-xl opacity-50" />
              </div>
              
              <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                {report.title}
              </h3>
              
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6 flex-grow">
                {report.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-light dark:border-border-dark">
                <span className="text-xs text-text-muted-light">
                  {report.date}
                </span>
                <Button 
                  type="text" 
                  icon={<DownloadOutlined />}
                  className="text-primary hover:bg-primary/10"
                  loading={downloadingId === report.id}
                  onClick={() => handleDownload(report)}
                >
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
              Precisa de um relatório personalizado?
            </h4>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Configure filtros específicos e exporte os dados brutos para análise.
            </p>
          </div>
          <Button type="primary">
            Gerar Relatório Customizado
          </Button>
        </div>
      </Card>
    </div>
  )
}
