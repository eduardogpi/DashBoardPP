'use client'

import { Card, Button, List, Avatar } from 'antd'
import { 
  FilePdfOutlined, 
  DownloadOutlined, 
  PieChartOutlined, 
  TableOutlined, 
  AlertOutlined 
} from '@ant-design/icons'

const reports = [
  {
    id: 1,
    title: "Status Report Executivo",
    description: "Visão consolidada dos KPIs, progresso físico e aderência ao cronograma do portfólio.",
    icon: <PieChartOutlined className="text-blue-500" />,
    date: "Atualizado hoje"
  },
  {
    id: 2,
    title: "Detalhamento Operacional por Setor",
    description: "Lista completa de ações, marcos, responsabilidades e status atualizado por unidade.",
    icon: <TableOutlined className="text-green-500" />,
    date: "Atualizado hoje"
  },
  {
    id: 3,
    title: "Matriz de Riscos",
    description: "Relatório de riscos identificados, classificação de impacto e planos de mitigação.",
    icon: <AlertOutlined className="text-orange-500" />,
    date: "Atualizado ontem"
  }
]

export default function Reports() {
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
