import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(currentDir, '..')

function read(relativePath: string) {
  return fs.readFileSync(path.resolve(frontendRoot, relativePath), 'utf8')
}

describe('branding guardrails', () => {
  it('keeps the visible application name as Dolly Zoom', () => {
    const home = read('src/pages/Home.tsx')
    const navbar = read('src/components/Navbar.tsx')
    const html = read('index.html')

    expect(home).toContain('Dolly Zoom')
    expect(navbar).toContain('Dolly Zoom')
    expect(html).toContain('<title>Dolly Zoom</title>')
  })

  it('does not reintroduce CineConnect in visible shell files', () => {
    const home = read('src/pages/Home.tsx')
    const navbar = read('src/components/Navbar.tsx')
    const html = read('index.html')

    expect(home).not.toContain('CineConnect')
    expect(home).not.toContain('CinéConnect')
    expect(navbar).not.toContain('CineConnect')
    expect(navbar).not.toContain('CinéConnect')
    expect(html).not.toContain('CineConnect')
    expect(html).not.toContain('CinéConnect')
  })
})
