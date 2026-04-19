import { useState, useRef } from 'react'

const THRESHOLD = 40

/**
 * 横向滑动手势 hook，管理"哪个条目当前处于滑开状态"。
 * 返回值可直接绑定到列表项的 onTouchStart / onTouchEnd。
 */
export function useSwipeGesture() {
  const [swipeOpen, setSwipeOpen] = useState<string | null>(null)
  const touchStartX = useRef(0)

  function handleTouchStart(e: any) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: any, id: string) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -THRESHOLD) setSwipeOpen(id)
    else if (dx > THRESHOLD) setSwipeOpen(null)
  }

  return { swipeOpen, setSwipeOpen, handleTouchStart, handleTouchEnd }
}
