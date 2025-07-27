declare module 'react-markdown' {
  import React from 'react';
  
  export interface ReactMarkdownProps {
    children: string;
    remarkPlugins?: any[];
    components?: {
      [key: string]: React.ComponentType<any> | ((props: any) => React.ReactNode);
    };
    className?: string;
  }
  
  const ReactMarkdown: React.FC<ReactMarkdownProps>;
  export default ReactMarkdown;
} 