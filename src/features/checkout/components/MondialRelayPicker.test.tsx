import { StrictMode } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MondialRelayPicker } from './MondialRelayPicker'

const resourceLoaderMocks = vi.hoisted(() => ({
  loadExternalScript: vi.fn<() => Promise<void>>(),
  loadExternalStylesheet: vi.fn<() => Promise<void>>(),
}))

vi.mock('../../../shared/utils/loadExternalResource', () =>
  resourceLoaderMocks,
)

describe('MondialRelayPicker', () => {
  beforeEach(() => {
    resourceLoaderMocks.loadExternalScript.mockReset().mockResolvedValue()
    resourceLoaderMocks.loadExternalStylesheet.mockReset().mockResolvedValue()
    delete window.jQuery
    delete window.L
  })

  it('initializes the widget once in StrictMode and only returns ID and country', async () => {
    const widgetInitializer = installWidgetGlobals()
    const onSelect = vi.fn()

    render(
      <StrictMode>
        <MondialRelayPicker onSelect={onSelect} />
      </StrictMode>,
    )

    await waitFor(() => expect(widgetInitializer).toHaveBeenCalledTimes(1))

    const options = widgetInitializer.mock.calls[0]?.[0]
    options?.OnParcelShopSelected({ ID: 123, Pays: 'fr' })

    expect(onSelect).toHaveBeenCalledWith({ country: 'FR', id: '000123' })
    expect(options).toMatchObject({
      Brand: 'BDTEST',
      Country: 'FR',
      Responsive: true,
      ShowResultsOnMap: true,
      Theme: 'mondialrelay',
    })
  })

  it('shows a controlled loading error and retries without reloading the page', async () => {
    const widgetInitializer = installWidgetGlobals()
    resourceLoaderMocks.loadExternalScript.mockRejectedValueOnce(
      new Error('network error'),
    )

    render(<MondialRelayPicker onSelect={vi.fn()} />)

    expect(
      await screen.findByText(
        /Le module Mondial Relay n’a pas pu être chargé/,
      ),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))

    await waitFor(() => expect(widgetInitializer).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('button', { name: 'Réessayer' })).toBeNull()
  })
})

function installWidgetGlobals() {
  const widgetInitializer = vi.fn<
    (options: MondialRelayPickerOptions) => void
  >()
  const jquery: MondialRelayJQueryStatic = Object.assign(
    () => ({ MR_ParcelShopPicker: widgetInitializer }),
    { fn: { MR_ParcelShopPicker: widgetInitializer } },
  )

  window.jQuery = jquery
  window.L = {}

  return widgetInitializer
}
