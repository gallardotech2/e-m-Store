# Cambios de Color - Parte Pública

## 1. Fondo general más gris
**Archivo**: `src/app/globals.css` — línea 50
**Cambio**:
```css
--background: oklch(0.93 0 0);
```
(ya aplicado)

## 2. Degradado entre banner y contenido
**Archivo**: `src/app/page.tsx` — líneas 49-52
**Cambio**: Reemplazar:
```tsx
{!buscar &&       <BannerCarousel banners={banners} categories={categories} affiliateId={sp.a ?? null} />}
```
por:
```tsx
{!buscar && (
  <>
    <BannerCarousel banners={banners} categories={categories} affiliateId={sp.a ?? null} />
    <div className="h-16 bg-gradient-to-b from-[#1a1a2e] to-transparent" />
  </>
)}
```

## 3. Fix hydration mismatch en carrusel
**Archivo**: `src/components/ui/carousel.tsx` — líneas 183 y 213
**Cambio**: Agregar `suppressHydrationWarning` en:
- CarouselPrevious (línea ~183): `<Button suppressHydrationWarning data-slot="carousel-previous" ...>`
- CarouselNext (línea ~213): `<Button suppressHydrationWarning data-slot="carousel-next" ...>`
(ya aplicado)
