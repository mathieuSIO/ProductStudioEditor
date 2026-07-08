import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

type RenderWithRouterOptions = RenderOptions & {
  path?: string
  route?: string
}

export function renderWithRouter(
  ui: ReactElement,
  {
    path = '/',
    route = '/',
    ...renderOptions
  }: RenderWithRouterOptions = {},
) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={ui} />
      </Routes>
    </MemoryRouter>,
    renderOptions,
  )
}
