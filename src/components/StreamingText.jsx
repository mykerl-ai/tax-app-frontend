import { useState, useEffect } from 'react'

/**
 * StreamingText Component
 * Displays text with a ChatGPT-like typing effect
 * When streaming from server, shows text immediately as chunks arrive
 */
const StreamingText = ({ text, speed = 10, onComplete, className = '', isStreaming = false }) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!text) {
      setDisplayedText('')
      setIsComplete(false)
      return
    }

    // If streaming from server, display text immediately (server sends cumulative chunks)
    if (isStreaming) {
      setDisplayedText(text)
      setIsComplete(false)
      return
    }

    // Fallback: animate character by character if not streaming
    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1))
      }, speed)

      return () => clearTimeout(timeout)
    } else if (displayedText.length === text.length && !isComplete) {
      setIsComplete(true)
      onComplete?.()
    }
  }, [text, displayedText, speed, isComplete, onComplete, isStreaming])

  // Format markdown-like syntax
  const formatText = (txt) => {
    return txt
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />')
  }

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ 
        __html: formatText(displayedText) + (!isComplete ? '<span class="animate-pulse text-primary-600 dark:text-primary-400">|</span>' : '')
      }}
    />
  )
}

export default StreamingText

