import { showFormController, submitAnswerController } from './controller.js'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const parliamentaryAnswer = {
  plugin: {
    name: 'parliamentary-answer',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/parliamentary-answer',
          ...showFormController
        },
        {
          method: 'POST',
          path: '/parliamentary-answer',
          ...submitAnswerController
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
