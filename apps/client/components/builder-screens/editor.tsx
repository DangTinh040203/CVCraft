'use client';

import 'react-quill-new/dist/quill.snow.css';

import { cn } from '@repo/ui/lib/utils';
import dynamic from 'next/dynamic';
import { useCallback, useMemo } from 'react';
import type { QuillOptionsStatic } from 'react-quill-new';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
});

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  maxLength?: number;
  placeholder?: string;
  className?: string;
}

const Editor = ({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
}: EditorProps) => {
  const modules = useMemo<QuillOptionsStatic['modules']>(
    () => ({
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        [{ color: [] }],
      ],
    }),
    [],
  );

  const formats = useMemo<string[]>(
    () => ['bold', 'italic', 'underline', 'list', 'link', 'color'],
    [],
  );

  const handleChange = useCallback(
    (content: string) => {
      onChange(content);
    },
    [onChange],
  );

  return (
    <div
      onBlur={onBlur}
      className={cn(
        'relative',
        `
          [&_.ql-container]:rounded-b-xl [&_.ql-container]:border-gray-200/80
          [&_.ql-container]:bg-white/80 [&_.ql-container]:backdrop-blur-sm
          dark:[&_.ql-container]:border-gray-700/50
          dark:[&_.ql-container]:bg-gray-800/50
          dark:[&_.ql-toolbar]:border-gray-700/50
          dark:[&_.ql-toolbar]:bg-gray-800/50
          [&_.ql-editor]:min-h-[140px]
          [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-gray-200/80
          [&_.ql-toolbar]:bg-gray-50/80 [&_.ql-toolbar]:backdrop-blur-sm
        `,
        className,
      )}
    >
      <ReactQuill
        theme='snow'
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Write something...'}
      />
    </div>
  );
};

export default Editor;
