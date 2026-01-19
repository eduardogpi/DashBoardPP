'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface FilterState {
  period: 'todos' | 'mes' | 'trimestre' | 'ano'
  setor: string | string[]
  status: 'todos' | string
  objetivo: 'todos' | string
  risco: 'todos' | string
}

interface FilterContextType {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  updateFilter: (key: keyof FilterState, value: string | string[]) => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    period: 'todos',
    setor: ['todos'],
    status: 'todos',
    objetivo: 'todos',
    risco: 'todos',
  })

  const updateFilter = (key: keyof FilterState, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <FilterContext.Provider value={{ filters, setFilters, updateFilter }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider')
  }
  return context
}
