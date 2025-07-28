
'use client';

import { ContainerProvider } from '../hooks/useContainer';
import { MusicConverter } from '../components/MusicConverter';

export default function Home() {
  return (
    <ContainerProvider>
      <MusicConverter />
    </ContainerProvider>
  );
}
