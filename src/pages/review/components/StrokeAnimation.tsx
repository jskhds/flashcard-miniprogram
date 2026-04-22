import { useEffect, useRef } from 'react'
import { View, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'

interface StrokeAnimationProps {
  character: string
}

const CANVAS_ID = 'stroke-canvas'
const SIZE = 200

export default function StrokeAnimation({ character }: StrokeAnimationProps) {
  const writerRef = useRef<any>(null)

  const initWriter = () => {
    const query = Taro.createSelectorQuery()
    query.select(`#${CANVAS_ID}`).fields({ node: true, size: true }).exec((res) => {
      if (!res[0] || !res[0].node) return
      const canvas = res[0].node
      const HanziWriter = require('hanzi-writer-miniprogram')
      writerRef.current = HanziWriter.default.create(canvas, character, {
        width: SIZE,
        height: SIZE,
        padding: 5,
        showOutline: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 100,
      })
      writerRef.current.animateCharacter()
    })
  }

  const handleReplay = () => {
    writerRef.current?.animateCharacter()
  }

  useEffect(() => {
    initWriter()
    return () => {
      writerRef.current = null
    }
  }, [character])

  return (
    <View className='stroke-animation'>
      <Canvas
        id={CANVAS_ID}
        type='2d'
        style={{ width: `${SIZE}px`, height: `${SIZE}px` }}
      />
      <View className='stroke-animation__replay' onClick={handleReplay}>
        <View className='stroke-animation__replay-text'>重播</View>
      </View>
    </View>
  )
}
