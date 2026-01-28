'use client'

import { useMemo } from 'react'
import { Card, Button, Space, TreeSelect, Select } from 'antd'
import { FilterOutlined } from '@ant-design/icons'
import estruturaData from '../estrutura.json'
import dadosDashboard from '../response_1768849010110.json'
import { buildTree, Unit } from '../utils/hierarchy'
import { useFilters } from '../app/filter-context'
import configuracoes from '../configuracoes.json'

/**
 * GlobalFilters
 * Centraliza a UI de filtros compartilhados pelo dashboard inteiro. Constrói as opções
 * a partir de estrutura.json e response_*.json, mantendo os valores no FilterContext.
 */
export default function GlobalFilters() {
  const { filters, updateFilter } = useFilters()

  const { treeData, nodeMap } = useMemo(() => {
    const nodes = buildTree(estruturaData as Unit[])
    const allNodes = [
      {
        title: 'Todos',
        value: 'todos',
        key: 'todos',
        children: nodes
      }
    ]

    const map = new Map<string, string>()
    const traverse = (list: any[]) => {
      list.forEach(node => {
        map.set(node.value, node.title)
        if (node.children) traverse(node.children)
      })
    }
    traverse(allNodes)

    return { treeData: allNodes, nodeMap: map }
  }, [])

  const { objetivosOptions, riscosOptions, indicadoresOptions } = useMemo(() => {
  const objetivosMap = new Map<string, Set<number>>()
  const riscosMap = new Map<string, Set<number>>()
  const indicadoresMap = new Map<string, Set<number>>()

  dadosDashboard.acoes.forEach(acao => {
    acao.objetivos.forEach(obj => {
      if (!objetivosMap.has(obj.nome)) {
        objetivosMap.set(obj.nome, new Set())
      }
      objetivosMap.get(obj.nome)!.add(obj.id)
    })
    acao.riscos.forEach(risco => {
      if (!riscosMap.has(risco.descricao)) {
        riscosMap.set(risco.descricao, new Set())
      }
      riscosMap.get(risco.descricao)!.add(risco.id)
    })
    acao.indicadores.forEach(ind => {
      if (!indicadoresMap.has(ind.nome)) {
        indicadoresMap.set(ind.nome, new Set())
      }
      indicadoresMap.get(ind.nome)!.add(ind.id)
    })
  })

  const objetivosOptions = Array.from(objetivosMap.entries())
    .map(([nome, ids]) => {
      const idArray = Array.from(ids)
      return { 
        label: `${nome} (ID: ${idArray.join(', ')})`, 
        value: nome 
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label))

  const riscosOptions = Array.from(riscosMap.entries())
    .map(([descricao, ids]) => {
      const idArray = Array.from(ids)
      return { 
        label: `${descricao} (ID: ${idArray.join(', ')})`, 
        value: descricao 
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label))

  const indicadoresOptions = Array.from(indicadoresMap.entries())
    .map(([nome, ids]) => {
      const idArray = Array.from(ids)
      return {
        label: `${nome} (ID: ${idArray.join(', ')})`,
        value: nome
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label))

  return { objetivosOptions, riscosOptions, indicadoresOptions }
}, [])

  const handleSetorChange = (newValue: { value: string, label: React.ReactNode }[]) => {
    // Se "todos" for selecionado junto com outros, ou se a lista estiver vazia, define como ['todos']
    // Ou comportamento padrão: apenas atualiza com os valores selecionados
    const values = newValue.map(v => v.value)
    
    // Opcional: Se 'todos' estiver presente e foi a última ação, ou se limpar tudo, volta para 'todos'
    // Mas para comparação simples, vamos deixar livre seleção
    updateFilter('setor', values.length > 0 ? values : ['todos'])
  }

  // Converter strings do contexto para objetos { value, label } para o TreeSelect em modo strict
  const setorValue = useMemo(() => {
    const currentSetor = Array.isArray(filters.setor) 
      ? filters.setor 
      : (filters.setor ? [filters.setor] : [])
    
    return currentSetor.map(val => ({
      value: val,
      label: nodeMap.get(val) || val
    }))
  }, [filters.setor, nodeMap])

  return (
    <Card className="mb-6 border-2 border-border-light dark:border-gray-600">
      <Space direction="vertical" size="large" className="w-full">
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-primary" />
          <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider">
            Filtros Globais
          </span>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider w-20">
              Período:
            </span>
            <Button.Group>
              <Button 
                type={filters.period === 'todos' ? 'primary' : 'default'}
                size="small"
                onClick={() => updateFilter('period', 'todos')}
              >
                Todos
              </Button>
              <Button 
                type={filters.period === 'mes' ? 'primary' : 'default'}
                size="small"
                onClick={() => updateFilter('period', 'mes')}
              >
                Este Mês
              </Button>
              <Button 
                type={filters.period === 'trimestre' ? 'primary' : 'default'}
                size="small"
                onClick={() => updateFilter('period', 'trimestre')}
              >
                Trimestre
              </Button>
              <Button 
                type={filters.period === 'ano' ? 'primary' : 'default'}
                size="small"
                onClick={() => updateFilter('period', 'ano')}
              >
                Este Ano
              </Button>
            </Button.Group>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full max-w-3xl">
            <span className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider w-20 shrink-0">
              Setor:
            </span>
            <TreeSelect
              treeCheckable
              treeCheckStrictly
              showSearch
              style={{ width: '100%', flex: 1 }}
              value={setorValue}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="Selecione os setores"
              allowClear
              treeDefaultExpandAll={false}
              onChange={handleSetorChange}
              treeData={treeData}
              filterTreeNode={(inputValue, treeNode) =>
                (treeNode?.title as string).toLowerCase().includes(inputValue.toLowerCase())
              }
              size="middle"
              className="flex-1"
              maxTagCount="responsive"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider w-20">
              Status:
            </span>
            <div className="flex flex-wrap gap-2">
              <Button 
                type={filters.status === 'todos' ? 'primary' : 'default'}
                size="small"
                onClick={() => updateFilter('status', 'todos')}
              >
                Todos
              </Button>
              {configuracoes.statusIds.map(status => (
                <Button 
                  key={status.id}
                  type={filters.status === String(status.id) ? 'primary' : 'default'}
                  size="small"
                  onClick={() => updateFilter('status', String(status.id))}
                  className={filters.status === String(status.id) ? '' : 'text-gray-600 dark:text-gray-400'}
                >
                  {status.descricao}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full max-w-3xl">
            <span className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider w-20 shrink-0">
              Objetivo:
            </span>
            <Select
              style={{ width: '100%', flex: 1 }}
              value={filters.objetivo}
              onChange={(value) => updateFilter('objetivo', value)}
              placeholder="Todos os objetivos"
              allowClear
              size="middle"
              options={[{ label: 'Todos', value: 'todos' }, ...objetivosOptions]}
              showSearch
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full max-w-3xl">
            <span className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider w-20 shrink-0">
              Risco:
            </span>
            <Select
              style={{ width: '100%', flex: 1 }}
              value={filters.risco}
              onChange={(value) => updateFilter('risco', value)}
              placeholder="Todos os riscos"
              allowClear
              size="middle"
              options={[{ label: 'Todos', value: 'todos' }, ...riscosOptions]}
              showSearch
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full max-w-3xl">
            <span className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider w-20 shrink-0">
              Indicador:
            </span>
            <Select
              style={{ width: '100%', flex: 1 }}
              value={filters.indicador === 'todos' ? 'todos' : filters.indicador}
              onChange={(value) => updateFilter('indicador', value ?? 'todos')}
              placeholder="Todos os indicadores"
              allowClear
              size="middle"
              options={[{ label: 'Todos', value: 'todos' }, ...indicadoresOptions]}
              showSearch
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>
        </div>
      </Space>
    </Card>
  )
}
