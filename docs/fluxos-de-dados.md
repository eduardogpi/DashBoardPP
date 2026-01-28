# Fluxos de Dados do Dashboard

Este documento descreve como as informações percorrem o projeto, desde os filtros globais até os componentes visuais e relatórios. Serve como referência rápida para novos membros entenderem onde cada dado é calculado e consumido.

## Visão Geral

```
FilterContext → utils/data-service.ts → Componentes
```

1. **FilterContext (`app/filter-context.tsx`)** guarda o estado global de filtros (`setor`, `period`, `status`, `objetivo`, `risco`, `indicador`).
2. **GlobalFilters** atualiza o contexto conforme o usuário interage com TreeSelects, botões ou selects.
3. **utils/data-service.ts** expõe funções puras que recebem os filtros e retornam agregações, listas ou rankings. Todas partem de `getFilteredActions` para garantir consistência.
4. **Componentes** (Dashboard, Units, ActionsBySector, Reports etc.) consomem essas funções, memorizam resultados quando necessário e exibem as informações na UI.

## Fluxos Principais

### 1. KPIs e Gráficos do Dashboard

- **Entrada:** filtros globais.
- **Serviços:**
  - `getDashboardTotals` → totais por status e riscos.
  - `getChartData` → contagens por status + cores.
  - `getRisksSummary` → distribuição Alto/Médio/Baixo.
- **Saída:** `Dashboard.tsx` preenche cards de contadores e gráficos (`StatusChart`).

### 2. Top 5 + Lista de Ações Estratégicas

1. `Top5RankingCard` chama `getTop5SuperiorRanking` para obter ranking por superior.
2. Ao selecionar uma unidade, o componente envia o nome para `Dashboard`, que guarda em `selectedTopSuperior`.
3. `ActionsBySector` recebe `filterSuperior` e filtra o resultado de `getActionsList` antes de renderizar os cards de ação.
4. O modal “Ver todas” de Top5 também usa `getTop5SuperiorRanking` com `returnAll=true` e dispara a mesma seleção.

### 3. Visão de Unidades (Grade/Cascata)

- **Serviço:** `getUnitsPerformance` agrega métricas por setor.
- **Processamento extra:** `Units.tsx` cruza os dados com `estrutura.json` usando `resolveHierarchyLabels`, gera agrupamentos (Map) e controla filtros locais (superior/coordenadoria) com memoização condicional.
- **Saídas:** cards em grade por superior ou painéis em cascata exibindo coordenadorias e suas unidades.

### 4. Relatórios e PDF (`Reports.tsx`)

- Usa `getDashboardTotals`, `getActionsList`, `getRisksSummary` e helpers internos para montar seções.
- A lista completa de ações alimenta tabelas de setores e atrasos; `getStatusIdByDescription` garante que filtros por status sejam dinâmicos.

### 5. Fluxo de Filtros

| Origem | Destino | Descrição |
| --- | --- | --- |
| GlobalFilters | FilterContext | `updateFilter` atualiza o estado global. |
| FilterContext | Componentes | Hooks (`useFilters`) expõem os valores para os componentes. |
| Componentes | data-service | Cada componente passa os filtros às funções utilitárias. |
| data-service | Componentes | Dados já processados retornam para renderização. |

## Dependências de Dados

- **`response_1768849010110.json`**: base de ações e KPIs históricos.
- **`estrutura.json`**: mapa hierárquico usado para TreeSelect, Units e cascata.
- **`configuracoes.json`**: mapeamento dinâmico de status (IDs, descrições, cores).

## Boas Práticas Registradas

1. **Fonte única de verdade:** todos os cálculos começam em `getFilteredActions`.
2. **Memoização condicionada:** componentes como Units só preparam mapas quando o modo “cascata” está ativo.
3. **Filtros propagados:** componentes sempre usam os filtros do contexto, evitando estados duplicados.
4. **Seleção cruzada:** Top5 + ActionsBySector demonstram como compartilhar filtros locais sem poluir o contexto global.

## Próximos Passos Sugeridos

- Adicionar diagramas visuais (mermaid) mostrando dependências entre serviços.
- Documentar fluxos adicionais (por exemplo, geração de relatórios PDF) com mais detalhes caso o escopo cresça.
