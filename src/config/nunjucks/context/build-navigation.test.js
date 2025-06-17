import { buildNavigation } from '~/src/config/nunjucks/context/build-navigation.js'

/**
 * @param {Partial<Request>} [options]
 */
function mockRequest(options) {
  return { ...options }
}

describe('#buildNavigation', () => {
  test('Should provide expected navigation details', () => {
    expect(
      buildNavigation(mockRequest({ path: '/non-existent-path' }))
    ).toEqual([
      {
        current: false,
        text: 'Home',
        href: '/'
      },
      {
        current: false,
        text: 'Parliamentary Questions',
        href: '/parliamentary-question'
      },
      {
        current: false,
        text: 'About',
        href: '/about'
      }
    ])
  })

  test('Should provide expected highlighted navigation details for home', () => {
    expect(buildNavigation(mockRequest({ path: '/' }))).toEqual([
      {
        current: true,
        text: 'Home',
        href: '/'
      },
      {
        current: false,
        text: 'Parliamentary Questions',
        href: '/parliamentary-question'
      },
      {
        current: false,
        text: 'About',
        href: '/about'
      }
    ])
  })

  test('Should provide expected highlighted navigation details for parliamentary questions', () => {
    expect(
      buildNavigation(mockRequest({ path: '/parliamentary-question' }))
    ).toEqual([
      {
        current: false,
        text: 'Home',
        href: '/'
      },
      {
        current: true,
        text: 'Parliamentary Questions',
        href: '/parliamentary-question'
      },
      {
        current: false,
        text: 'About',
        href: '/about'
      }
    ])
  })

  test('Should highlight parliamentary questions for sub-paths', () => {
    expect(
      buildNavigation(mockRequest({ path: '/parliamentary-question/results' }))
    ).toEqual([
      {
        current: false,
        text: 'Home',
        href: '/'
      },
      {
        current: true,
        text: 'Parliamentary Questions',
        href: '/parliamentary-question'
      },
      {
        current: false,
        text: 'About',
        href: '/about'
      }
    ])
  })
})

/**
 * @import { Request } from '@hapi/hapi'
 */
