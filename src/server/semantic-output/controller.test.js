import {
  showFormController,
  submitCodeController,
  showResultsController,
  checkStatusController
} from './controller.js'

describe('#showFormController', () => {
  test('Should provide expected response', () => {
    const mockRequest = {}
    const mockH = {
      view: jest.fn().mockReturnValue('mocked response')
    }

    const result = showFormController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('semantic-output/form', {
      pageTitle: 'View Analysis Results',
      heading: 'View Analysis Results',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'View Analysis Results'
        }
      ]
    })
    expect(result).toBe('mocked response')
  })
})

describe('#submitCodeController', () => {
  const mockLogger = {
    error: jest.fn(),
    info: jest.fn()
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Should show validation error for empty code', () => {
    const mockRequest = {
      payload: { code: '' },
      logger: mockLogger
    }
    const mockH = {
      view: jest.fn().mockReturnValue({
        code: jest.fn().mockReturnValue('validation error response')
      })
    }

    const result = submitCodeController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('semantic-output/form', {
      pageTitle: 'View Analysis Results',
      heading: 'View Analysis Results',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'View Analysis Results'
        }
      ],
      errorSummary: {
        titleText: 'There is a problem',
        errorList: [
          {
            text: 'Enter an analysis code',
            href: '#code'
          }
        ]
      },
      errors: {
        code: {
          text: 'Enter an analysis code'
        }
      },
      formData: { code: '' }
    })
    expect(result).toBe('validation error response')
  })

  test('Should redirect to results page for valid code', () => {
    const mockRequest = {
      payload: { code: 'test-code-123' },
      logger: mockLogger
    }
    const mockH = {
      redirect: jest.fn().mockReturnValue('redirect response')
    }

    const result = submitCodeController.handler(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith(
      '/semantic-output/test-code-123'
    )
    expect(result).toBe('redirect response')
  })

  test('Should handle whitespace in code', () => {
    const mockRequest = {
      payload: { code: '  test-code-123  ' },
      logger: mockLogger
    }
    const mockH = {
      redirect: jest.fn().mockReturnValue('redirect response')
    }

    const result = submitCodeController.handler(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith(
      '/semantic-output/test-code-123'
    )
    expect(result).toBe('redirect response')
  })
})

describe('#showResultsController', () => {
  const mockLogger = {
    error: jest.fn(),
    info: jest.fn()
  }

  beforeEach(() => {
    // Mock fetch globally
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Should redirect to form when no tag provided', async () => {
    const mockRequest = {
      params: { tag: '' },
      logger: mockLogger
    }
    const mockH = {
      redirect: jest.fn().mockReturnValue('redirect response')
    }

    const result = await showResultsController.handler(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith('/semantic-output')
    expect(result).toBe('redirect response')
  })

  test('Should show loading page when analysis is still processing', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          message:
            'Semantic Chat output not yet available, please try again soon.'
        })
    })

    const mockRequest = {
      params: { tag: 'processing-tag' },
      logger: mockLogger
    }
    const mockH = {
      view: jest.fn().mockReturnValue('loading response')
    }

    const result = await showResultsController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('semantic-output/loading', {
      pageTitle: 'Analysing',
      heading: 'Analysing',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'View Analysis Results',
          href: '/semantic-output'
        },
        {
          text: 'Loading'
        }
      ],
      tag: 'processing-tag',
      apiBaseUrl: expect.any(String)
    })
    expect(result).toBe('loading response')
  })

  test('Should display results when analysis is complete', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          query: 'Test question',
          final_answer: 'Test answer',
          key_information: ['fact1', 'fact2']
        })
    })

    const mockRequest = {
      params: { tag: 'complete-tag' },
      logger: mockLogger
    }
    const mockH = {
      view: jest.fn().mockReturnValue('results response')
    }

    const result = await showResultsController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('semantic-output/results', {
      pageTitle: 'Results',
      heading: 'Results',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'View Analysis Results',
          href: '/semantic-output'
        },
        {
          text: 'Results'
        }
      ],
      tag: 'complete-tag',
      data: {
        query: 'Test question',
        final_answer: 'Test answer',
        key_information: ['fact1', 'fact2'],
        parsed_key_information: [
          {
            text: 'fact1',
            uin: '',
            date: ''
          },
          {
            text: 'fact2',
            uin: '',
            date: ''
          }
        ]
      }
    })
    expect(result).toBe('results response')
  })

  test('Should display error page when API call fails', async () => {
    global.fetch.mockRejectedValue(new Error('API Error'))

    const mockRequest = {
      params: { tag: 'invalid-tag' },
      logger: mockLogger
    }
    const mockH = {
      view: jest.fn().mockReturnValue({
        code: jest.fn().mockReturnValue('error response')
      })
    }

    const result = await showResultsController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('semantic-output/error', {
      pageTitle: 'Analysis Not Found',
      heading: 'Analysis Not Found',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'View Analysis Results',
          href: '/semantic-output'
        },
        {
          text: 'Error'
        }
      ],
      tag: 'invalid-tag'
    })
    expect(result).toBe('error response')
  })
})

describe('#checkStatusController', () => {
  const mockLogger = {
    error: jest.fn(),
    info: jest.fn()
  }

  beforeEach(() => {
    // Mock fetch globally
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Should return processing status when analysis is not ready', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          message:
            'Semantic Chat output not yet available, please try again soon.'
        })
    })

    const mockRequest = {
      params: { tag: 'processing-tag' },
      logger: mockLogger
    }
    const mockH = {
      response: jest.fn().mockReturnValue('processing response')
    }

    const result = await checkStatusController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      status: 'processing',
      message: 'Analysis still in progress'
    })
    expect(result).toBe('processing response')
  })

  test('Should return complete status with data when analysis is ready', async () => {
    const mockData = {
      query: 'Test question',
      final_answer: 'Test answer',
      key_information: ['fact1', 'fact2']
    }

    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    })

    const mockRequest = {
      params: { tag: 'complete-tag' },
      logger: mockLogger
    }
    const mockH = {
      response: jest.fn().mockReturnValue('complete response')
    }

    const result = await checkStatusController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      status: 'complete',
      data: mockData
    })
    expect(result).toBe('complete response')
  })

  test('Should return error for invalid tag', async () => {
    const mockRequest = {
      params: { tag: '' },
      logger: mockLogger
    }
    const mockH = {
      response: jest.fn().mockReturnValue({
        code: jest.fn().mockReturnValue('bad request response')
      })
    }

    const result = await checkStatusController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith({ error: 'Invalid tag' })
    expect(result).toBe('bad request response')
  })

  test('Should handle API errors gracefully', async () => {
    global.fetch.mockRejectedValue(new Error('API Error'))

    const mockRequest = {
      params: { tag: 'error-tag' },
      logger: mockLogger
    }
    const mockH = {
      response: jest.fn().mockReturnValue({
        code: jest.fn().mockReturnValue('error response')
      })
    }

    const result = await checkStatusController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to check analysis status'
    })
    expect(result).toBe('error response')
  })
})
