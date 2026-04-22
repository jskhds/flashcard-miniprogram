/* eslint-disable no-undef */
declare const wx: any
import { useState, useEffect, useRef } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { getCards, createCard, updateCard, deleteCard } from '@/api/cards'
import { lookupWord } from '@/api/lookup'
import { fetchTTS } from '@/api/tts'
import { BASE_URL } from '@/api/request'
import { loginReady } from '@/utils/loginReady'

const KANA_AUDIO_SET = new Set([
  'a','i','u','e','o',
  'ba','be','bi','bo','bu','bya','byo','byu',
  'ci','cu','cya','cyo','cyu',
  'da','de','di','do','du',
  'ga','ge','gi','go','gu','gya','gyo','gyu',
  'ha','he','hi','ho','hu','hya','hyo','hyu',
  'ka','ke','ki','ko','ku','kya','kyo','kyu',
  'ma','me','mi','mo','mu','mya','myo','myu',
  'n','na','ne','ni','no','nu','nya','nyo','nyu',
  'pa','pe','pi','po','pu','pya','pyo','pyu',
  'ra','re','ri','ro','ru','rya','ryo','ryu',
  'sa','se','si','so','su','sya','syo','syu',
  'ta','te','to',
  'u','wa','ya','yo','yu',
  'za','ze','zi','zo','zu','zya','zyo','zyu',
])
import CardEditForm from './components/CardEditForm'
import './index.scss'

export default function CardEdit() {
  const router = useRouter()
  const deckId = router.params.deckId as string
  const cardId = router.params.cardId as string
  const isEdit = !!cardId
  const isJa = (router.params.deckType ?? 'general') === 'ja'

  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [reading, setReading] = useState('')
  const [romaji, setRomaji] = useState('')
  const [pitch, setPitch] = useState('')
  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState('')
  const [frontError, setFrontError] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupResult, setLookupResult] = useState<{ reading: string; romaji: string; meaning: string } | null>(null)
  const [ttsLoading, setTtsLoading] = useState(false)
  const audioRef = useRef<Taro.InnerAudioContext | null>(null)

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: isEdit ? '编辑卡片' : '新建卡片' })
    if (isEdit) {
      loginReady.then(async () => {
        const cards = await getCards(deckId)
        const card = cards.find(c => c._id === cardId)
        if (card) {
          setFront(card.front)
          setBack(card.back)
          setReading(card.reading ?? '')
          setRomaji(card.romaji ?? '')
          setPitch(card.pitch != null ? String(card.pitch) : '')
          setMeaning(card.meaning ?? '')
          setExample(card.example ?? '')
        }
      })
    }
  }, [])

  const isValid = front.trim().length > 0 && back.trim().length > 0

  const buildFields = () => ({
    front: front.trim(),
    back: back.trim(),
    reading: reading.trim() || undefined,
    romaji: romaji.trim() || undefined,
    pitch: pitch !== '' ? Number(pitch) : undefined,
    meaning: meaning.trim() || undefined,
    example: example.trim() || undefined,
  })

  const handleLookup = async () => {
    if (!front.trim() || lookupLoading) return
    setLookupLoading(true)
    setLookupResult(null)
    try {
      await loginReady
      const res = await lookupWord(front.trim())
      setLookupResult({ reading: res.reading, romaji: res.romaji, meaning: res.meaning })
    } catch (e: any) {
      Taro.showToast({ title: e.message ?? '查词失败', icon: 'none' })
    } finally {
      setLookupLoading(false)
    }
  }

  const handleLookupImport = () => {
    if (!lookupResult) return
    setReading(lookupResult.romaji)
    setRomaji(lookupResult.romaji)
    setMeaning(lookupResult.meaning)
    if (!back.trim()) setBack(lookupResult.meaning)
    setLookupResult(null)
  }

  const handlePlayReadingTTS = async () => {
    if (!reading.trim() || ttsLoading) return
    setTtsLoading(true)
    if (audioRef.current) {
      audioRef.current.stop()
      audioRef.current.destroy()
      audioRef.current = null
    }
    try {
      if (KANA_AUDIO_SET.has(reading.trim())) {
        const audioBase = BASE_URL.replace('/api', '')
        const ctx = Taro.createInnerAudioContext()
        ctx.obeyMuteSwitch = false
        audioRef.current = ctx
        ctx.onError((res: any) => {
          Taro.showToast({ title: `播放错误: ${res.errMsg}`, icon: 'none' })
        })
        ctx.src = `${audioBase}/audio/${reading.trim()}.mp3`
        ctx.play()
        return
      }
      const { audio } = await fetchTTS(front.trim())
      const fs = wx.getFileSystemManager()
      const dir = wx.env.USER_DATA_PATH
      await new Promise<void>((resolve) => {
        fs.readdir({
          dirPath: dir,
          success: ({ files }: { files: string[] }) => {
            files.filter((f: string) => f.startsWith('tts_')).forEach((f: string) => {
              try { fs.unlinkSync(`${dir}/${f}`) } catch (_) {}
            })
            resolve()
          },
          fail: () => resolve(),
        })
      })
      const tmpPath = `${dir}/tts_${Date.now()}.mp3`
      await new Promise<void>((resolve, reject) => {
        fs.writeFile({ filePath: tmpPath, data: audio, encoding: 'base64', success: () => resolve(), fail: (e: any) => reject(new Error(e.errMsg)) })
      })
      const ctx = Taro.createInnerAudioContext()
      ctx.obeyMuteSwitch = false
      audioRef.current = ctx
      ctx.src = tmpPath
      ctx.play()
    } catch (e: any) {
      Taro.showToast({ title: e.message ?? 'TTS 失败', icon: 'none' })
    } finally {
      setTtsLoading(false)
    }
  }

  const handleSaveAndContinue = async () => {
    if (!isValid) return
    try {
      await createCard(deckId, buildFields())
      Taro.showToast({ title: '已创建，继续添加', icon: 'success' })
      setFront('')
      setBack('')
      setReading('')
      setRomaji('')
      setPitch('')
      setMeaning('')
      setExample('')
      setFrontError('')
      setLookupResult(null)
    } catch (e: any) {
      setFrontError(e.message ?? '创建失败')
    }
  }

  const handleSave = async () => {
    if (!isValid) return
    try {
      if (isEdit) {
        await updateCard(deckId, cardId, buildFields())
      } else {
        await createCard(deckId, buildFields())
      }
      Taro.showToast({ title: isEdit ? '已保存' : '卡片已创建', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 800)
    } catch (e: any) {
      setFrontError(e.message ?? '保存失败')
    }
  }

  const handleDelete = () => {
    Taro.showModal({
      title: '删除卡片',
      content: '确认删除这张卡片？',
      confirmText: '删除',
      confirmColor: '#FF3B30',
      success: async (res) => {
        if (res.confirm) {
          await deleteCard(deckId, cardId)
          Taro.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => Taro.navigateBack(), 800)
        }
      }
    })
  }

  return (
    <CardEditForm
      front={front}
      back={back}
      reading={reading}
      romaji={romaji}
      pitch={pitch}
      meaning={meaning}
      example={example}
      frontError={frontError}
      isEdit={isEdit}
      isValid={isValid}
      isJa={isJa}
      lookupLoading={lookupLoading}
      ttsLoading={ttsLoading}
      lookupResult={lookupResult}
      onFrontChange={(val) => { setFront(val); setFrontError('') }}
      onBackChange={setBack}
      onReadingChange={(val) => { setReading(val); setRomaji(val) }}
      onRomajiChange={setRomaji}
      onPitchChange={setPitch}
      onMeaningChange={setMeaning}
      onExampleChange={setExample}
      onLookup={handleLookup}
      onLookupImport={handleLookupImport}
      onLookupDismiss={() => setLookupResult(null)}
      onPlayReadingTTS={handlePlayReadingTTS}
      onSave={handleSave}
      onSaveAndContinue={handleSaveAndContinue}
      onDelete={handleDelete}
    />
  )
}
