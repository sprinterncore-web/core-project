const items = [
  { label: 'Bland', weight: 'font-bold' },
  { label: 'DualEntry', weight: 'font-semibold' },
  { label: 'rocketlane', weight: 'font-extrabold' },
  { label: 'UC Berkeley', weight: 'font-semibold' },
  { label: 'Stanford', weight: 'font-bold' },
  { label: 'Y Combinator', weight: 'font-bold' },
  { label: 'Notion', weight: 'font-semibold' },
  { label: 'Linear', weight: 'font-medium' },
  { label: 'Carnegie Mellon', weight: 'font-semibold' },
  { label: 'MIT', weight: 'font-bold' },
]

function MarqueeItems() {
  const renderSet = (keyPrefix: string) =>
    items.map((item, i) => (
      <span key={`${keyPrefix}-${item.label}`} className="flex shrink-0 items-center">
        {i > 0 && <span className="mx-2 shrink-0 text-lg text-line">·</span>}
        <span className={`whitespace-nowrap text-base text-slate/40 ${item.weight}`}>
          {item.label}
        </span>
      </span>
    ))

  return (
    <>
      {renderSet('a')}
      {renderSet('b')}
    </>
  )
}

export default function LogoMarquee() {
  return (
    <section className="relative overflow-hidden border-y border-line bg-white py-12">
      <p className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate/50">
        TRUSTED BY HIGH-GROWTH STARTUPS & UNIVERSITY PARTNERS
      </p>
      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
        <div className="flex w-max animate-marquee select-none items-center gap-16">
          <MarqueeItems />
        </div>
      </div>
    </section>
  )
}
