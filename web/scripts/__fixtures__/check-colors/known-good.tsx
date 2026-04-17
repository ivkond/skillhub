import React from 'react'

export function KnownGoodColorUsage() {
  return (
    <section className="rounded-lg border border-stroke bg-surface-1 text-content-primary">
      <h3 className="text-content-secondary">Semantic tokens only</h3>
      <button
        className="bg-action-primary text-primary-foreground hover:bg-action-primary-hover"
        style={{ color: 'hsl(var(--content-primary))', borderColor: 'var(--stroke-default)' }}
      >
        Apply
      </button>
    </section>
  )
}
