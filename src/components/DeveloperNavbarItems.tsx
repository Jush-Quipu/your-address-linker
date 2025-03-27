
import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Server, Book, Beaker, ListChecks, BarChart } from 'lucide-react';

export const getDeveloperNavItems = () => [
  { 
    to: '/developer', 
    label: 'Developer Home', 
    authRequired: true, 
    icon: <Code className="h-4 w-4 mr-2" /> 
  },
  { 
    to: '/developer/apps', 
    label: 'Register App', 
    authRequired: true, 
    icon: <Server className="h-4 w-4 mr-2" /> 
  },
  { 
    to: '/developer/docs', 
    label: 'Documentation', 
    authRequired: true, 
    icon: <Book className="h-4 w-4 mr-2" /> 
  },
  { 
    to: '/developer/sandbox', 
    label: 'Sandbox', 
    authRequired: true, 
    icon: <Beaker className="h-4 w-4 mr-2" /> 
  },
  { 
    to: '/developer/todo', 
    label: 'Todo List', 
    authRequired: true, 
    icon: <ListChecks className="h-4 w-4 mr-2" /> 
  },
  { 
    to: '/developer/analytics', 
    label: 'Analytics', 
    authRequired: true, 
    icon: <BarChart className="h-4 w-4 mr-2" /> 
  }
];

export const DeveloperNavItems: React.FC<{
  currentPath: string;
  onItemClick?: () => void;
}> = ({ currentPath, onItemClick }) => {
  const developerNavItems = getDeveloperNavItems();
  
  return (
    <>
      {developerNavItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`py-2 px-4 rounded-md transition-colors flex items-center ${
            currentPath === item.to || currentPath.startsWith(`${item.to}/`)
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-muted'
          }`}
          onClick={onItemClick}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </>
  );
};

export default DeveloperNavItems;
