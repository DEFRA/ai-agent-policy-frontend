import { config } from '~/src/config/config.js'
import { statusCodes } from '~/src/server/common/constants/status-codes.js'

/**
 * Display the parliamentary answer form
 * @satisfies {Partial<ServerRoute>}
 */
export const showFormController = {
  handler(request, h) {
    return h.view('parliamentary-answer/form', {
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
  }
}

/**
 * Process the parliamentary answer form submission
 * @satisfies {Partial<ServerRoute>}
 */
export const submitAnswerController = {
  handler: async (request, h) => {
    try {
      const { question } = request.payload || {}

      // Validate the question
      if (!question?.trim()) {
        return h
          .view('parliamentary-answer/form', {
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
            formData: { question }
          })
          .code(statusCodes.badRequest)
      }

      // Call the backend API
      const apiResponse = await callSemanticChatAPI(request, question)

      // Extract the code from the response and redirect to semantic-output
      if (apiResponse?.message) {
        const code = apiResponse.message
        request.logger.info('Redirecting to semantic output with code', {
          code
        })
        return h.redirect(`/semantic-output/${encodeURIComponent(code)}`)
      }

      // Fallback if no message/code in response
      throw new Error('No code received from API response')
    } catch (error) {
      request.logger.error(
        'Error processing parliamentary answer request',
        error
      )

      return h
        .view('parliamentary-answer/form', {
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
                text: 'Unable to process your request at this time. Please try again later.',
                href: '#question'
              }
            ]
          },
          formData: { question: request.payload?.question }
        })
        .code(statusCodes.internalServerError)
    }
  }
}

/**
 * Call the semantic chat API
 * @param {import('@hapi/hapi').Request} request
 * @param {string} question
 * @returns {Promise<object>}
 */
async function callSemanticChatAPI(request, question) {
  const apiBaseUrl = config.get('apiServer')
  const endpoint = `${apiBaseUrl}/policy/chat/background_semantic`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: question.trim()
      })
    })

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`)
    }

    const result = await response.json()
    request.logger.info('Successfully called semantic chat API', {
      status: response.status,
      hasResponse: !!result
    })

    return result
  } catch (error) {
    request.logger.error('Failed to call semantic chat API', {
      endpoint,
      error: error.message
    })
    throw error
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
