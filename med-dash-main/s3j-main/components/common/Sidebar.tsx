import React from 'react';
import * as Icons from 'lucide-react';
import { NavItem, ClinicSettings } from '../../types';

interface SidebarProps {
  navItems: NavItem[];
  activeView: string;
  onNavigate: (view: string) => void;
  clinicSettings: ClinicSettings;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, activeView, onNavigate, clinicSettings, isOpen, onClose }) => {
  const sidebarClasses = `
    bg-white text-slate-600 border-r border-slate-200 flex-shrink-0 flex flex-col 
    fixed md:relative inset-y-0 left-0 z-40
    w-72 md:w-64
    transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0
  `;

  return (
      <aside className={sidebarClasses}>
        <div className="p-4 flex items-center justify-between border-b border-slate-200 h-20">
           <div className="flex items-center">
             {clinicSettings.logo ? (
                  <img src={clinicSettings.logo} alt="Clinic Logo" className="h-10 w-auto" />
             ) : (
                  <Icons.Hospital size={32} className="text-blue-500 flex-shrink-0" />
             )}
             <h1 className="ml-3 font-heading text-2xl font-bold text-slate-800 whitespace-nowrap">
               {clinicSettings.name}
             </h1>
           </div>
           <button onClick={onClose} className="md:hidden text-slate-500 hover:text-slate-700">
              <Icons.X size={24} />
           </button>
        </div>

        <nav className="flex-grow py-4 space-y-2 px-4">
          {navItems.map((item) => {
            const IconComponent = Icons[item.icon] as React.ElementType;
            const isActive = activeView === item.name;
            return (
              <a
                key={item.name}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.name);
                }}
                className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                  isActive 
                  ? 'bg-blue-50 text-blue-600 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-600 rounded-r-full"></div>}
                {IconComponent && <IconComponent className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />}
                <span className="ml-3 whitespace-nowrap">{item.name}</span>
              </a>
            );
          })}
        </nav>
      </aside>
  );
};

export default Sidebar;