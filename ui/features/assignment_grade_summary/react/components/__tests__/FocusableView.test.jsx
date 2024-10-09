/*
 * Copyright (C) 2024 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react'
import {createEvent, fireEvent, render} from '@testing-library/react'

import FocusableView from '../FocusableView'

describe('GradeSummary FocusableView', () => {
  let renderChildren
  let wrapper

  function mountComponent() {
    wrapper = render(<FocusableView>{renderChildren}</FocusableView>)
  }

  const keyCodeMap = {
    down: 40,
    left: 37,
    right: 39,
    up: 38,
  }

  async function scroll(direction) {
    const focusableView = wrapper.container.querySelector('.FocusableView')
    const preventDefault = jest.fn()
    const keyEvent = createEvent.keyDown(focusableView, {
      keyCode: keyCodeMap[direction],
      preventDefault,
    })
    fireEvent(focusableView, keyEvent)
    return keyEvent
  }

  function horizontalScrollTarget() {
    return wrapper.container.querySelector('.HorizontalTarget')
  }

  function verticalScrollTarget() {
    return wrapper.container.querySelector('.VerticalTarget')
  }

  test('is focusable', () => {
    renderChildren = () => <span>Example</span>
    mountComponent()
    const node = wrapper.container.querySelector('.FocusableView')
    node.focus()
    expect(node).toBe(document.activeElement)
  })

  test('is focusable via tabbing', () => {
    renderChildren = () => <span>Example</span>
    mountComponent()
    const node = wrapper.container.querySelector('.FocusableView')
    expect(node.getAttribute('tabindex')).toBe('0')
  })

  describe('when given a horizontal scroll reference', () => {
    const scrollTargetStyle = {height: '100px', overflow: 'auto', width: '100px'}
    const scrollContentStyle = {height: '500px', width: '500px'}

    let maxScrollLeft

    beforeEach(() => {
      renderChildren = props => (
        <div className="HorizontalTarget" ref={props.horizontalScrollRef} style={scrollTargetStyle}>
          <div style={scrollContentStyle} />
        </div>
      )
      mountComponent()

      if (maxScrollLeft == null) {
        maxScrollLeft = 500 - horizontalScrollTarget().clientWidth
      }
    })

    test('scrolls right on the scroll target', async () => {
      jest.spyOn(horizontalScrollTarget(), 'clientWidth', 'get').mockImplementation(() => 450)
      jest.spyOn(horizontalScrollTarget(), 'scrollWidth', 'get').mockImplementation(() => 500)
      await scroll('right')
      expect(horizontalScrollTarget().scrollLeft).toBe(50)
    })

    test('prevents default event behavior when scrolling right', async () => {
      jest.spyOn(horizontalScrollTarget(), 'clientWidth', 'get').mockImplementation(() => 450)
      jest.spyOn(horizontalScrollTarget(), 'scrollWidth', 'get').mockImplementation(() => 500)
      const event = await scroll('right')
      expect(event.defaultPrevented).toBe(true)
    })

    test('stops scrolling right at the rightmost limit', async () => {
      jest.spyOn(horizontalScrollTarget(), 'scrollLeft', 'get').mockImplementation(() => 500)
      horizontalScrollTarget().scrollLeft = maxScrollLeft - 10
      await scroll('right')
      expect(horizontalScrollTarget().scrollLeft).toBe(maxScrollLeft)
    })

    test('prevents default event behavior when scrolling to the rightmost limit', async () => {
      jest.spyOn(horizontalScrollTarget(), 'clientWidth', 'get').mockImplementation(() => 0)
      jest.spyOn(horizontalScrollTarget(), 'scrollWidth', 'get').mockImplementation(() => 500)
      horizontalScrollTarget().scrollLeft = maxScrollLeft - 10
      const event = await scroll('right')
      expect(event.defaultPrevented).toBe(true)
    })

    test('does not scroll beyond the rightmost limit', async () => {
      horizontalScrollTarget().scrollLeft = maxScrollLeft
      await scroll('right')
      expect(horizontalScrollTarget().scrollLeft).toBe(maxScrollLeft)
    })

    test('does not prevent default event behavior when stopped at the rightmost limit', async () => {
      horizontalScrollTarget().scrollLeft = maxScrollLeft
      const event = await scroll('right')
      expect(event.defaultPrevented).toBe(false)
    })

    test('scrolls left on the scroll target', async () => {
      horizontalScrollTarget().scrollLeft = 250
      await scroll('left')
      expect(horizontalScrollTarget().scrollLeft).toBe(200)
    })

    test('prevents default event behavior when scrolling left', async () => {
      horizontalScrollTarget().scrollLeft = 250
      const event = await scroll('left')
      expect(event.defaultPrevented).toBe(true)
    })

    test('stops scrolling left at the leftmost limit', async () => {
      jest.spyOn(horizontalScrollTarget(), 'scrollLeft', 'get').mockImplementation(() => 0)
      horizontalScrollTarget().scrollLeft = 10
      await scroll('left')
      expect(horizontalScrollTarget().scrollLeft).toBe(0)
    })

    test('prevents default event behavior when scrolling to the leftmost limit', async () => {
      horizontalScrollTarget().scrollLeft = 10
      const event = await scroll('left')
      expect(event.defaultPrevented).toBe(true)
    })

    test('does not scroll beyond the leftmost limit', async () => {
      horizontalScrollTarget().scrollLeft = 0
      await scroll('left')
      expect(horizontalScrollTarget().scrollLeft).toBe(0)
    })

    test('does not prevent default event behavior when stopped at the leftmost limit', async () => {
      horizontalScrollTarget().scrollLeft = 0
      const event = await scroll('left')
      expect(event.defaultPrevented).toBe(false)
    })

    test('does not scroll down', async () => {
      await scroll('down')
      expect(horizontalScrollTarget().scrollTop).toBe(0)
    })

    test('does not prevent default event behavior for down arrow', async () => {
      horizontalScrollTarget().scrollLeft = 0
      const event = await scroll('down')
      expect(event.defaultPrevented).toBe(false)
    })

    test('does not scroll up', async () => {
      horizontalScrollTarget().scrollTop = 100
      await scroll('up')
      expect(horizontalScrollTarget().scrollTop).toBe(100)
    })

    test('does not prevent default event behavior for up arrow', async () => {
      horizontalScrollTarget().scrollTop = 100
      const event = await scroll('up')
      expect(event.defaultPrevented).toBe(false)
    })
  })

  describe('when given a vertical scroll reference', () => {
    const scrollTargetStyle = {height: '100px', overflow: 'auto', width: '100px'}
    const scrollContentStyle = {height: '500px', width: '500px'}

    let maxScrollTop

    beforeEach(() => {
      renderChildren = props => (
        <div className="VerticalTarget" ref={props.verticalScrollRef} style={scrollTargetStyle}>
          <div style={scrollContentStyle} />
        </div>
      )
      mountComponent()

      if (maxScrollTop == null) {
        maxScrollTop = 500 - verticalScrollTarget().clientHeight
      }
    })

    test('scrolls down on the scroll target', async () => {
      jest.spyOn(verticalScrollTarget(), 'clientHeight', 'get').mockImplementation(() => 450)
      jest.spyOn(verticalScrollTarget(), 'scrollHeight', 'get').mockImplementation(() => 500)
      await scroll('down')
      expect(verticalScrollTarget().scrollTop).toBe(50)
    })

    test('prevents default event behavior when scrolling down', async () => {
      jest.spyOn(verticalScrollTarget(), 'clientHeight', 'get').mockImplementation(() => 450)
      jest.spyOn(verticalScrollTarget(), 'scrollHeight', 'get').mockImplementation(() => 500)
      const event = await scroll('down')
      expect(event.defaultPrevented).toBe(true)
    })

    test('stops scrolling down at the bottommost limit', async () => {
      jest.spyOn(verticalScrollTarget(), 'scrollTop', 'get').mockImplementation(() => 500)
      verticalScrollTarget().scrollTop = maxScrollTop - 10
      await scroll('down')
      expect(verticalScrollTarget().scrollTop).toBe(maxScrollTop)
    })

    test('prevents default event behavior when scrolling to the bottommost limit', async () => {
      jest.spyOn(verticalScrollTarget(), 'scrollHeight', 'get').mockImplementation(() => 500)
      verticalScrollTarget().scrollTop = maxScrollTop - 10
      const event = await scroll('down')
      expect(event.defaultPrevented).toBe(true)
    })

    test('does not scroll beyond the bottommost limit', async () => {
      verticalScrollTarget().scrollTop = maxScrollTop
      await scroll('down')
      expect(verticalScrollTarget().scrollTop).toBe(maxScrollTop)
    })

    test('does not prevent default event behavior when stopped at the bottommost limit', async () => {
      verticalScrollTarget().scrollTop = maxScrollTop
      const event = await scroll('down')
      expect(event.defaultPrevented).toBe(false)
    })

    test('scrolls up on the scroll target', async () => {
      verticalScrollTarget().scrollTop = 250
      await scroll('up')
      expect(verticalScrollTarget().scrollTop).toBe(200)
    })

    test('prevents default event behavior when scrolling up', async () => {
      verticalScrollTarget().scrollTop = 250
      const event = await scroll('up')
      expect(event.defaultPrevented).toBe(true)
    })

    test('stops scrolling up at the topmost limit', async () => {
      jest.spyOn(verticalScrollTarget(), 'scrollTop', 'get').mockImplementation(() => 0)
      verticalScrollTarget().scrollTop = 10
      await scroll('up')
      expect(verticalScrollTarget().scrollTop).toBe(0)
    })

    test('prevents default event behavior when scrolling to the topmost limit', async () => {
      verticalScrollTarget().scrollTop = 10
      const event = await scroll('up')
      expect(event.defaultPrevented).toBe(true)
    })

    test('does not scroll beyond the topmost limit', async () => {
      verticalScrollTarget().scrollTop = 0
      await scroll('up')
      expect(verticalScrollTarget().scrollTop).toBe(0)
    })

    test('does not prevent default event behavior when stopped at the topmost limit', async () => {
      verticalScrollTarget().scrollTop = 0
      const event = await scroll('up')
      expect(event.defaultPrevented).toBe(false)
    })

    test('does not scroll right', async () => {
      await scroll('right')
      expect(verticalScrollTarget().scrollLeft).toBe(0)
    })

    test('does not prevent default event behavior for right arrow', async () => {
      const event = await scroll('right')
      expect(event.defaultPrevented).toBe(false)
    })

    test('does not scroll left', async () => {
      verticalScrollTarget().scrollLeft = 100
      await scroll('left')
      expect(verticalScrollTarget().scrollLeft).toBe(100)
    })

    test('does not prevent default event behavior for left arrow', async () => {
      verticalScrollTarget().scrollLeft = 100
      const event = await scroll('left')
      expect(event.defaultPrevented).toBe(false)
    })
  })

  describe('when given the same horizontal and vertical scroll reference', () => {
    const scrollTargetStyle = {height: '200px', overflow: 'auto', width: '200px'}
    const scrollContentStyle = {height: '500px', width: '500px'}

    beforeEach(() => {
      renderChildren = props => {
        const bindRefs = ref => {
          props.horizontalScrollRef(ref)
          props.verticalScrollRef(ref)
        }

        return (
          <div className="HorizontalTarget VerticalTarget" ref={bindRefs} style={scrollTargetStyle}>
            <div style={scrollContentStyle} />
          </div>
        )
      }
      mountComponent()
    })

    test('scrolls right on the scroll target', async () => {
      jest.spyOn(horizontalScrollTarget(), 'clientWidth', 'get').mockImplementation(() => 450)
      jest.spyOn(horizontalScrollTarget(), 'scrollWidth', 'get').mockImplementation(() => 500)
      await scroll('right')
      expect(horizontalScrollTarget().scrollLeft).toBe(50)
    })

    test('scrolls left on the scroll target', async () => {
      horizontalScrollTarget().scrollLeft = 250
      await scroll('left')
      expect(horizontalScrollTarget().scrollLeft).toBe(200)
    })

    test('scrolls down on the scroll target', async () => {
      jest.spyOn(verticalScrollTarget(), 'clientHeight', 'get').mockImplementation(() => 450)
      jest.spyOn(verticalScrollTarget(), 'scrollHeight', 'get').mockImplementation(() => 500)
      await scroll('down')
      expect(verticalScrollTarget().scrollTop).toBe(50)
    })

    test('scrolls up on the scroll target', async () => {
      verticalScrollTarget().scrollTop = 250
      await scroll('up')
      expect(verticalScrollTarget().scrollTop).toBe(200)
    })
  })

  describe('when given different horizontal and vertical scroll references', () => {
    const scrollTargetStyle = {height: '200px', overflow: 'auto', width: '200px'}
    const scrollContentStyle = {height: '500px', width: '500px'}

    beforeEach(() => {
      renderChildren = props => (
        <div>
          <div className="VerticalTarget" ref={props.verticalScrollRef} style={scrollTargetStyle}>
            <div style={scrollContentStyle} />
          </div>

          <div
            className="HorizontalTarget"
            ref={props.horizontalScrollRef}
            style={scrollTargetStyle}
          >
            <div style={scrollContentStyle} />
          </div>
        </div>
      )
      mountComponent()
    })

    test('scrolls right on the horizontal scroll target', async () => {
      jest.spyOn(horizontalScrollTarget(), 'clientWidth', 'get').mockImplementation(() => 450)
      jest.spyOn(horizontalScrollTarget(), 'scrollWidth', 'get').mockImplementation(() => 500)
      await scroll('right')
      expect(horizontalScrollTarget().scrollLeft).toBe(50)
    })

    test('does not scroll the vertical target right', async () => {
      await scroll('right')
      expect(verticalScrollTarget().scrollLeft).toBe(0)
    })

    test('scrolls left on the horizontal scroll target', async () => {
      horizontalScrollTarget().scrollLeft = 250
      await scroll('left')
      expect(horizontalScrollTarget().scrollLeft).toBe(200)
    })

    test('does not scroll the vertical target left', async () => {
      verticalScrollTarget().scrollLeft = 100
      await scroll('left')
      expect(verticalScrollTarget().scrollLeft).toBe(100)
    })

    test('scrolls down on the vertical scroll target', async () => {
      jest.spyOn(verticalScrollTarget(), 'clientHeight', 'get').mockImplementation(() => 450)
      jest.spyOn(verticalScrollTarget(), 'scrollHeight', 'get').mockImplementation(() => 500)
      await scroll('down')
      expect(verticalScrollTarget().scrollTop).toBe(50)
    })

    test('does not scroll the horizontal target down', async () => {
      await scroll('down')
      expect(horizontalScrollTarget().scrollTop).toBe(0)
    })

    test('scrolls up on the vertical scroll target', async () => {
      verticalScrollTarget().scrollTop = 250
      await scroll('up')
      expect(verticalScrollTarget().scrollTop).toBe(200)
    })

    test('does not scroll the horizontal target up', async () => {
      horizontalScrollTarget().scrollTop = 250
      await scroll('up')
      expect(horizontalScrollTarget().scrollTop).toBe(250)
    })
  })
})
