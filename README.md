# Dashboard CRP - Next.js 14 + Ant Design 5 + ApexCharts

Sistema de gestão de ações e operações CRP migrado para Next.js 14 com componentes Ant Design 5 e gráficos ApexCharts.

## Tecnologias

- **Next.js 14** - Framework React com App Router
- **Ant Design 5** - Biblioteca de componentes UI
- **ApexCharts** - Biblioteca de gráficos
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária

## Instalação

```bash
cd dashboard-next
npm install
```

## Executar em Desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`

## Estrutura do Projeto

```
dashboard-next/
├── app/
│   ├── globals.css          # Estilos globais
│   ├── layout.tsx            # Layout raiz com ConfigProvider
│   └── page.tsx              # Página principal
├── components/
│   ├── Sidebar.tsx           # Sidebar de navegação (desktop)
│   ├── Header.tsx            # Header com filtros e ações
│   ├── Dashboard.tsx         # Dashboard principal
│   ├── GlobalFilters.tsx     # Componente de filtros globais
│   ├── ActionsBySector.tsx   # Lista de ações por setor
│   ├── Units.tsx             # Estrutura organizacional
│   ├── Reports.tsx           # Relatórios técnicos
│   └── Settings.tsx          # Configurações
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.js
```

## Funcionalidades

- ✅ Layout responsivo (mobile/desktop)
- ✅ Sidebar fixa em desktop
- ✅ KPIs com dados de ações
- ✅ Gráficos ApexCharts (doughnut e área)
- ✅ Filtros globais (período, setor, status)
- ✅ Lista de ações por setor
- ✅ Estrutura organizacional hierárquica
- ✅ Tema claro/escuro
- ✅ Navegação entre abas

## Próximos Passos

1. Instalar dependências: `npm install`
2. Executar projeto: `npm run dev`
3. Integrar com API real para dados de ações
4. Adicionar autenticação
5. Implementar paginação
6. Adicionar exportação de relatórios
