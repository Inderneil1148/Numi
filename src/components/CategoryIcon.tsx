import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Home,
  Car,
  ShoppingBag,
  Film,
  Activity,
  Zap,
  Briefcase,
  DollarSign,
  Laptop,
  Folder,
  Tag,
  CreditCard,
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  className = 'w-4 h-4',
  size = 18,
}) => {
  const strokeWidth = 2.2;
  switch (iconName) {
    case 'Utensils':
      return <Utensils size={size} strokeWidth={strokeWidth} className={className} />;
    case 'ShoppingCart':
      return <ShoppingCart size={size} strokeWidth={strokeWidth} className={className} />;
    case 'Home':
      return <Home size={size} strokeWidth={strokeWidth} className={className} />;
    case 'Car':
      return <Car size={size} strokeWidth={strokeWidth} className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag size={size} strokeWidth={strokeWidth} className={className} />;
    case 'Film':
      return <Film size={size} strokeWidth={strokeWidth} className={className} />;
    case 'Activity':
      return <Activity size={size} strokeWidth={strokeWidth} className={className} />;
    case 'Zap':
      return <Zap size={size} strokeWidth={strokeWidth} className={className} />;
    case 'Briefcase':
      return <Briefcase size={size} strokeWidth={strokeWidth} className={className} />;
    case 'DollarSign':
      return <DollarSign size={size} strokeWidth={strokeWidth} className={className} />;
    case 'Laptop':
      return <Laptop size={size} strokeWidth={strokeWidth} className={className} />;
    case 'Folder':
      return <Folder size={size} strokeWidth={strokeWidth} className={className} />;
    case 'Tag':
      return <Tag size={size} strokeWidth={strokeWidth} className={className} />;
    default:
      return <CreditCard size={size} strokeWidth={strokeWidth} className={className} />;
  }
};
