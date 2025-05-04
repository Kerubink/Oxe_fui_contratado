// src/components/avaliacaoPage/ScoreExplanation.jsx
import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function ScoreExplanation({ text }) {
  const [open, setOpen] = useState(false)
  if (!text) return null

  return (
    <div className="mt-4 bg-gray-50 border-l-4 border-gray-200">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left flex items-center justify-between px-4 py-2 hover:bg-gray-100"
      >
        <span className="font-medium text-gray-700">Por que essa nota?</span>
        {open ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
      </button>
      {open && (
        <div className="px-4 py-2 text-gray-600 text-sm whitespace-pre-wrap">
          {text}
        </div>
      )}
    </div>
  )
}
