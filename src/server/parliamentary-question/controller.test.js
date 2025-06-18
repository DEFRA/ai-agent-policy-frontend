import { showFormController, submitQuestionController } from './controller.js'

describe('#showFormController', () => {
  test('Should provide expected response', () => {
    const mockRequest = {}
    const mockH = {
      view: jest.fn().mockReturnValue('mocked response')
    }

    const result = showFormController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('parliamentary-question/form', {
      pageTitle: 'Generate a written parliamentary answer',
      heading: 'Generate a written parliamentary answer',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Parliamentary Questions'
        }
      ]
    })
    expect(result).toBe('mocked response')
  })
})

describe('#submitQuestionController', () => {
  const mockLogger = {
    error: jest.fn(),
    info: jest.fn()
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Should show validation error for empty question', async () => {
    const mockRequest = {
      payload: { question: '' },
      logger: mockLogger
    }
    const mockH = {
      view: jest.fn().mockReturnValue({
        code: jest.fn().mockReturnValue('validation error response')
      })
    }

    const result = await submitQuestionController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('parliamentary-question/form', {
      pageTitle: 'Generate a written parliamentary answer',
      heading: 'Generate a written parliamentary answer',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Parliamentary Questions'
        }
      ],
      errorSummary: {
        titleText: 'There is a problem',
        errorList: [
          {
            text: 'Enter a parliamentary question',
            href: '#question'
          }
        ]
      },
      errors: {
        question: {
          text: 'Enter a parliamentary question'
        }
      },
      formData: { question: '' }
    })
    expect(result).toBe('validation error response')
  })

  test('Should show validation error for missing question', async () => {
    const mockRequest = {
      payload: {},
      logger: mockLogger
    }
    const mockH = {
      view: jest.fn().mockReturnValue({
        code: jest.fn().mockReturnValue('validation error response')
      })
    }

    const result = await submitQuestionController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      'parliamentary-question/form',
      expect.objectContaining({
        errorSummary: expect.objectContaining({
          titleText: 'There is a problem'
        })
      })
    )
    expect(result).toBe('validation error response')
  })
})
