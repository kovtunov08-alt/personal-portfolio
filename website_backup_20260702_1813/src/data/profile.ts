export const profile = {
  heroVariant: 'A',
  name: 'Kovtunov Aleksey',
  title: 'Продуктовый дизайнер и Frontend-разработчик',
  titleNormal: 'Продуктовый дизайнер',
  titleStretched: 'Frontend-разработчик',
  tagline: 'Проектирую интерфейсы и довожу их до готовой реализации в продакшене',
  bio: `Я продуктовый дизайнер с опытом в UX/UI, прототипировании и разработке.
Помогаю командам превращать идеи в работающие интерфейсы: от wireframe до production-ready кода.`,
  email: 'kovtunov08@gmail.com',
  location: 'Москва, Россия',
  portrait: '/images/portrait.png',
  portraitWidth: 1024,
  portraitHeight: 576,
  portraitBg: '#EEE8DF',
  portraitBgGradient:
    'linear-gradient(180deg, #EEE8DF 0%, #C4BCB0 48%, #EEE8DF 100%)',
  nav: [
    { href: '#about', label: 'Обо мне' },
    { href: '#projects', label: 'Проекты' },
    { href: '#skills', label: 'Услуги' },
    { href: '#contact', label: 'Контакты' },
  ],
  social: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    telegram: 'https://t.me',
  },
} as const
