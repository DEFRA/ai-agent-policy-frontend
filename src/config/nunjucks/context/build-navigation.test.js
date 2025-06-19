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
        text: 'Parliamentary Answers',
        href: '/parliamentary-answer'
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
        text: 'Parliamentary Answers',
        href: '/parliamentary-answer'
      },
      {
        current: false,
        text: 'About',
        href: '/about'
      }
    ])
  })

  test('Should provide expected highlighted navigation details for parliamentary answers', () => {
    expect(
      buildNavigation(mockRequest({ path: '/parliamentary-answer' }))
    ).toEqual([
      {
        current: false,
        text: 'Home',
        href: '/'
      },
      {
        current: true,
        text: 'Parliamentary Answers',
        href: '/parliamentary-answer'
      },
      {
        current: false,
        text: 'About',
        href: '/about'
      }
    ])
  })

  test('Should highlight parliamentary answers for sub-paths', () => {
    expect(
      buildNavigation(mockRequest({ path: '/parliamentary-answer/results' }))
    ).toEqual([
      {
        current: false,
        text: 'Home',
        href: '/'
      },
      {
        current: true,
        text: 'Parliamentary Answers',
        href: '/parliamentary-answer'
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
