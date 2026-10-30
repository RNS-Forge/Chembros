'use client'
import React, { useRef, useEffect } from 'react'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

export default function OtpInput({
  length = 6,
  value = '',
  onChange,
  disabled = false,
  autoFocus = true,
  className = '',
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  // Ensure digits array matches exact length
  const digits = Array.from({ length }, (_, i) => value[i] || '')

  useEffect(() => {
    if (autoFocus && inputsRef.current[0] && !disabled) {
      inputsRef.current[0].focus()
    }
  }, [autoFocus, disabled])

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    // If user pasted or typed multiple characters
    const cleanDigits = rawVal.replace(/\D/g, '')

    if (cleanDigits.length > 1) {
      handlePastedDigits(cleanDigits, index)
      return
    }

    const nextDigits = [...digits]
    nextDigits[index] = cleanDigits.slice(-1) // Take the last entered digit
    const nextVal = nextDigits.join('')
    onChange(nextVal)

    // Auto-advance to next input if digit entered
    if (cleanDigits && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current box is empty, jump to previous box and clear it
        e.preventDefault()
        const nextDigits = [...digits]
        nextDigits[index - 1] = ''
        onChange(nextDigits.join(''))
        inputsRef.current[index - 1]?.focus()
      } else if (digits[index]) {
        // Clear current box without jumping back
        e.preventDefault()
        const nextDigits = [...digits]
        nextDigits[index] = ''
        onChange(nextDigits.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePastedDigits = (pastedText: string, startIndex: number = 0) => {
    const clean = pastedText.replace(/\D/g, '')
    if (!clean) return

    const nextDigits = [...digits]
    let focusTargetIndex = startIndex

    for (let i = 0; i < clean.length && startIndex + i < length; i++) {
      nextDigits[startIndex + i] = clean[i]
      focusTargetIndex = startIndex + i
    }

    const nextVal = nextDigits.join('')
    onChange(nextVal)

    // Focus either the box following the last pasted digit or the last box
    const nextFocus = Math.min(focusTargetIndex + 1, length - 1)
    setTimeout(() => {
      inputsRef.current[nextFocus]?.focus()
      inputsRef.current[nextFocus]?.select()
    }, 0)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    // If pasting from any box, if it is a 6-digit code, fill from start (box 0)
    const clean = pasted.replace(/\D/g, '')
    if (clean.length === length) {
      handlePastedDigits(clean, 0)
    } else {
      handlePastedDigits(clean, index)
    }
  }

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-2.5 ${className}`}>
      {Array.from({ length }).map((_, index) => {
        const hasValue = !!digits[index]
        return (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            value={digits[index]}
            disabled={disabled}
            onChange={(e) => handleInputChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={(e) => handlePaste(e, index)}
            onFocus={(e) => e.target.select()}
            className={`w-11 sm:w-12 h-14 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl sm:rounded-2xl transition-all outline-none ${
              hasValue
                ? 'bg-white border-2 border-black text-black shadow-sm'
                : 'bg-[#FAFBFB] border border-black/15 text-black hover:border-black/30 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          />
        )
      })}
    </div>
  )
}

