import type { ReactNode } from 'react'
export function StudioHeader({ eyebrow, title, description, symbol }: { eyebrow: ReactNode; title: string; description: ReactNode; symbol: string }) {
  return <header className="page-header studio-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="muted">{description}</p></div><div className="studio-header-art" aria-hidden="true"><span>{symbol}</span><i /><b>ONE LITTLE STEP</b></div></header>
}
