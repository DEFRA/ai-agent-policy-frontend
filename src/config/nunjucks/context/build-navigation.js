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
      text: 'Parliamentary Questions',
      href: '/parliamentary-question',
      current: request?.path?.startsWith('/parliamentary-question')
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
