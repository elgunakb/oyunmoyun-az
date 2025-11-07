import React, { useState } from 'react';
import { GAME_SECTIONS } from '../../utils/data';
import usePageTitle from '../../components/PageTitle';
import AccordionSection from '../../components/AccordionSection/AccordionSection';

function useAccordionState(initialOpenIds = []) {
  const [openMap, setOpenMap] = useState(() =>
    initialOpenIds.reduce((acc, k) => ((acc[k] = true), acc), {})
  );
  const toggle = (key) => setOpenMap((m) => ({ ...m, [key]: !m[key] }));
  const isOpen = (key) => !!openMap[key];
  return { isOpen, toggle };
}

export default function LandingPage() {
  usePageTitle('Quisor');

  // accordion default—
  const { isOpen, toggle } = useAccordionState(['multiplayer', 'singleplayer']);

  return (
    <main className="min-h-screen px-4 py-4 relative">
      {/*SEO  */}
      <h1 className="sr-only">ad seher oyunu</h1>

      <div className="relative mx-auto max-w-6xl text-white">
        {GAME_SECTIONS.map((section) => (
          <AccordionSection
            key={section.id}
            section={section}
            open={isOpen(section.id)}
            onToggle={() => toggle(section.id)}
          />
        ))}
      </div>
    </main>
  );
}
