import {ImageResponse} from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Shopping List';
export const size = {width: 1200, height: 630};
export const contentType = 'image/png';

export default async function Image({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{fontSize: 72, display: 'flex', marginBottom: 20}}>
          🛒
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: 16,
          }}
        >
          Shopping List
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            marginBottom: 40,
          }}
        >
          Collaborative real-time shopping list
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: 12,
              padding: '12px 24px',
              color: '#a5b4fc',
              fontSize: 22,
              display: 'flex',
            }}
          >
            Join via link · {id.slice(0, 8)}…
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            fontSize: 20,
            color: '#475569',
            display: 'flex',
          }}
        >
          Powered by Rocicorp Zero
        </div>
      </div>
    ),
    {width: 1200, height: 630},
  );
}
