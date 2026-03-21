# Design System

## Design Direction

Platform mobile-first, responsive ve Neo-Brutalist bir "Retro Comic / Pixel Art" hissiyatında olmalıdır. Yumuşak gölge, yuvarlak kurumsal yüzeyler ve neon/glow efektleri kullanılmaz. Accessibility zorunludur; focus state'ler görünür ve sert olmalıdır.

## Global Rules

- Mor, lila, magenta, elektrik mavisi ve benzeri yapay zeka klişesi renkler yasaktır.
- Tüm yüzeylerde keskin sınırlar ve yüksek kontrast tercih edilir.
- Aria-label, klavye navigasyonu ve belirgin focus outline zorunludur.

## Typography

- Başlıklar ve vurgular: `VT323`
- Gövde ve kod blokları: `JetBrains Mono`

## Accent Colors

- Primary / Action Accent: `Yellow-400` (`#facc15`)
- Secondary / Destructive Accent: `Red-600` (`#dc2626`)
- Accent yüzeylerinde `border-2 border-black` zorunludur.

## Light Theme: Paper Comic

- Background: `Stone-100` (`#f5f5f4`)
- Surface/Card: `#ffffff`
- Borders: `#000000`, minimum `2px`
- Text Primary: `Stone-950` (`#0c0a09`)
- Text Muted: `Stone-600` (`#57534e`)
- Surface treatment: `border-2 border-black` + `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`

## Dark Theme: Comic Noir

- Background: `Stone-900` (`#1c1917`)
- Surface/Card: `Stone-800` (`#292524`)
- Borders: `#000000`, minimum `2px`
- Text Primary: `Stone-50` (`#fafaf9`)
- Text Muted: `Stone-400` (`#a8a29e`)
- Surface treatment: `border-2 border-black` + `shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]`
