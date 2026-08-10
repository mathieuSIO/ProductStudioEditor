type MondialRelayParcelShopData = {
  ID: string | number
  Pays: string
}

type MondialRelayPickerOptions = {
  Brand: string
  Country: 'FR'
  ColLivMod:string

  OnParcelShopSelected: (data: MondialRelayParcelShopData) => void
  Responsive: true
  ShowResultsOnMap: true
  Target: string
  Theme: 'mondialrelay'
}

type MondialRelayJQueryInstance = {
  MR_ParcelShopPicker: (options: MondialRelayPickerOptions) => void
}

type MondialRelayJQueryStatic = {
  (element: HTMLElement): MondialRelayJQueryInstance
  fn: {
    MR_ParcelShopPicker?: (options: MondialRelayPickerOptions) => void
  }
}

interface Window {
  L?: unknown
  jQuery?: MondialRelayJQueryStatic
}
