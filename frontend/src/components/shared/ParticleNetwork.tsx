import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

interface Props {
  className?: string
  particleCount?: number
  connectionDistance?: number
  mouseRadius?: number
  color?: string
}

export default function ParticleNetwork({
  className = '',
  particleCount = 45,
  connectionDistance = 120,
  mouseRadius = 180,
  color = '59,108,231',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
      })
    }
    particlesRef.current = particles
  }, [particleCount])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const parent = canvas.parentElement
    if (!parent) return

    function resize() {
      const rect = parent!.getBoundingClientRect()
      canvas!.width = rect.width * devicePixelRatio
      canvas!.height = rect.height * devicePixelRatio
      canvas!.style.width = rect.width + 'px'
      canvas!.style.height = rect.height + 'px'
      ctx!.scale(devicePixelRatio, devicePixelRatio)
    }

    resize()
    const rect = parent.getBoundingClientRect()
    initParticles(rect.width, rect.height)

    function onMouseMove(e: MouseEvent) {
      const r = parent!.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    function onMouseLeave() {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    parent.addEventListener('mousemove', onMouseMove)
    parent.addEventListener('mouseleave', onMouseLeave)

    const resizeObserver = new ResizeObserver(() => {
      resize()
      const r = parent.getBoundingClientRect()
      initParticles(r.width, r.height)
    })
    resizeObserver.observe(parent)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function animate() {
      const w = canvas!.width / devicePixelRatio
      const h = canvas!.height / devicePixelRatio
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      const particles = particlesRef.current
      const mouse = mouseRef.current

      // Update positions
      for (const p of particles) {
        if (!prefersReducedMotion) {
          p.x += p.vx
          p.y += p.vy
        }

        // Bounce off edges
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        p.x = Math.max(0, Math.min(w, p.x))
        p.y = Math.max(0, Math.min(h, p.y))

        // Mouse repulsion — gentle push
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < mouseRadius && dist > 0) {
          const force = (mouseRadius - dist) / mouseRadius * 0.02
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        // Dampen velocity
        p.vx *= 0.999
        p.vy *= 0.999
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.25
            ctx!.beginPath()
            ctx!.strokeStyle = `rgba(${color},${opacity})`
            ctx!.lineWidth = 0.8
            ctx!.moveTo(particles[i].x, particles[i].y)
            ctx!.lineTo(particles[j].x, particles[j].y)
            ctx!.stroke()
          }
        }
      }

      // Draw mouse connections
      for (const p of particles) {
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < mouseRadius) {
          const opacity = (1 - dist / mouseRadius) * 0.4
          ctx!.beginPath()
          ctx!.strokeStyle = `rgba(${color},${opacity})`
          ctx!.lineWidth = 1
          ctx!.moveTo(mouse.x, mouse.y)
          ctx!.lineTo(p.x, p.y)
          ctx!.stroke()
        }
      }

      // Draw particles
      for (const p of particles) {
        // Check if near mouse for highlight
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const nearMouse = dist < mouseRadius

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, nearMouse ? p.radius * 1.8 : p.radius, 0, Math.PI * 2)
        ctx!.fillStyle = nearMouse
          ? `rgba(${color},${0.5 + (1 - dist / mouseRadius) * 0.3})`
          : `rgba(${color},0.25)`
        ctx!.fill()
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      parent.removeEventListener('mousemove', onMouseMove)
      parent.removeEventListener('mouseleave', onMouseLeave)
      resizeObserver.disconnect()
    }
  }, [initParticles, connectionDistance, mouseRadius, color])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}
