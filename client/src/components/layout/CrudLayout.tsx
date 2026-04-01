import React from 'react';
import { PageHeader } from './PageHeader';
import { PageContainer } from './PageContainer';
import { MdInfoOutline, MdWarningAmber } from 'react-icons/md';

interface CrudLayoutProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  toolbar?: React.ReactNode;
  pagination?: React.ReactNode;
  flash?: string;
  error?: string;
  children: React.ReactNode;
}

export function CrudLayout({
  title,
  description,
  action,
  toolbar,
  pagination,
  flash,
  error,
  children,
}: CrudLayoutProps) {
  return (
    <div className="page-wrapper">
      <PageHeader title={title} description={description} action={action} />

      {toolbar && <div className="crud-toolbar">{toolbar}</div>}

      {flash && (
        <div className="alert success">
          <MdInfoOutline size={20} /> {flash}
        </div>
      )}

      {error && (
        <div className="alert error">
          <MdWarningAmber size={20} /> {error}
        </div>
      )}

      <PageContainer>
        {children}
        {pagination && <div className="crud-pagination">{pagination}</div>}
      </PageContainer>
    </div>
  );
}

export default CrudLayout;
