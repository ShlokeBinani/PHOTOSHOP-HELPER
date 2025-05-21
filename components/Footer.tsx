
import React from 'react';
import { FOOTER_TEXT } from '../constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800/30 py-6 text-center mt-auto">
      <div className="container mx-auto px-4">
        <p className="text-sm text-slate-400">{FOOTER_TEXT}</p>
      </div>
    </footer>
  );
};
