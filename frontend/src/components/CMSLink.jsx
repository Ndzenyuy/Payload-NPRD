import React from 'react';
import Link from 'next/link';

const CMSLink = ({ label, type, reference, url, className, children }) => {
  const isInternal = type === 'reference' && reference?.value?.slug;
  const href = isInternal 
    ? (reference.value.slug === 'index' || reference.value.slug === 'home' ? '/' : `/${reference.value.slug}`)
    : url;

  if (!href) return <span className={className}>{label || children}</span>;

  if (isInternal) {
    return (
      <Link href={href} className={className}>
        {label || children}
      </Link>
    );
  }

  return (
    <a 
      href={href} 
      className={className} 
      target="_blank" 
      rel="noopener noreferrer"
    >
      {label || children}
    </a>
  );
};

export default CMSLink;
