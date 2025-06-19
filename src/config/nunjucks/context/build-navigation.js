/**
 * @param {Partial<Request> | null} request
 */
export function buildNavigation(request) {
  return [
    {
      text: 'Home',
      href: '/',
      current: request?.path === '/'
    },
    {
      text: 'Parliamentary Answers',
      href: '/parliamentary-answer',
      current: request?.path?.startsWith('/parliamentary-answer')
    },
    {
      text: 'About',
      href: '/about',
      current: request?.path === '/about'
    }
  ]
}

/**
 * @import { Request } from '@hapi/hapi'
 */
