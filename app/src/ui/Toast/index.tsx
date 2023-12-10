import { useEffect, useState } from 'react';
import { FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import { MdDangerous } from 'react-icons/md';

type ToastProps = {
  show: boolean;
  duration?: number;
  message: string;
  onHide?: () => void;
  toastType?: 'success' | 'error' | 'info';
};

export default function Toast({ show, duration = 5, message, onHide, toastType = 'info' }: ToastProps) {
  const [shown, setShown] = useState<boolean>(false);

  useEffect(() => {
    setShown(show);
  }, [show]);

  useEffect(() => {
    if (shown) {
      setTimeout(() => {
        setShown(false);

        if (onHide) onHide();
      }, duration * 1000);
    }
  }, [duration, onHide, shown]);

  return (
    <>
      {shown && (
        <div
          className={`absolute top-[12%] lg:top-80 lg:right-10 px-3 py-2 min-w-[200px] text-[0.8em] gap-4 flex justify-between items-center border-t-[3px] bg-[#11261b] ${toastType === 'success'
            ? 'border-[#9afec8] text-[#02c35b]'
            : toastType === 'error'
              ? 'text-[#e32345] border-red-400'
              : 'text-[#FBAA19] border-blue-400'
            } shadow-[0px_2px_12px_rgba(60,_64,_73,_0.2)] rounded-[0px_0px_10px_10px] capitalize`}
        >
          {toastType === 'success' ? <FiCheckCircle /> : toastType === 'error' ? <MdDangerous /> : <FiInfo />}
          {message}
          <button
            className="btn btn-sm btn-square btn-ghost text-[#000]"
            onClick={() => {
              setShown(false);

              if (onHide) onHide();
            }}
          >
            <FiX />
          </button>
        </div>
      )}
    </>
  );
}
