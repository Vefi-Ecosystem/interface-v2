/* eslint-disable react/display-name */
import { forwardRef, useMemo, useState } from "react";

interface TokenListModalProps {
  selectedTokens: string[];
  onItemClick: (selected: string) => any;
  close?: () => any;
}

const TokenListModal = forwardRef<HTMLDialogElement, TokenListModalProps>(({ selectedTokens, onItemClick, close }, ref) => {
  const modalId = useMemo(() => "swap-modal-" + Date.now() + "-" + Math.floor(Math.random() * Date.now()), []);
  const [searchValue, setSearchValue] = useState("");
  return (
    <dialog ref={ref} id={modalId} className="modal">
      <div className="bg-[#1a1a1a] rounded-[3.679px] modal-box flex flex-col justify-start items-center gap-7 z-20 overflow-hidden"></div>
    </dialog>
  );
});

export default TokenListModal;