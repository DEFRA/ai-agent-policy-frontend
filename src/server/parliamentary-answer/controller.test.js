import { showFormController, submitAnswerController } from './controller.js'
import { statusCodes } from '~/src/server/common/constants/status-codes.js'

const mockCode = jest.fn()
const mockH = {
  view: jest.fn().mockReturnValue({ code: mockCode }),
  redirect: jest.fn()
}

describe('Parliamentary Answer Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('showFormController', () => {
    test('Should return the parliamentary answer form view', () => {
      const mockRequest = {}

      showFormController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith('parliamentary-answer/form', {
        pageTitle: 'Generate a written parliamentary answer',
        heading: 'Generate a written parliamentary answer',
        breadcrumbs: [
          {
            text: 'Home',
            href: '/'
          },
          {
            text: 'Parliamentary Answers'
          }
        ]
      })
    })
  })

  describe('submitAnswerController', () => {
    test('Should return form with validation error when question is empty', async () => {
      const mockRequest = {
        payload: { question: '' },
        logger: {
          error: jest.fn()
        }
      }

      await submitAnswerController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith('parliamentary-answer/form', {
        pageTitle: 'Generate a written parliamentary answer',
        heading: 'Generate a written parliamentary answer',
        breadcrumbs: [
          {
            text: 'Home',
            href: '/'
          },
          {
            text: 'Parliamentary Answers'
          }
        ],
        errorSummary: {
          titleText: 'There is a problem',
          errorList: [
            {
              text: 'Enter a parliamentary answer request',
              href: '#question'
            }
          ]
        },
        errors: {
          question: {
            text: 'Enter a parliamentary answer request'
          }
        },
        formData: { question: '' }
      })

      expect(mockCode).toHaveBeenCalledWith(statusCodes.badRequest)
    })

    test('Should return form with validation error when question is undefined', async () => {
      const mockRequest = {
        payload: {},
        logger: {
          error: jest.fn()
        }
      }

      await submitAnswerController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'parliamentary-answer/form',
        expect.objectContaining({
          errorSummary: expect.objectContaining({
            errorList: [
              {
                text: 'Enter a parliamentary answer request',
                href: '#question'
              }
            ]
          })
        })
      )

      expect(mockCode).toHaveBeenCalledWith(statusCodes.badRequest)
    })
  })
})
