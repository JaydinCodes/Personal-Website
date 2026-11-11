'use client'

import clsx from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'

export default function FloatingOrb({ className = '', color = 'bg-red-500/30', blur = 'blur-3xl', style = {}, x, y }) {
  const prefersReducedMotion = useReducedMotion()
  const resolvedX = x ?? style.x
  const resolvedY = y ?? style.y

  return (
    <motion.div
      className={clsx('hero-orb pointer-events-none', color, blur, className)}
      style={{
        ...style,
        x: prefersReducedMotion ? 0 : resolvedX,
        y: prefersReducedMotion ? 0 : resolvedY,
      }}
      aria-hidden="true"
    />
  )
}
