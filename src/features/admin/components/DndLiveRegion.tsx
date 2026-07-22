'use client';

interface DndLiveRegionProps {
  message: string;
}

const SR_ONLY: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export default function DndLiveRegion({ message }: DndLiveRegionProps) {
  return (
    <div role="status" aria-live="assertive" aria-atomic="true" style={SR_ONLY}>
      {message}
    </div>
  );
}
