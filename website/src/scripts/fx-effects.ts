function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function canFineHover(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function initMagnetic(): void {
  if (!canFineHover() || prefersReducedMotion()) return

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    let raf = 0
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let active = false

    const render = () => {
      cx += (tx - cx) * 0.18
      cy += (ty - cy) * 0.18
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      if (active || Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
        raf = requestAnimationFrame(render)
        return
      }
      raf = 0
      el.style.removeProperty('transform')
    }

    const ensure = () => {
      if (!raf) raf = requestAnimationFrame(render)
    }

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const nx = (event.clientX - (rect.left + rect.width / 2)) / Math.max(rect.width, 1)
      const ny = (event.clientY - (rect.top + rect.height / 2)) / Math.max(rect.height, 1)
      tx = clamp(nx, -1, 1) * 10
      ty = clamp(ny, -1, 1) * 8
      active = true
      ensure()
    }

    const onLeave = () => {
      tx = 0
      ty = 0
      active = false
      ensure()
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
  })
}

function initSpotlight(): void {
  if (!canFineHover() || prefersReducedMotion()) return

  document.querySelectorAll<HTMLElement>('[data-spotlight]').forEach((host) => {
    let layer = host.querySelector<HTMLElement>(':scope > .fx-spot-layer')
    if (!layer) {
      layer = document.createElement('span')
      layer.className = 'fx-spot-layer'
      layer.setAttribute('aria-hidden', 'true')
      host.prepend(layer)
    }

    const onMove = (event: MouseEvent) => {
      const rect = host.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100
      layer.style.setProperty('--spot-x', `${x}%`)
      layer.style.setProperty('--spot-y', `${y}%`)
      layer.classList.add('is-on')
    }

    const onLeave = () => {
      layer.classList.remove('is-on')
    }

    host.addEventListener('mousemove', onMove)
    host.addEventListener('mouseleave', onLeave)
  })
}

function initReveal(): void {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
  if (targets.length === 0) return

  if (prefersReducedMotion()) {
    for (const el of targets) el.classList.add('is-revealed')
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement
        el.classList.add('is-revealed')
        observer.unobserve(el)
      }
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
  )

  for (const el of targets) observer.observe(el)
}

function initFormFx(): void {
  const form = document.getElementById('contact-form')
  if (!(form instanceof HTMLFormElement)) return

  form.classList.add('fx-form-live')

  const status = document.getElementById('form-status')
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')
  if (!(status instanceof HTMLElement) || !(submit instanceof HTMLButtonElement)) return

  const observer = new MutationObserver(() => {
    if (!status.classList.contains('is-success')) return
    if (submit.classList.contains('is-fx-success')) return
    submit.classList.add('is-fx-success')
    submit.dataset.fxLabel = submit.textContent ?? ''
    submit.textContent = 'Sent ✓'
    window.setTimeout(() => {
      submit.classList.remove('is-fx-success')
      if (submit.dataset.fxLabel) {
        submit.textContent = submit.dataset.fxLabel
        delete submit.dataset.fxLabel
      }
    }, 2200)
  })

  observer.observe(status, { attributes: true, attributeFilter: ['class'], childList: true })
}

export function initFxEffects(): void {
  initMagnetic()
  initSpotlight()
  initReveal()
  initFormFx()
}
