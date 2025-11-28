import React from 'react';
import * as Icons from 'lucide-react';

interface CardProps {
  title: string;
  value: string;
  icon: keyof typeof Icons;
  color?: string;
  change?: string;
}

const colorMap: { [key: string]: { bg: string; text: string } } = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

const Card: React.FC<CardProps> = ({ title, value, icon, color = 'blue', change }) => {
  const IconComponent = Icons[icon] as React.ElementType;
  const { bg, text } = colorMap[color] || colorMap.blue;

  const isPositive = change && change.startsWith('+');
  const ChangeIcon = isPositive ? Icons.ArrowUpRight : Icons.ArrowDownRight;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-smooth hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl ${bg}`}>
          {IconComponent && <IconComponent className={`w-6 h-6 ${text}`} />}
        </div>
      </div>
      {change && (
        <div className={`mt-4 flex items-center text-sm`}>
            <span className={`font-semibold flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                <ChangeIcon size={16} className="mr-1" />
                {change.split(' ')[0]} 
            </span>
            <span className="text-slate-500 ml-1.5">{change.split(' ').slice(1).join(' ')}</span>
        </div>
      )}
    </div>
  );
};

export default Card;