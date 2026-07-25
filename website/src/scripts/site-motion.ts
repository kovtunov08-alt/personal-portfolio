import { buildFlipPlan, SF_FLIP_MS, type FlipPlan } from './split-flap-plan'
import { initFxEffects } from './fx-effects'

const TILT_MAX_DEG = 2.5
const TILT_PRESS_SCALE = 0.975
const TILT_DIM_BRIGHTNESS = 0.92

const SF_CHARS_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const SF_CHARS_MIXED = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function randomChar(pool: string, avoid: string): string {
  if (pool.length === 0) return avoid
  let next = pool[Math.floor(Math.random() * pool.length)] ?? avoid
  if (pool.length > 1) {
    let guard = 0
    while (next === avoid && guard < 6) {
      next = pool[Math.floor(Math.random() * pool.length)] ?? avoid
      guard += 1
    }
  }
  return next
}

function charsetFor(text: string): string {
  return /[a-z]/.test(text) ? SF_CHARS_MIXED : SF_CHARS_UPPER
}

function setGlyph(el: HTMLElement | null, char: string): void {
  if (!el) return
  el.textContent = char
}

function createGlyph(char: string): HTMLSpanElement {
  const glyph = document.createElement('span')
  glyph.className = 'sf-glyph'
  glyph.textContent = char
  return glyph
}

function createHalf(kind: 'top' | 'bottom', char: string): HTMLSpanElement {
  const half = document.createElement('span')
  half.className = `sf-half sf-half-${kind}`
  half.append(createGlyph(char))
  return half
}

function prepareSplitFlapHeading(heading: HTMLElement): {
  cells: HTMLElement[]
  finals: string[]
} {
  if (heading.dataset.sfReady === '1') {
    const cells = Array.from(heading.querySelectorAll<HTMLElement>('.sf-cell:not(.is-space)'))
    return {
      cells,
      finals: cells.map((cell) => cell.dataset.final ?? ''),
    }
  }

  const text = heading.textContent ?? ''
  const trimmed = text.replace(/\s+/g, ' ').trim()
  heading.replaceChildren()

  const cells: HTMLElement[] = []
  const finals: string[] = []
  let word: HTMLSpanElement | null = null

  const ensureWord = () => {
    if (word) return word
    word = document.createElement('span')
    word.className = 'sf-word'
    word.setAttribute('aria-hidden', 'true')
    heading.append(word)
    return word
  }

  const closeWord = () => {
    if (!word) return
    const rule = document.createElement('span')
    rule.className = 'sf-word-rule'
    word.append(rule)
    word = null
  }

  for (const char of trimmed) {
    if (char === ' ') {
      closeWord()
      const space = document.createElement('span')
      space.className = 'sf-cell is-space'
      space.setAttribute('aria-hidden', 'true')
      const sizer = document.createElement('span')
      sizer.className = 'sf-sizer'
      sizer.textContent = '\u00A0'
      space.append(sizer)
      heading.append(space)
      continue
    }

    const cell = document.createElement('span')
    cell.className = 'sf-cell'
    cell.dataset.final = char
    cell.setAttribute('aria-hidden', 'true')

    const sizer = document.createElement('span')
    sizer.className = 'sf-sizer'
    sizer.textContent = char

    const stage = document.createElement('span')
    stage.className = 'sf-stage'

    const top = createHalf('top', char)
    const bottom = createHalf('bottom', char)

    stage.append(top, bottom)
    cell.append(sizer, stage)
    ensureWord().append(cell)

    cells.push(cell)
    finals.push(char)
  }

  closeWord()

  if (!heading.hasAttribute('aria-hidden')) {
    heading.setAttribute('aria-label', trimmed)
  }

  const pool = charsetFor(finals.join(''))
  const reduced = prefersReducedMotion()
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]
    const finalChar = finals[i]
    if (!cell || !finalChar) continue
    setCellChar(cell, reduced ? finalChar : randomChar(pool, finalChar))
  }

  heading.classList.add('is-sf-ready')
  heading.dataset.sfReady = '1'
  return { cells, finals }
}

function readHalfGlyph(cell: HTMLElement, kind: 'top' | 'bottom'): HTMLElement | null {
  return cell.querySelector(`.sf-half-${kind} .sf-glyph`)
}

function setCellChar(cell: HTMLElement, char: string): void {
  setGlyph(readHalfGlyph(cell, 'top'), char)
  setGlyph(readHalfGlyph(cell, 'bottom'), char)
}

function flipCellOnce(cell: HTMLElement, fromChar: string, toChar: string): Promise<void> {
  return new Promise((resolve) => {
    const stage = cell.querySelector('.sf-stage')
    if (!stage) {
      setCellChar(cell, toChar)
      resolve()
      return
    }

    setGlyph(readHalfGlyph(cell, 'top'), toChar)
    setGlyph(readHalfGlyph(cell, 'bottom'), fromChar)

    const flipper = document.createElement('span')
    flipper.className = 'sf-flipper'
    flipper.style.setProperty('--sf-flip-ms', `${SF_FLIP_MS}ms`)

    const front = document.createElement('span')
    front.className = 'sf-flipper-face sf-flipper-front'
    front.append(createGlyph(fromChar))

    const back = document.createElement('span')
    back.className = 'sf-flipper-face sf-flipper-back'
    back.append(createGlyph(toChar))

    flipper.append(front, back)
    stage.append(flipper)

    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      setCellChar(cell, toChar)
      flipper.remove()
      resolve()
    }

    if (prefersReducedMotion()) {
      finish()
      return
    }

    const onEnd = (event: AnimationEvent) => {
      if (event.target !== flipper) return
      flipper.removeEventListener('animationend', onEnd)
      finish()
    }

    flipper.addEventListener('animationend', onEnd)
    void flipper.offsetWidth
    flipper.classList.add('is-flipping')

    window.setTimeout(finish, SF_FLIP_MS + 40)
  })
}

async function runCellSequence(
  cell: HTMLElement,
  finalChar: string,
  plan: FlipPlan,
  pool: string,
): Promise<void> {
  let current = randomChar(pool, finalChar)
  setCellChar(cell, current)

  const steps = Math.max(plan.flips, 1)
  for (let step = 0; step < steps; step++) {
    const isLast = step === steps - 1
    const next = isLast ? finalChar : randomChar(pool, current)
    await flipCellOnce(cell, current, next)
    current = next
  }
}

function playSplitFlap(heading: HTMLElement): void {
  if (heading.dataset.sfPlayed === '1') return
  heading.dataset.sfPlayed = '1'

  const { cells, finals } = prepareSplitFlapHeading(heading)
  if (cells.length === 0) return

  if (prefersReducedMotion()) {
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i]
      const finalChar = finals[i]
      if (cell && finalChar) setCellChar(cell, finalChar)
    }
    return
  }

  const pool = charsetFor(finals.join(''))
  const plans = buildFlipPlan(cells.length, Math.random())

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]
    const finalChar = finals[i]
    const plan = plans[i]
    if (!cell || !finalChar || !plan) continue
    void runCellSequence(cell, finalChar, plan, pool)
  }
}

function initSplitFlap(root: ParentNode): void {
  const headings = Array.from(root.querySelectorAll<HTMLElement>('[data-split-flap]'))
  if (headings.length === 0) return

  for (const heading of headings) {
    prepareSplitFlapHeading(heading)
  }

  if (prefersReducedMotion()) {
    for (const heading of headings) playSplitFlap(heading)
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const heading = entry.target as HTMLElement
        observer.unobserve(heading)
        playSplitFlap(heading)
      }
    },
    { threshold: 0.35, rootMargin: '0px 0px -6% 0px' },
  )

  for (const heading of headings) observer.observe(heading)
}

function initTiltSurfaces(root: ParentNode): void {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!canHover || prefersReducedMotion()) return

  const frames = root.querySelectorAll<HTMLElement>('[data-tilt]')
  for (const frame of frames) bindTiltSurface(frame)
}

function bindTiltSurface(frame: HTMLElement): void {
  const dimOnHover = frame.hasAttribute('data-tilt-dim')
  let targetX = 0
  let targetY = 0
  let targetScale = 1
  let targetBright = 1
  let currentX = 0
  let currentY = 0
  let currentScale = 1
  let currentBright = 1
  let rafId = 0
  let active = false

  const render = () => {
    currentX += (targetX - currentX) * 0.14
    currentY += (targetY - currentY) * 0.14
    currentScale += (targetScale - currentScale) * 0.14
    currentBright += (targetBright - currentBright) * 0.14
    frame.style.transform = `rotateX(${currentY}deg) rotateY(${currentX}deg) scale(${currentScale})`
    if (dimOnHover) frame.style.filter = `brightness(${currentBright})`

    if (
      Math.abs(targetX - currentX) > 0.01 ||
      Math.abs(targetY - currentY) > 0.01 ||
      Math.abs(targetScale - currentScale) > 0.001 ||
      Math.abs(targetBright - currentBright) > 0.001 ||
      active
    ) {
      rafId = requestAnimationFrame(render)
      return
    }

    rafId = 0
  }

  const ensureLoop = () => {
    if (rafId) return
    rafId = requestAnimationFrame(render)
  }

  const handleMouseMove = (event: MouseEvent) => {
    const rect = frame.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    const nx = (event.clientX - rect.left) / rect.width - 0.5
    const ny = (event.clientY - rect.top) / rect.height - 0.5
    targetX = clamp(nx * 2, -1, 1) * TILT_MAX_DEG
    targetY = clamp(-ny * 2, -1, 1) * TILT_MAX_DEG
    targetScale = TILT_PRESS_SCALE
    if (dimOnHover) targetBright = TILT_DIM_BRIGHTNESS
    active = true
    ensureLoop()
  }

  const handleMouseLeave = () => {
    targetX = 0
    targetY = 0
    targetScale = 1
    targetBright = 1
    active = false
    ensureLoop()
  }

  frame.addEventListener('mousemove', handleMouseMove)
  frame.addEventListener('mouseleave', handleMouseLeave)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function setSlideFocusable(slide: HTMLElement, enabled: boolean): void {
  const links = slide.querySelectorAll<HTMLAnchorElement>('a')
  for (const link of links) {
    if (enabled) link.removeAttribute('tabindex')
    else link.setAttribute('tabindex', '-1')
  }
}

function applySlideState(
  slide: HTMLElement,
  state: {
    opacity: number
    scale: number
    yPercent: number
    brightness: number
    interactive: boolean
    zIndex: number
  },
): void {
  slide.style.opacity = String(state.opacity)
  slide.style.transform = `translate3d(0, ${state.yPercent}%, 0) scale(${state.scale})`
  slide.style.filter = `brightness(${state.brightness})`
  slide.style.zIndex = String(state.zIndex)
  slide.classList.toggle('is-interactive', state.interactive)
  slide.setAttribute('aria-hidden', state.interactive ? 'false' : 'true')
  setSlideFocusable(slide, state.interactive)
}

function initProjectsShowcase(root: ParentNode): void {
  const pin = root.querySelector<HTMLElement>('[data-projects-pin]')
  if (!pin) return

  const slides = Array.from(pin.querySelectorAll<HTMLElement>('[data-project-slide]'))
  const marks = Array.from(pin.querySelectorAll<HTMLButtonElement>('[data-progress-mark]'))
  const count = slides.length

  if (count === 0) return

  const setStatic = (enabled: boolean) => {
    pin.dataset.projectsStatic = enabled ? '1' : '0'
    for (const slide of slides) {
      if (enabled) {
        slide.style.removeProperty('opacity')
        slide.style.removeProperty('transform')
        slide.style.removeProperty('filter')
        slide.style.removeProperty('z-index')
        slide.classList.add('is-interactive')
        slide.setAttribute('aria-hidden', 'false')
        setSlideFocusable(slide, true)
      }
    }
  }

  if (prefersReducedMotion() || count === 1) {
    setStatic(true)
    return
  }

  setStatic(false)

  let ticking = false
  let activeIndex = 0

  const updateProgressMarks = (index: number) => {
    if (index === activeIndex) return
    activeIndex = index

    for (const mark of marks) {
      const markIndex = Number(mark.dataset.index)
      const isActive = markIndex === index
      mark.classList.toggle('is-active', isActive)
      if (isActive) mark.setAttribute('aria-current', 'true')
      else mark.removeAttribute('aria-current')
    }
  }

  const update = () => {
    const rect = pin.getBoundingClientRect()
    const pinTop = window.scrollY + rect.top
    const viewportH = window.innerHeight || 1
    const scrollable = Math.max(pin.offsetHeight - viewportH, 1)
    const raw = (window.scrollY - pinTop) / scrollable
    const progress = clamp(raw, 0, 1)

    const t = progress * (count - 1)
    const i = Math.min(Math.floor(t), count - 2)
    const local = clamp(t - i, 0, 1)
    const eased = easeInOutCubic(local)
    const enterEased = easeOutCubic(local)

    for (let j = 0; j < count; j++) {
      const slide = slides[j]
      if (!slide) continue

      if (j === i) {
        applySlideState(slide, {
          opacity: lerp(1, 0, eased),
          scale: lerp(1, 0.94, eased),
          yPercent: lerp(0, -4, eased),
          brightness: lerp(1, 0.5, eased),
          interactive: local < 0.55,
          zIndex: 2,
        })
        continue
      }

      if (j === i + 1) {
        applySlideState(slide, {
          opacity: lerp(0, 1, eased),
          scale: lerp(1.09, 1, enterEased),
          yPercent: lerp(14, 0, enterEased),
          brightness: 1,
          interactive: local >= 0.45,
          zIndex: 3,
        })
        continue
      }

      const isPast = j < i
      applySlideState(slide, {
        opacity: 0,
        scale: isPast ? 0.94 : 1.09,
        yPercent: isPast ? -4 : 14,
        brightness: isPast ? 0.5 : 1,
        interactive: false,
        zIndex: 1,
      })
    }

    if (progress >= 0.999) {
      const last = slides[count - 1]
      if (last) {
        applySlideState(last, {
          opacity: 1,
          scale: 1,
          yPercent: 0,
          brightness: 1,
          interactive: true,
          zIndex: 3,
        })
      }
      for (let j = 0; j < count - 1; j++) {
        const slide = slides[j]
        if (!slide) continue
        applySlideState(slide, {
          opacity: 0,
          scale: 0.94,
          yPercent: -4,
          brightness: 0.5,
          interactive: false,
          zIndex: 1,
        })
      }
    }

    updateProgressMarks(Math.round(t))
  }

  const onScrollOrResize = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      ticking = false
      update()
    })
  }

  const scrollToIndex = (index: number) => {
    const rect = pin.getBoundingClientRect()
    const pinTop = window.scrollY + rect.top
    const viewportH = window.innerHeight || 1
    const scrollable = Math.max(pin.offsetHeight - viewportH, 0)
    const target = pinTop + (index / Math.max(count - 1, 1)) * scrollable
    window.scrollTo({ top: target, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  for (const mark of marks) {
    mark.addEventListener('click', () => {
      const index = Number(mark.dataset.index)
      if (!Number.isFinite(index)) return
      scrollToIndex(clamp(index, 0, count - 1))
    })
  }

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const handleMotionChange = () => {
    if (motionQuery.matches) {
      setStatic(true)
      return
    }
    setStatic(false)
    update()
  }

  motionQuery.addEventListener('change', handleMotionChange)

  update()
  window.addEventListener('scroll', onScrollOrResize, { passive: true })
  window.addEventListener('resize', onScrollOrResize)
}

function initSiteMotion(): void {
  const root = document
  initSplitFlap(root)
  initTiltSurfaces(root)
  initProjectsShowcase(root)
  initFxEffects()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSiteMotion, { once: true })
} else {
  initSiteMotion()
}
