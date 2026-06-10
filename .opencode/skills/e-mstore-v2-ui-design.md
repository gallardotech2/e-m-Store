---
name: e-mstore-v2-ui-design
description: Sistema de diseño UI — colores, tipografía, componentes y patrones visuales de E-M Store V2.0
---

# E-M Store V2.0 — UI Design System

Stack UI: Tailwind CSS v4 + shadcn/ui v4 (base-nova style) + @base-ui/react + lucide-react

## Colores

```
--primary:        oklch(0.45 0.24 25)     # rojo ~#B91C1C (botones, headers, badges, hover)
--primary-fg:     oklch(0.985 0 0)         # blanco (texto sobre primary)
--background:     oklch(0.98 0 0)          # fondo página
--foreground:     oklch(0.145 0 0)         # texto principal
--card:           oklch(1 0 0)             # blanco cards
--muted:          oklch(0.97 0 0)          # fondos secundarios
--muted-fg:       oklch(0.556 0 0)         # texto secundario
--border:         oklch(0.922 0 0)         # bordes
--destructive:    oklch(0.577 0.245 27.325) # rojo error
--sidebar:        oklch(0.15 0 0)          # sidebar admin (oscuro)
--sidebar-fg:     oklch(0.8 0 0)           # texto sidebar
```

Uso directo en clases:
- `bg-red-600` / `hover:bg-red-700` para botones principales, header, badges
- `bg-green-600` para éxito, envío gratis, botón pagar
- `bg-gray-50` para fondos de main content
- `bg-gray-800` / `bg-blue-600` para acciones secundarias en admin
- `text-red-600` para precios, títulos importantes
- `text-muted-foreground` para precios tachados, textos tenues

## Tipografía

- **Font:** Roboto (Google Fonts via next/font)
- **Weights:** 400 (regular), 500 (medium), 700 (bold), 900 (black)
- **Variable CSS:** `--font-roboto`
- **Clase Tailwind:** `font-sans` (mapeada a Roboto)
- **Jerarquía:**
  - Títulos página: `text-2xl font-bold`
  - Nombre producto: `text-sm font-semibold`
  - Precio: `text-lg font-bold`
  - Precio grande (modal): `text-3xl font-bold`
  - Precio original tachado: `text-sm text-muted-foreground line-through`
  - Texto cuerpo: `text-sm`
  - Labels: `text-sm font-medium`

## Componentes shadcn/ui v4 usados (base-nova style)

| Componente | File | Base |
|-----------|------|------|
| Button | `ui/button.tsx` | `@base-ui/react/button` |
| Card | `ui/card.tsx` | Custom |
| Input | `ui/input.tsx` | `@base-ui/react/input` |
| Label | `ui/label.tsx` | Custom |
| Badge | `ui/badge.tsx` | `@base-ui/react` render/mergeProps |
| Dialog | `ui/dialog.tsx` | `@base-ui/react/dialog` |
| DropdownMenu | `ui/dropdown-menu.tsx` | `@base-ui/react/menu` |
| Select | `ui/select.tsx` | `@base-ui/react/select` |
| Table | `ui/table.tsx` | Custom |
| Textarea | `ui/textarea.tsx` | Custom |
| Avatar | `ui/avatar.tsx` | `@base-ui/react/avatar` |
| Separator | `ui/separator.tsx` | `@base-ui/react/separator` |
| Sheet | `ui/sheet.tsx` | `@base-ui/react/dialog` |
| Sonner | `ui/sonner.tsx` | sonner + next-themes |
| Command | `ui/command.tsx` | cmdk + input-group |

### Variantes de Button
- `default` — bg-primary text-primary-foreground
- `outline` — border bg-background hover:bg-muted
- `secondary` — bg-secondary text-secondary-foreground
- `ghost` — transparente hover:bg-muted
- `destructive` — bg-destructive/10 text-destructive
- `link` — texto subrayado como link
- Sizes: `xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`

## Bordes y radios

```
--radius:     0.625rem  (10px)
--radius-sm:  calc(--radius * 0.6)  ~6px
--radius-md:  calc(--radius * 0.8)  ~8px
--radius-lg:  --radius              ~10px
--radius-xl:  calc(--radius * 1.4)  ~14px
```

Aplicado globalmente: `* { @apply border-border outline-ring/50 }`

## Sombras

- Cards: `shadow-md` (product-card, stat cards, admin tables)
- Hover cards: `hover:shadow-lg transition-shadow duration-300`
- Header: `shadow-lg`

## Layouts

### Storefront (público)
```
┌─────────────────────────────┐
│   Header (bg-red-600, sticky) │
├─────────────────────────────┤
│   Banner carousel │
├─────────────────────────────┤
│   Product Grid / Search Results │
├─────────────────────────────┤
│   BottomNav (mobile only) │
└─────────────────────────────┘
```

### Admin panel
```
┌──────────┬──────────────────────┐
│ Sidebar  │  Main Content        │
│ (oscuro) │  (bg-gray-50, p-6)  │
│ w-64     │  overflow-auto       │
└──────────┴──────────────────────┘
```

### Affiliate panel
```
┌──────────┬──────────────────────┐
│ Sidebar  │  Main Content        │
│ (oscuro) │  (bg-gray-50, p-6)  │
└──────────┴──────────────────────┘
```

## Patrones visuales comunes

- **Badge descuento:** `absolute top-2 left-2 bg-red-600 text-white font-bold`
- **Precio en cards:** `text-lg font-bold text-red-600` + tachado `text-sm text-muted-foreground line-through`
- **Envío gratis:** `text-xs text-green-600 font-medium`
- **Botón comprar:** `w-full bg-red-600 hover:bg-red-700 text-white`
- **Botón pagar en modal:** `bg-green-600 hover:bg-green-700 text-white`
- **Contenedor página admin:** `text-2xl font-bold mb-6` para título, `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4` para stats
- **Tablas admin:** shadcn/ui Table component con `border-0 shadow-md`
- **Forms admin:** `space-y-4` con Label + Input/Select
- **Mobile bottom nav:** `fixed bottom-0 z-50 bg-white border-t`

## Iconos (lucide-react)

Usados en el proyecto: `Search`, `ShoppingCart`, `UserPlus`, `Package`, `Tags`, `ShoppingCart`, `Users`, `X`, `Plus`, `Pencil`, `Trash2`, `Copy`, `Link`, `LogOut`, `Menu`, `Home`, `LayoutGrid`, `Settings`, `ChevronLeft`, `ChevronRight`
