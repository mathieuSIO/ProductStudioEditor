import { vi, type Mock } from 'vitest'

type FetchFunction = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>
type FetchMock = Mock<FetchFunction>

export function mockFetchJson(responseBody: unknown, init: ResponseInit = {}) {
  const fetchMock: FetchMock = vi.fn(async () =>
    Response.json(responseBody, {
      status: init.status ?? 200,
      statusText: init.statusText,
      headers: init.headers,
    }),
  )

  vi.stubGlobal('fetch', fetchMock)

  return fetchMock
}

export function mockFetchJsonSequence(responses: unknown[]) {
  const fetchMock: FetchMock = vi.fn()

  responses.forEach((responseBody) => {
    fetchMock.mockResolvedValueOnce(Response.json(responseBody))
  })

  vi.stubGlobal('fetch', fetchMock)

  return fetchMock
}
