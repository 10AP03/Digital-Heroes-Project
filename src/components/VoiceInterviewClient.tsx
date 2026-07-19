'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { submitAnswer, completeInterview } from '@/server/actions/interview'

type Question = { id: string; order: number; questionText: string }
type ExistingAnswer = { questionId: string; answerText: string }

export default function VoiceInterviewClient({
  interviewId,
  token,
  roleTitle,
  questions,
  existingAnswers,
}: {
  interviewId: string
  token: string
  roleTitle: string
  questions: Question[]
  existingAnswers: ExistingAnswer[]
}) {
  const router = useRouter()
  const sorted = [...questions].sort((a, b) => a.order - b.order)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answerText, setAnswerText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastInputMethod, setLastInputMethod] = useState<'voice' | 'typed'>('typed')

  const recognitionRef = useRef<any>(null)
  const shouldBeListeningRef = useRef(false)
  const finalTranscriptRef = useRef('')

  const current = sorted[currentIndex]
  const isLast = currentIndex === sorted.length - 1

  // Load any existing answer for this question (e.g. if candidate refreshed)
  useEffect(() => {
    const existing = existingAnswers.find((a) => a.questionId === current.id)
    setAnswerText(existing?.answerText ?? '')
  }, [current.id, existingAnswers])

  // Set up speech recognition once
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

   recognition.onresult = (event: any) => {
  let interimTranscript = ''
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i]
    if (result.isFinal) {
      finalTranscriptRef.current += result[0].transcript + ' '
    } else {
      interimTranscript += result[0].transcript
    }
  }
  setAnswerText((finalTranscriptRef.current + interimTranscript).trim())
  setLastInputMethod('voice')
}

recognition.onstart = () => {
  setIsRecording(true)
}

recognition.onerror = (event: any) => {
  console.log('Speech recognition error:', event.error)
  if (event.error === 'no-speech' || event.error === 'aborted') {
    return
  }
  shouldBeListeningRef.current = false
  setIsRecording(false)
}

recognition.onend = () => {
  console.log('Speech recognition ended. shouldBeListening:', shouldBeListeningRef.current) 
  if (shouldBeListeningRef.current) {
    setTimeout(() => {
      if (shouldBeListeningRef.current) {
        try {
          recognition.start()
        } catch (err) {
          console.error('Speech recognition restart failed:', err)
          shouldBeListeningRef.current = false
          setIsRecording(false)
        }
      }
    }, 250)
  } else {
    setIsRecording(false)
  }
}

recognitionRef.current = recognition

return () => {
  shouldBeListeningRef.current = false
  recognition.stop()
}
}, [])

const toggleRecording = useCallback(() => {
  if (!recognitionRef.current) return

  if (isRecording) {
    shouldBeListeningRef.current = false
    recognitionRef.current.stop()
    setIsRecording(false)
  } else {
    shouldBeListeningRef.current = true
    finalTranscriptRef.current = ''
    setAnswerText('')
    recognitionRef.current.start()
    setIsRecording(true)
  }
}, [isRecording])

  const handleNext = async () => {
    if (!answerText.trim()) return

    setIsSubmitting(true)
    try {
      await submitAnswer({
        interviewId,
        questionId: current.id,
        answerText: answerText.trim(),
        inputMethod: lastInputMethod,
      })

      if (isLast) {
        await completeInterview(interviewId)
        router.push(`/interview/${token}/done`)
        return
      }

      setCurrentIndex((i) => i + 1)
      setLastInputMethod('typed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-16 px-4">
      <div className="mb-6">
        <p className="text-sm text-gray-500">{roleTitle} — Interview</p>
        <p className="text-xs text-gray-400">
          Question {currentIndex + 1} of {sorted.length}
        </p>
        <div className="w-full bg-gray-100 h-1.5 rounded mt-2">
          <div
            className="bg-blue-600 h-1.5 rounded transition-all"
            style={{ width: `${((currentIndex + 1) / sorted.length) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="text-xl font-medium mb-4">{current.questionText}</h2>

      {!voiceSupported && (
        <p className="text-xs text-amber-600 mb-2">
          Voice input isn&apos;t supported in this browser. Please type your answer below.
        </p>
      )}

      {voiceSupported && (
        <button
          type="button"
          onClick={toggleRecording}
          className={`mb-3 px-4 py-2 rounded text-sm font-medium ${
            isRecording
              ? 'bg-red-100 text-red-700 border border-red-300'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {isRecording ? '● Stop recording' : '🎙 Start speaking'}
        </button>
      )}

      <textarea
        value={answerText}
        onChange={(e) => {
          setAnswerText(e.target.value)
          setLastInputMethod('typed')
        }}
        placeholder="Type your answer, or use the mic above"
        rows={6}
        className="w-full border border-gray-300 rounded p-3 text-sm"
      />

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={handleNext}
          disabled={!answerText.trim() || isSubmitting}
          className="px-5 py-2 bg-blue-600 text-white rounded disabled:opacity-40"
        >
          {isSubmitting ? 'Saving...' : isLast ? 'Submit Interview' : 'Next'}
        </button>
      </div>
    </div>
  )
}