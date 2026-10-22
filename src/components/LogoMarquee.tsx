const marqueeItems = [
  { label: 'UC Berkeley', active: true },
  { label: 'Stanford University', active: false },
  { label: 'MIT', active: false },
  { label: 'Carnegie Mellon', active: false },
  { label: 'Y Combinator', active: false },
  { label: 'Cornell University', active: false },
  { label: 'UCLA', active: false },
  { label: 'Georgia Tech', active: false },
  { label: 'NYU', active: false },
  { label: 'Northeastern', active: false },
]

function MarqueeLabel({ item }: { item: (typeof marqueeItems)[number] }) {
  if (item.active) {
    return (
      <span className="flex items-center gap-2 whitespace-nowrap text-base font-bold text-teal">
        <span className="animate-pulse-dot h-2 w-2 flex-shrink-0 rounded-full bg-teal" />
        {item.label}
      </span>
    )
  }
  return (
    <span className="whitespace-nowrap text-base font-medium text-slate/30">
      {item.label}
    </span>
  )
}

function MarqueeItems() {
  const loop = [...marqueeItems, ...marqueeItems]

  return (
    <>
      {loop.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex shrink-0 items-center">
          {i > 0 ? (
            <span className="mx-4 text-slate/20">·</span>
          ) : null}
          <MarqueeLabel item={item} />
        </span>
      ))}
    </>
  )
}

export default function LogoMarquee() {
  return (
    <section className="relative overflow-hidden border-y border-line bg-white py-12">
      <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-widest text-slate/40">
        CURRENTLY ACCEPTING STUDENTS FROM
      </p>
      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
        <div className="flex w-max animate-marquee select-none items-center">
          <MarqueeItems />
        </div>
      </div>
    </section>
  )
}
