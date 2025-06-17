import { showFormController, submitQuestionController } from './controller.js'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const parliamentaryQuestion = {
  plugin: {
    name: 'parliamentary-question',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/parliamentary-question',
          ...showFormController
        },
        {
          method: 'POST',
          path: '/parliamentary-question',
          ...submitQuestionController
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
