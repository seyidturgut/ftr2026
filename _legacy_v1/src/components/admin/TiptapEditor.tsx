import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
    Quote, Image as ImageIcon, Link as LinkIcon, AlignLeft,
    AlignCenter, AlignRight, Heading1, Heading2, Heading3
} from 'lucide-react';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
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

    const Button = ({ onClick, isActive, children, title }: any) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-2 rounded transition-colors ${isActive ? 'bg-sky-100 text-sky-600' : 'hover:bg-slate-100 text-slate-600'
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 transition-all">
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="H1"
            >
                <Heading1 size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="H2"
            >
                <Heading2 size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="H3"
            >
                <Heading3 size={18} />
            </Button>

            <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

            <Button
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Kalın"
            >
                <Bold size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="İtalik"
            >
                <Italic size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Altı Çizili"
            >
                <UnderlineIcon size={18} />
            </Button>

            <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

            <Button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
                title="Sola Yasla"
            >
                <AlignLeft size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
                title="Ortala"
            >
                <AlignCenter size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
                title="Sağa Yasla"
            >
                <AlignRight size={18} />
            </Button>

            <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

            <Button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Sırasız Liste"
            >
                <List size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Sıralı Liste"
            >
                <ListOrdered size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Alıntı"
            >
                <Quote size={18} />
            </Button>

            <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

            <Button onClick={setLink} isActive={editor.isActive('link')} title="Bağlantı Ekle">
                <LinkIcon size={18} />
            </Button>
            <Button onClick={addImage} title="Görsel Ekle">
                <ImageIcon size={18} />
            </Button>
        </div>
    );
};

const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange, placeholder }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Image,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-sky-600 underline cursor-pointer',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Placeholder.configure({
                placeholder: placeholder || 'İçeriğinizi buraya yazın...',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] px-6 py-4 max-w-none dark:prose-invert',
            },
        },
    });

    // Update editor content if content prop changes (for editing mode)
    React.useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className="w-full border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-sky-500 transition-all bg-white">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default TiptapEditor;
