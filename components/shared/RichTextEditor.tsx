'use client'

import React, { memo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="h-[600px] bg-neutral-50 animate-pulse rounded-xl border border-neutral-100" />
});

interface RichTextEditorProps {
    content: string;
    setContent: (content: string) => void;
}

const RichTextEditor = ({ content, setContent }: RichTextEditorProps) => {
    return (
        <div className="min-h-[600px] rich-text-editor">
            <ReactQuill
                theme="snow"
                value={content || ''}
                onChange={setContent}
                className="h-[550px]"
                modules={{
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link', 'image', 'clean']
                    ],
                }}
            />
            <style jsx global>{`
                .rich-text-editor .ql-container {
                    border-bottom-left-radius: 20px;
                    border-bottom-right-radius: 20px;
                    background: white;
                }
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 20px;
                    border-top-right-radius: 20px;
                    background: #f8fafc;
                    border-color: #f1f5f9 !important;
                }
                .rich-text-editor .ql-container {
                    border-color: #f1f5f9 !important;
                    font-family: inherit;
                }
                .ql-snow.ql-toolbar button.ql-active, 
                .ql-snow .ql-toolbar button.ql-active, 
                .ql-snow.ql-toolbar .ql-picker-label.ql-active, 
                .ql-snow .ql-toolbar .ql-picker-label.ql-active, 
                .ql-snow.ql-toolbar .ql-picker-item.ql-selected, 
                .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
                    color: var(--color-brand) !important;
                }
                .ql-snow.ql-toolbar button.ql-active .ql-stroke, 
                .ql-snow .ql-toolbar button.ql-active .ql-stroke, 
                .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke, 
                .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke, 
                .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke, 
                .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke {
                    stroke: var(--color-brand) !important;
                }
                .ql-snow.ql-toolbar button.ql-active .ql-fill, 
                .ql-snow .ql-toolbar button.ql-active .ql-fill, 
                .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill, 
                .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill, 
                .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill, 
                .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill {
                    fill: var(--color-brand) !important;
                }
            `}</style>
        </div>
    );
};

export default memo(RichTextEditor);
