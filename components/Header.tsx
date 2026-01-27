
import React from 'react';
import { MinerStatus } from '../types';
import PillNav, { PillNavItem } from './PillNav';

interface HeaderProps {
  status: MinerStatus;
  onLogout: () => void;
  onSettingsClick: () => void;
}

// Placeholder logo as a data URI (abstract-028 icon)
const PLACEHOLDER_LOGO = 'data:image/svg+xml;base64,' + btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M 10 100 C 10 65 30 55 50 55 C 70 55 90 65 90 100 Z" fill="white" />
  <circle cx="33" cy="32" r="16" fill="white" />
  <path d="M 21 32 A 12 12 0 0 1 45 32 Z" fill="black" />
  <circle cx="67" cy="32" r="16" fill="white" />
  <path d="M 55 32 A 12 12 0 0 1 79 32 Z" fill="black" />
  <path d="M 20 45 L 80 45 L 50 85 Z" fill="#F7931E" />
</svg>
`);

const Header: React.FC<HeaderProps> = ({ status, onLogout, onSettingsClick }) => {
  const isActive = status === MinerStatus.MINING || status === MinerStatus.TAB_MINING;

  // Nav items with logout handler for the Logout button
  const navItems: PillNavItem[] = [
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Settings', href: '#settings', onClick: onSettingsClick },
    { label: 'Logout', href: '#logout', onClick: onLogout },
  ];

  return (
    <header className="sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-center relative">
        {/* PillNav Section - Centered */}
        <div className="flex items-center justify-center">
          <PillNav
            logo={PLACEHOLDER_LOGO}
            logoAlt="Pengu Runner"
            items={navItems}
            activeHref="#dashboard"
            baseColor="linear-gradient(145deg, #2e2d2d, #212121)"
            pillColor="#060010"
            hoveredPillTextColor="#060010"
            pillTextColor="#fff"
            className="!relative !top-0 !left-0 !w-auto"
            initialLoadAnimation={true}
          />
        </div>

        {/* Status Indicator - Positioned to the right */}
        <div className="absolute right-4 flex items-center gap-3 bg-zinc-900/40 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 text-white shadow-lg">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' :
            status === MinerStatus.THROTTLED ? 'bg-yellow-500 animate-pulse' :
              'bg-zinc-600'
            }`} />

        </div>
      </div>
    </header>
  );
};

export default Header;
