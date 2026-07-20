export type SkillGroup = {
  title: string
  items: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'Дизайн',
    items: ['UX Research', 'UI Design', 'Figma', 'Design Systems', 'Prototyping'],
  },
  {
    title: 'Frontend',
    items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Astro'],
  },
  {
    title: 'Инструменты',
    items: ['Git', 'Figma Dev Mode', 'Storybook', 'Playwright', 'Cursor'],
  },
]
