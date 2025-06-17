import {
  showFormController,
  submitCodeController,
  showResultsController,
  checkStatusController
} from './controller.js'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const semanticOutput = {
  plugin: {
    name: 'semantic-output',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/semantic-output',
          ...showFormController
        },
        {
          method: 'POST',
          path: '/semantic-output',
          ...submitCodeController
        },
        {
          method: 'GET',
          path: '/semantic-output/{tag}',
          ...showResultsController
        },
        {
          method: 'GET',
          path: '/api/semantic-output/{tag}/status',
          ...checkStatusController
        }
      ])
    }
  }
}
