import React from 'react';
import { VscEmptyWindow } from 'react-icons/vsc';

export default function Empty() {
  return (
    <div className="flex justify-center items-center w-full flex-col text-white gap-3 font-Syne">
      <VscEmptyWindow className="text-[60px]" />
      <span className="text-[1em] font-[700]">There&apos;s nothing here</span>
    </div>
  );
}
