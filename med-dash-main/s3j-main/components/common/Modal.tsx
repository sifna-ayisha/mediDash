import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
        onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-fade-in-down"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 flex justify-between items-center border-b border-slate-200 flex-shrink-0">
          <h3 className="text-xl font-bold font-heading text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;