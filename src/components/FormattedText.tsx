'use client';

import { formatResponse, replacePlaceholders } from '@/lib/formatText';

interface FormattedTextProps {
  text: string;
  className?: string;
  skipFormatting?: boolean;
}

export function FormattedText({ text, className = '', skipFormatting = false}: FormattedTextProps) {
  // Format the text using the formatResponse function
  const formattedText = skipFormatting ? text : formatResponse(text);

  return (
    <div 
      className={`whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedText }}
    />
  );
} 