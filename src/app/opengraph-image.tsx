import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          padding: '60px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: '#e94560',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              fontWeight: 900,
              color: 'white',
            }}
          >
            e
          </div>
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 900,
              color: 'white',
              margin: 0,
              letterSpacing: '-2px',
            }}
          >
            e-m store
          </h1>
        </div>
        <p
          style={{
            fontSize: '36px',
            color: '#e94560',
            fontWeight: 700,
            margin: '0 0 16px',
            textAlign: 'center',
          }}
        >
          Perfiles de streaming legales en Bolivia
        </p>
        <p
          style={{
            fontSize: '28px',
            color: '#8899aa',
            margin: 0,
            textAlign: 'center',
          }}
        >
          Desde 30 Bs · Acceso exclusivo con PIN · 4K · 100% Legal
        </p>
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            gap: '24px',
            fontSize: '18px',
            color: '#556677',
          }}
        >
          e-mstore.bo
        </div>
      </div>
    ),
    { ...size },
  )
}
