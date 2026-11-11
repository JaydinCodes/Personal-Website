'use client'

import Image from 'next/image'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import TopNav from '@/components/layout/TopNav'
import Card from '@/components/ui/Card'
import Section from '@/components/ui/Section'
import AnimatedSection from '@/components/ui/AnimatedSection'
import FloatingOrb from '@/components/ui/FloatingOrb'
import MagneticButton from '@/components/ui/MagneticButton'
import SectionHeader from '@/components/ui/SectionHeader'
import SkillPill from '@/components/ui/SkillPill'
import { projects as staticProjects } from '@/data/projects'

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
}

const getFadeUp = (reducedMotion) => ({
  hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 },
  visible: reducedMotion
    ? { opacity: 1, transition: { duration: 0.22, ease: 'linear' } }
    : {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
      },
})

const skillList = [
  'Frontend Architecture',
  'AI Product Engineering',
  'Motion Design Systems',
  'Performance Optimization',
  'Statistical modeling',
  'Design-to-Code Workflows',
  'Secure system design',
  'Microservices architecture',
  'Pipeline orchestration',
  'Evolutionary algorithms'
]

const techStackItems = [
  'Python',
  'JavaScript',
  'TypeScript',
  'R',
  'SQL',
  'FastAPI',
  'Django',
  'Docker',
  'Kubernetes',
  'PostgreSQL',
  'Git',
  'AWS',
]

function ProjectCard({ project, index, prefersReducedMotion }) {
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const [isFinePointer, setIsFinePointer] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsFinePointer(window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  }, [])

  const handleMove = (event) => {
    if (!isFinePointer || prefersReducedMotion) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    rotateY.set((x - 0.5) * 9)
    rotateX.set((0.5 - y) * 9)
  }

  const handleLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  const cardBody = (
    <>
      <div className="project-image-wrap">
        <Image
          src={project.image || project.image_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'}
          alt={project.title}
          width={900}
          height={580}
          sizes="(max-width: 640px) 84vw, (max-width: 768px) 66vw, (max-width: 1280px) 50vw, 33vw"
          className="project-image"
          loading="lazy"
        />
        <div className="project-overlay">
          <span className="rounded-full border border-white/45 bg-black/35 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">Open GitHub Repo</span>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg text-white sm:text-xl">{project.title}</h3>
          {project.category ? <span className="rounded-full border border-white/20 bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-red-300">{project.category}</span> : null}
        </div>
        <p className="mt-2 text-xs text-gray-200 sm:text-sm">{project.description}</p>
        {!!project.tech?.length && <div className="mt-3 flex flex-wrap gap-1.5">{project.tech.map((item) => <span key={item} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] text-gray-100 sm:text-xs">{item}</span>)}</div>}
        {project.impact ? <p className="mt-3 text-xs text-gray-300 sm:text-sm"><span className="text-red-300">Impact:</span> {project.impact}</p> : null}
        <div className="mt-4 text-sm font-medium text-red-300">Open GitHub Repo →</div>
      </div>
    </>
  )

  return (
    <motion.article
      layout
      key={project.id}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="project-card min-w-[84%] snap-start sm:min-w-[66%] md:min-w-0"
      style={isFinePointer && !prefersReducedMotion ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {project.href ? <a href={project.href} target="_blank" rel="noreferrer" className="block h-full">{cardBody}</a> : <div className="block h-full">{cardBody}</div>}
    </motion.article>
  )
}

export default function PortfolioPage() {
  const prefersReducedMotion = useReducedMotion()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const cursorXSpring = useSpring(cursorX, { stiffness: 320, damping: 32, mass: 0.2 })
  const cursorYSpring = useSpring(cursorY, { stiffness: 320, damping: 32, mass: 0.2 })

  const [cursorVisible, setCursorVisible] = useState(false)
  const [cursorInteractive, setCursorInteractive] = useState(false)
  const [projectItems, setProjectItems] = useState(staticProjects)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactStatus, setContactStatus] = useState({ state: 'idle', detail: '' })

  useEffect(() => {
    let active = true
    fetch('/api/projects/')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !Array.isArray(data) || data.length === 0) return
        const normalized = data.map((item, idx) => ({
          id: item.id ?? `api-project-${idx}`,
          title: item.title,
          category: item.category || 'Systems',
          tech: Array.isArray(item.tech) ? item.tech : [],
          impact: item.impact || '',
          href: item.href || '',
          description: item.description,
          image: item.image || item.image_url || staticProjects[idx % staticProjects.length]?.image,
        }))
        setProjectItems([...staticProjects, ...normalized])
      })
      .catch(() => {
        // Fallback to staticProjects when backend API is offline
      })
    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(
    () => ['All', ...new Set(projectItems.map((project) => project.category).filter(Boolean))],
    [projectItems],
  )
  const [activeCategory, setActiveCategory] = useState('All')
  const filteredProjects = useMemo(
    () => (activeCategory === 'All' ? projectItems : projectItems.filter((project) => project.category === activeCategory)),
    [activeCategory, projectItems],
  )

  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 18, mass: 0.3 })
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 18, mass: 0.3 })

  const portraitX = useTransform(smoothX, [-1, 1], prefersReducedMotion ? [0, 0] : [-16, 16])
  const portraitY = useTransform(smoothY, [-1, 1], prefersReducedMotion ? [0, 0] : [-12, 12])
  const orbOneX = useTransform(smoothX, [-1, 1], prefersReducedMotion ? [0, 0] : [-22, 22])
  const orbOneY = useTransform(smoothY, [-1, 1], prefersReducedMotion ? [0, 0] : [-18, 18])
  const orbTwoX = useTransform(smoothX, [-1, 1], prefersReducedMotion ? [0, 0] : [16, -16])
  const orbTwoY = useTransform(smoothY, [-1, 1], prefersReducedMotion ? [0, 0] : [12, -12])

  const fadeUp = useMemo(() => getFadeUp(prefersReducedMotion), [prefersReducedMotion])

  const heroHandlers = useMemo(
    () => ({
      onMouseMove: (event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
        const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1
        mouseX.set(x)
        mouseY.set(y)
      },
      onMouseLeave: () => {
        mouseX.set(0)
        mouseY.set(0)
      },
    }),
    [mouseX, mouseY],
  )

  useEffect(() => {
    if (prefersReducedMotion) return undefined

    const isFinePointer = window.matchMedia('(pointer: fine)').matches
    if (!isFinePointer) return undefined

    const handleMove = (event) => {
      cursorX.set(event.clientX)
      cursorY.set(event.clientY)
      setCursorVisible(true)

      const interactiveTarget = event.target.closest('a, button, .project-card, .hero-portrait-card')
      setCursorInteractive(Boolean(interactiveTarget))
    }

    const handleLeave = () => {
      setCursorVisible(false)
      setCursorInteractive(false)
    }

    window.addEventListener('mousemove', handleMove)
    document.documentElement.addEventListener('mouseleave', handleLeave)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.documentElement.removeEventListener('mouseleave', handleLeave)
    }
  }, [cursorX, cursorY, prefersReducedMotion])

  const handleContactSubmit = async (event) => {
    event.preventDefault()
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setContactStatus({ state: 'error', detail: 'Please complete all fields before sending.' })
      return
    }
    setContactStatus({ state: 'submitting', detail: 'Sending message...' })
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })
      if (!response.ok) {
        throw new Error('Request failed')
      }
      setContactForm({ name: '', email: '', message: '' })
      setContactStatus({ state: 'success', detail: 'Message received! I will get back to you soon.' })
    } catch {
      setContactStatus({
        state: 'error',
        detail: 'Could not reach the server right now. Please use the direct email button below.',
      })
    }
  }

  return (
    <main className="portfolio-root">
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
          className="page-reveal"
        />
      )}

      <motion.div
        className="custom-cursor"
        aria-hidden="true"
        style={{ x: cursorXSpring, y: cursorYSpring }}
        animate={{
          opacity: prefersReducedMotion ? 0 : cursorVisible ? 1 : 0,
          scale: prefersReducedMotion ? 1 : cursorVisible ? (cursorInteractive ? 1.75 : 1) : 0.5,
          backgroundColor: cursorInteractive ? 'rgba(225, 6, 0, 0.35)' : 'rgba(255, 255, 255, 0.22)',
        }}
        transition={{ duration: 0.18 }}
      />

      <TopNav />

      <Section
        id="hero"
        className="relative min-h-[calc(90vh-4rem)] overflow-hidden pt-3 sm:pt-6 md:pt-10"
      >
        <FloatingOrb className="hero-orb-one" color="bg-red-500/35" x={orbOneX} y={orbOneY} />
        <FloatingOrb className="hero-orb-two" color="bg-orange-300/30" x={orbTwoX} y={orbTwoY} />
        <div className="hero-grid" />
        <div className="hero-noise" />

        <div
          className="relative grid min-h-[62vh] items-center gap-6 pb-2 sm:min-h-[68vh] sm:grid-cols-[1.05fr,0.95fr] sm:gap-8 lg:min-h-[72vh]"
          {...heroHandlers}
        >
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.p
              variants={fadeUp}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-200 sm:mb-5 sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.22em]"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
              Open For Select Projects
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="font-display text-3xl leading-[1.04] text-white sm:text-5xl lg:text-7xl"
            >
              Jaydin Morrison
              <span className="mt-2 block text-sm font-semibold uppercase tracking-[0.12em] text-red-400 sm:mt-3 sm:text-xl sm:tracking-[0.14em]">
                Software Engineer
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-base leading-relaxed text-gray-100 sm:mt-7 sm:text-lg">
              Crafting polished digital products with strong engineering foundations,
              expressive animation, and intuitive user interaction.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-3 sm:mt-9 sm:gap-3.5">
              <MagneticButton href="#projects">View Projects</MagneticButton>
              <MagneticButton href="#contact" variant="secondary">
                Contact Me
              </MagneticButton>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mobile-tech-cloud sm:hidden"
          >
            {techStackItems.map((item, index) => {
              const angle = (index / techStackItems.length) * Math.PI * 2
              const ring = index % 3
              const radiusX = ring === 0 ? 16 : ring === 1 ? 26 : 34
              const radiusY = ring === 0 ? 15 : ring === 1 ? 24 : 33
              const offsetX = 50 + Math.cos(angle) * radiusX
              const offsetY = 50 + Math.sin(angle) * radiusY
              const duration = 9.8 + (index % 4) * 1.15
              const delay = (index % 6) * -0.75

              return (
                <span
                  key={item}
                  className="mobile-tech-pill-anchor"
                  style={{
                    '--tx': `${offsetX}%`,
                    '--ty': `${offsetY}%`,
                  }}
                >
                  <motion.span
                    className="mobile-tech-pill"
                    animate={{
                      x: [0, (index % 2 === 0 ? 1 : -1) * (5 + (index % 3) * 2), (index % 2 === 0 ? -1 : 1) * (4 + (index % 3) * 2), 0],
                      y: [0, (index % 3 === 0 ? -1 : 1) * (5 + (index % 3) * 2), (index % 2 === 0 ? 1 : -1) * (4 + (index % 3) * 2), 0],
                    }}
                    transition={{
                      duration,
                      delay,
                      repeat: prefersReducedMotion ? 0 : Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {item}
                  </motion.span>
                </span>
              )
            })}
          </motion.div>

          <motion.div style={{ x: portraitX, y: portraitY }} className="hero-portrait-shell hidden sm:block">
            <motion.div
              animate={prefersReducedMotion ? { y: 0 } : { y: [0, -10, 0] }}
              transition={{ duration: prefersReducedMotion ? 0.2 : 6, repeat: prefersReducedMotion ? 0 : Infinity, ease: prefersReducedMotion ? 'linear' : 'easeInOut' }}
              className="hero-portrait-card"
            >
              <Image
                src="/jojo.png"
                alt="Illustrated portrait of Jaydin Morrison"
                width={900}
                height={1125}
                sizes="(max-width: 640px) 0px, (max-width: 1024px) 240px, 290px"
                className="hero-portrait-image"
                priority
              />
              <Card className="hero-chip hero-chip-top p-3 sm:p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gray-300">Focus</p>
                <p className="mt-2 text-sm text-white">Premium web apps and AI-driven tooling</p>
              </Card>
              <Card className="hero-chip hero-chip-bottom p-3 sm:p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gray-300">Available</p>
                <p className="mt-2 text-sm text-white">Remote collaborations and product sprints</p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      <Section id="about" className="pt-3 md:pt-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.1fr,0.9fr]">
          <AnimatedSection variants={fadeUp}>
            <Card className="h-full p-5 sm:p-7">
              <SectionHeader
                label="About"
                title="Building digital products with precision and personality."
                description="I blend software engineering, visual design, and interaction choreography to craft fast, expressive experiences that feel intentional at every touchpoint."
              />
            </Card>
          </AnimatedSection>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <Card className="h-full p-5 sm:p-7">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-400">Skills</p>
              <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                {skillList.map((skill) => (
                  <SkillPill key={skill}>{skill}</SkillPill>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </Section>

      <Section id="projects" className="pt-2 sm:pt-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end sm:gap-4">
          <h2 className="font-display text-2xl text-white sm:text-3xl">Projects</h2>
          <p className="text-sm text-gray-300">Selected case studies</p>
        </div>

        <motion.div layout className="mb-4 flex flex-wrap gap-2 sm:mb-5">
          {categories.map((category) => {
            const isActive = category === activeCategory
            return (
              <motion.button
                layout
                key={category}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(category)}
                className={`inline-flex min-h-[40px] items-center rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition ${isActive ? 'border-red-400 bg-red-500/20 text-red-100' : 'border-white/20 bg-white/5 text-gray-200 hover:border-white/40'}`}
              >
                {category}
              </motion.button>
            )
          })}
        </motion.div>

        <motion.div layout className="compact-lane flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:grid md:snap-none md:overflow-visible md:pb-0 md:[grid-template-columns:repeat(2,minmax(0,1fr))] xl:[grid-template-columns:repeat(3,minmax(0,1fr))]">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} prefersReducedMotion={prefersReducedMotion} />
          ))}
        </motion.div>
      </Section>

      <Section id="contact" className="pb-10 pt-4 sm:pb-14 sm:pt-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={fadeUp}>
          <Card className="contact-panel p-5 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr]">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-400">Contact</p>
                <h2 className="mt-4 font-display text-2xl text-white sm:text-4xl">Let’s build something that ships and scales.</h2>
                <p className="mt-3 max-w-2xl text-sm text-gray-200 sm:mt-4 sm:text-base">
                  I'm available for product partnerships, AI-powered experiences, and full-cycle application development from strategy through launch.
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-7 sm:gap-3">
                  <MagneticButton href="mailto:jaydin@jaydinmorrison.com" className="cta-glow-button">
                    Email Directly
                  </MagneticButton>
                  <MagneticButton href="#projects" variant="secondary">
                    View Projects
                  </MagneticButton>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4 rounded-2xl border border-white/15 bg-black/40 p-4 sm:p-6" noValidate>
                <div>
                  <label htmlFor="contact-name" className="block font-mono text-xs uppercase tracking-[0.16em] text-gray-300">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    className="mt-1.5 w-full rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-400 transition focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block font-mono text-xs uppercase tracking-[0.16em] text-gray-300">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="mt-1.5 w-full rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-400 transition focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block font-mono text-xs uppercase tracking-[0.16em] text-gray-300">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={3}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell me about your project..."
                    className="mt-1.5 w-full rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-400 transition focus:border-red-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={contactStatus.state === 'submitting'}
                  className="cta-glow-button inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-red-500 bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(225,6,0,0.35)] transition hover:border-red-600 hover:bg-red-600 disabled:opacity-60"
                >
                  {contactStatus.state === 'submitting' ? 'Sending...' : 'Send Message'}
                </button>
                {contactStatus.detail ? (
                  <p
                    role="status"
                    className={`text-xs ${contactStatus.state === 'error' ? 'text-red-300' : 'text-emerald-300'}`}
                  >
                    {contactStatus.detail}
                  </p>
                ) : null}
              </form>
            </div>
          </Card>
        </motion.div>
      </Section>
    </main>
  )
}
