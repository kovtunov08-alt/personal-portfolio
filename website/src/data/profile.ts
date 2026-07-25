export const profile = {
  heroVariant: 'A',
  name: 'Kovtunov Aleksey',
  title: 'Vibe Coder',
  tagline:
    'Занимаюсь вайбкодингом — создаю сайты и веб-приложения, уделяя внимание качеству реализации, адаптивности и удобству использования. Постоянно расширяю свои знания и развиваю собственные проекты.',
  bio: `Мой основной подход — вайбкодинг: быстро превращаю идеи в рабочие интерфейсы и проекты. Сейчас основной фокус — работа над собственными продуктами, изучение современных инструментов и постоянное развитие практических навыков.`,
  email: 'kovtunov08@gmail.com',
  location: 'Санкт-Петербург, Россия',
  portrait: '/images/portrait.png',
  portraitWidth: 683,
  portraitHeight: 1024,
  portraitBg: '#EEE8DF',
  portraitBgGradient:
    'linear-gradient(180deg, #EEE8DF 0%, #C4BCB0 48%, #EEE8DF 100%)',
  nav: [
    { href: '#about', label: 'Обо мне' },
    { href: '#projects', label: 'Проекты' },
    { href: '#skills', label: 'Технологии' },
    { href: '#contact', label: 'Контакты' },
  ],
  social: {
    github: 'https://github.com/kovtunov08-alt',
    linkedin: 'https://linkedin.com',
    telegram: 'https://t.me/Akskovv',
  },
} as const
