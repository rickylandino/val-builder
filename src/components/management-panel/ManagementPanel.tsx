import React, { useState } from 'react';
import { ManageValItems } from './ManageValItems';

export const ManagementPanel: React.FC = () => {
  const [activeNav, setActiveNav] = useState<'valItems'>('valItems');

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col overflow-hidden">
      {/* Main Layout: Sidebar + Content */}
      <div
        className="flex flex-row gap-0 w-full"
      >
        {/* Left Sidebar Navigation */}
        <aside className="w-64 min-w-[200px] mr-8 py-6 px-4 flex flex-col gap-2 h-full overflow-hidden">
          <button
            type="button"
            className={`w-full flex items-center gap-2 px-4 py-3 font-semibold transition-colors duration-150 text-left cursor-pointer select-none
              ${activeNav === 'valItems'
                ? 'border-l-4 border-primary bg-primary/10 text-primary'
                : 'border-l-4 border-transparent text-gray-700 hover:bg-gray-100'}
            `}
            onClick={() => setActiveNav('valItems')}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActiveNav('valItems'); }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
            Manage VAL Items
          </button>
          {/* Future nav items can be added here */}
        </aside>
        {/* Main Content */}
        <main className="flex-1 bg-white  p-8 min-h-[400px] h-full overflow-hidden">
          {activeNav === 'valItems' && <ManageValItems />}
          {/* Future panels can be rendered here */}
        </main>
      </div>
    </div>
  );
};
