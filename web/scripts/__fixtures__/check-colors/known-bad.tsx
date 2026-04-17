import React from 'react'

export function KnownBadColorUsage() {
  return (
    <section className="rounded-lg bg-blue-100 text-content-primary">
      <button
        className="text-red-600 border-emerald-500/20"
        style={{ color: '#fff', backgroundColor: 'rgb(23, 45, 67)' }}
      >
        Broken
      </button>
    </section>
  )
}
