interface MarqueeProps {
  items: string[]
  speed?: number
  opacity?: number
}

export default function Marquee({
  items,
  speed = 50,
  opacity = 0.06,
}: MarqueeProps) {
  // Dos copias exactas para un loop seamless de -50% -> 0
  const content = [...items, ...items]

  return (
    <div className="marquee" style={{ opacity }}>
      <div
        className="marquee-track marquee-track-auto"
        style={{ animationDuration: `${speed}s` }}
      >
        {content.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
