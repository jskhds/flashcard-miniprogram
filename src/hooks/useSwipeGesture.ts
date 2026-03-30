import { useState, useRef } from 'react'

const THRESHOLD = 40
const DIRECTION_THRESHOLD = 8

/**
 * 横向滑动手势 hook，管理"哪个条目当前处于滑开状态"。
 * 返回值可直接绑定到列表项的 onTouchStart / onTouchMove / onTouchEnd。
 * onLock/onUnlock 用于在检测到横向手势时通知父组件禁用垂直滚动。
 */
export function useSwipeGesture(onLock?: () => void, onUnlock?: () => void) {
  const [swipeOpen, setSwipeOpen] = useState<string | null>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const directionLocked = useRef(false)

  function handleTouchStart(e: any) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    directionLocked.current = false
  }

  function handleTouchMove(e: any) {
    if (directionLocked.current) return
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current)
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
    if (dx < DIRECTION_THRESHOLD && dy < DIRECTION_THRESHOLD) return
    directionLocked.current = true
    if (dx > dy) onLock?.()
  }

  function handleTouchEnd(e: any, id: string) {
    onUnlock?.()
    directionLocked.current = false
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -THRESHOLD) setSwipeOpen(id)
    else if (dx > THRESHOLD) setSwipeOpen(null)
  }

  return { swipeOpen, setSwipeOpen, handleTouchStart, handleTouchMove, handleTouchEnd }
}
