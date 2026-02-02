'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, Underline as UnderlineIcon,
    List, ListOrdered, Quote, Heading1, Heading2,
    Link as LinkIcon, Image as ImageIcon, Undo, Redo
} from 'lucide-react';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl max-w-full h-auto my-4',
                },
            }),
            Placeholder.configure({
                placeholder: 'İçeriğinizi buraya yazın...',
            }),
        ],
        content: content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
    });

    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt('Görsel URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL:', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <div className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 p-2 flex flex-wrap gap-1">
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                >
                    <Bold size={18} />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                >
                    <Italic size={18} />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive('underline')}
                >
                    <UnderlineIcon size={18} />
                </MenuButton>

                <div className="w-px h-6 bg-gray-200 dark:bg-slate-800 mx-1 self-center" />

                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive('heading', { level: 1 })}
                >
                    <Heading1 size={18} />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive('heading', { level: 2 })}
                >
                    <Heading2 size={18} />
                </MenuButton>

                <div className="w-px h-6 bg-gray-200 dark:bg-slate-800 mx-1 self-center" />

                <MenuButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                >
                    <List size={18} />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                >
                    <ListOrdered size={18} />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive('blockquote')}
                >
                    <Quote size={18} />
                </MenuButton>

                <div className="w-px h-6 bg-gray-200 dark:bg-slate-800 mx-1 self-center" />

                <MenuButton onClick={setLink} active={editor.isActive('link')}>
                    <LinkIcon size={18} />
                </MenuButton>
                <MenuButton onClick={addImage}>
                    <ImageIcon size={18} />
                </MenuButton>

                <div className="w-px h-6 bg-gray-200 dark:bg-slate-800 mx-1 self-center ml-auto" />

                <MenuButton onClick={() => editor.chain().focus().undo().run()}>
                    <Undo size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().redo().run()}>
                    <Redo size={18} />
                </MenuButton>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
};

const MenuButton = ({ onClick, active, children }: { onClick: () => void, active?: boolean, children: React.ReactNode }) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-2 rounded-lg transition-all ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'}`}
    >
        {children}
    </button>
);

export default TiptapEditor;
