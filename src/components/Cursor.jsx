import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/** Custom cursor — a ring that swells to a "VIEW" pill over clickable cards. */
export default function Cursor() {
  const [hovered, setHovered] = useState(false)
  const [label, setLabel] = useState('')
  const [visible, setVisible] = useState(false)
  const [touch, setTouch] = useState(false)

  const x = useMotionValue(-200)
  const y = useMotionValue(-200)
  const spring = { damping: 28, stiffness: 450, mass: 0.4 }
  const sx = useSpring(x, spring)
  const sy = useSpring(y, spring)

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setTouch(true)
      return
    }
    const onMove = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
    }
    const onOver = (e) => {
      const card = e.target.closest('.group.cursor-pointer')
      /* A letter of the closing statement counts as a control. It is not
         clickable, but the ask is for the nav-bar behaviour on the word: the
         ring swells and fills over each glyph, one at a time. */
      const control = e.target.closest('a, button, [role="button"], .statement-letter')
      if (card) {
        setHovered(true)
        setLabel('VIEW')
      } else if (control) {
        setHovered(true)
        setLabel('')
      } else {
        setHovered(false)
        setLabel('')
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
    }
  }, [x, y])

  if (touch || !visible) return null
  const size = hovered ? 48 : 20

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full flex items-center justify-center mix-blend-difference"
        style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: size,
          height: size,
          backgroundColor: hovered ? '#ffffff' : 'transparent',
          border: '2px solid #ffffff',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {hovered && label && (
          <span className="text-[10px] font-bold tracking-wider text-black mix-blend-normal">{label}</span>
        )}
      </motion.div>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] w-1.5 h-1.5 rounded-full"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          backgroundColor: 'var(--jelly, #e3b341)',
        }}
        animate={{ opacity: hovered ? 0 : 1, scale: hovered ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
    </>
  )
}
