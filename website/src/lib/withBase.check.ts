import { joinBase } from './withBase'

const cases: Array<[string, string, string]> = [
  ['/personal-portfolio', 'images/portrait.png', '/personal-portfolio/images/portrait.png'],
  ['/personal-portfolio/', '/images/portrait.png', '/personal-portfolio/images/portrait.png'],
  ['/personal-portfolio', '', '/personal-portfolio/'],
  ['/', 'favicon.svg', '/favicon.svg'],
]

for (const [base, path, expected] of cases) {
  const actual = joinBase(base, path)
  if (actual !== expected) {
    throw new Error(
      `joinBase(${JSON.stringify(base)}, ${JSON.stringify(path)}): got ${actual}, expected ${expected}`,
    )
  }
}

console.log('withBase ok')
