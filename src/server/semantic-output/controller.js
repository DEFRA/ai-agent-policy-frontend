import { config } from '~/src/config/config.js'
import { statusCodes } from '~/src/server/common/constants/status-codes.js'

/**
 * Display the semantic output form
 * @satisfies {Partial<ServerRoute>}
 */
export const showFormController = {
  handler(request, h) {
    return h.view('semantic-output/form', {
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
  }
}

/**
 * Process the semantic output form submission
 * @satisfies {Partial<ServerRoute>}
 */
export const submitCodeController = {
  handler: (request, h) => {
    const { code } = request.payload || {}

    // Validate the code
    if (!code?.trim()) {
      return h
        .view('semantic-output/form', {
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
          formData: { code }
        })
        .code(statusCodes.badRequest)
    }

    // Redirect to the results page with the code
    return h.redirect(`/semantic-output/${encodeURIComponent(code.trim())}`)
  }
}

/**
 * Parse key information facts to separate main text, UIN, and date
 * @param {string[]} keyInformation
 * @returns {Array<{text: string, uin: string, date: string}>}
 */
function parseKeyInformation(keyInformation) {
  if (!keyInformation || !Array.isArray(keyInformation)) {
    return []
  }

  return keyInformation.map((fact) => {
    // Look for pattern "(PQ 123456 - 2024-01-01)"
    const pqMatch = fact.match(/\(PQ\s+(\d+)\s*-\s*([^)]+)\)/)

    if (pqMatch) {
      const mainText = fact.replace(pqMatch[0], '').trim()
      const uin = pqMatch[1]
      const date = pqMatch[2].trim()

      return {
        text: mainText,
        uin,
        date
      }
    }

    // If no PQ reference found, just return the text
    return {
      text: fact,
      uin: '',
      date: ''
    }
  })
}

/**
 * Display semantic output results
 * @satisfies {Partial<ServerRoute>}
 */
export const showResultsController = {
  handler: async (request, h) => {
    try {
      const { tag } = request.params

      if (!tag?.trim()) {
        return h.redirect('/semantic-output')
      }

      // Call the API to get the semantic output
      const response = await callSemanticOutputAPI(request, tag)

      // Check if analysis is still processing
      if (
        response &&
        response.message ===
          'Semantic Chat output not yet available, please try again soon.'
      ) {
        return h.view('semantic-output/loading', {
          pageTitle: 'Analysing',
          heading: 'Analysing',
          breadcrumbs: [
            {
              text: 'Home',
              href: '/'
            },
            {
              text: 'Loading'
            }
          ],
          tag,
          apiBaseUrl: config.get('apiServer')
        })
      }

      // Process the data to parse key information
      const processedData = { ...response }
      if (response.key_information) {
        processedData.parsed_key_information = parseKeyInformation(
          response.key_information
        )
      }

      return h.view('semantic-output/results', {
        pageTitle: 'Results',
        heading: 'Results',
        breadcrumbs: [
          {
            text: 'Home',
            href: '/'
          },
          {
            text: 'Results'
          }
        ],
        tag,
        data: processedData
      })
    } catch (error) {
      request.logger.error('Error retrieving semantic output', error)

      return h
        .view('semantic-output/error', {
          pageTitle: 'Analysis Not Found',
          heading: 'Analysis Not Found',
          breadcrumbs: [
            {
              text: 'Home',
              href: '/'
            },
            {
              text: 'Error'
            }
          ],
          tag: request.params.tag
        })
        .code(statusCodes.notFound)
    }
  }
}

/**
 * API endpoint for client-side polling
 * @satisfies {Partial<ServerRoute>}
 */
export const checkStatusController = {
  handler: async (request, h) => {
    try {
      const { tag } = request.params

      if (!tag?.trim()) {
        return h.response({ error: 'Invalid tag' }).code(statusCodes.badRequest)
      }

      // Call the API to get the semantic output
      const response = await callSemanticOutputAPI(request, tag)

      // Return status information for client-side polling
      if (
        response &&
        response.message ===
          'Semantic Chat output not yet available, please try again soon.'
      ) {
        return h.response({
          status: 'processing',
          message: 'Analysis still in progress'
        })
      }

      return h.response({
        status: 'complete',
        data: response
      })
    } catch (error) {
      request.logger.error('Error checking semantic output status', error)

      return h
        .response({
          status: 'error',
          message: 'Failed to check analysis status'
        })
        .code(statusCodes.internalServerError)
    }
  }
}

/**
 * Call the semantic output API
 * @param {import('@hapi/hapi').Request} request
 * @param {string} tag
 * @returns {Promise<object>}
 */
async function callSemanticOutputAPI(request, tag) {
  const apiBaseUrl = config.get('apiServer')
  const endpoint = `${apiBaseUrl}/policy/chat/semantic_output`
  let url

  try {
    url = new URL(endpoint)
    url.searchParams.set('tag', tag)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Analysis not found')
      }
      throw new Error(`API call failed with status: ${response.status}`)
    }

    const result = await response.json()
    request.logger.info('Successfully retrieved semantic output', {
      tag,
      status: response.status,
      hasResponse: !!result,
      isProcessing:
        result?.message ===
        'Semantic Chat output not yet available, please try again soon.'
    })

    return result
  } catch (error) {
    request.logger.error('Failed to call semantic output API', {
      endpoint: url?.toString() ?? endpoint,
      tag,
      error: error.message
    })
    throw error
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
