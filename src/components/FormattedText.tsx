'use client';

import { formatResponse } from '@/lib/formatText';
import ReactMarkdown from 'react-markdown';

interface FormattedTextProps {
  text: string;
  className?: string;
  skipFormatting?: boolean;
  markdown?: boolean;
}

export function FormattedText({ 
  text, 
  className = '', 
  skipFormatting = false,
  markdown = false,
}: FormattedTextProps) {
  // Format the text using the formatResponse function
  const formattedText = skipFormatting || markdown ? text : formatResponse(text);
  
  if (markdown) {
    return (
      <ReactMarkdown className={`whitespace-pre-wrap ${className} overflow-hidden`}>
        {formattedText}
      </ReactMarkdown>
    );
  }

  return (
    <div 
      className={`whitespace-pre-wrap ${className} overflow-hidden`}
      dangerouslySetInnerHTML={{ __html: formattedText }}
    />
  );
} 