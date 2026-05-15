'use client'
import { useState, type ReactNode } from 'react'

export type Tab = { id: string; label: string; content: ReactNode }

export function TabPanel({ tabs, initialId }: { tabs: Tab[]; initialId?: string }) {
  const [active, setActive] = useState(initialId ?? tabs[0]?.id)
  const current = tabs.find(t => t.id === active) ?? tabs[0]

  return (
    <div className="rounded-lg border border-ink-muted/30 bg-bg-card">
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-ink-muted/30 p-1">
        {tabs.map(tab => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className={
                'rounded px-3 py-1.5 text-sm font-medium transition ' +
                (isActive
                  ? 'bg-brand text-white'
                  : 'text-ink-dim hover:bg-bg-soft hover:text-ink')
              }
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" className="prose-aprende max-h-[70vh] overflow-y-auto p-4">
        {current?.content}
      </div>
    </div>
  )
}
