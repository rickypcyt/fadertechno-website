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
  // Repetimos los items hasta tener una "copia" lo suficientemente ancha
  // para cubrir viewports grandes (ultrawide). Con 12 items por copia y
  // fuente max 5rem, una copia ~3360px > cualquier viewport común.
  // Luego duplicamos la copia para el loop seamless de -50% -> 0.
  const minItemsPerCopy = 12
  const repeatsPerCopy = Math.max(
    1,
    Math.ceil(minItemsPerCopy / items.length)
  )
  const copy = Array.from({ length: repeatsPerCopy }, () => items).flat()
  const content = [...copy, ...copy]

  // Escala la duración proporcionalmente al número de items por copia
  // para mantener la misma velocidad visual sin importar las repeticiones.
  // speed se interpreta como "segundos por 6 items", base de referencia.
  const baseItems = 6
  const scaledDuration = (speed * copy.length) / baseItems

  return (
    <div className="marquee" style={{ opacity }}>
      <div
        className="marquee-track marquee-track-auto"
        style={{ animationDuration: `${scaledDuration}s` }}
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
