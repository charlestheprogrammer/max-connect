'use client'

import { createContext, useContext, useState } from 'react'

type searchContextType = {
  from?: string
  to?: string
  fromDate?: Date
  toDate?: Date
  setSearch: (from: string, to: string, fromDate?: Date, toDate?: Date) => void
  resetSearch: () => void
}

const defaultSearchContext: searchContextType = {
  from: '',
  to: '',
  fromDate: new Date(),
  toDate: new Date(),
  setSearch: () => {},
  resetSearch: () => {},
}

const SearchContext = createContext<searchContextType>(defaultSearchContext)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchValue, setSearchValue] =
    useState<searchContextType>(defaultSearchContext)

  const setSearch = (
    from: string,
    to: string,
    fromDate?: Date,
    toDate?: Date
  ) => {
    setSearchValue({
      ...searchValue,
      from,
      to,
      fromDate,
      toDate,
    })
  }

  const value = {
    ...searchValue,
    setSearch,
    resetSearch: () => setSearchValue(defaultSearchContext),
  }

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  )
}

export function useSearchContext() {
  return useContext(SearchContext)
}
