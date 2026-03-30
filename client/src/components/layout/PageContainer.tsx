import React from 'react';
import './PageLayout.css';

interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return <div className="page-container">{children}</div>;
}
