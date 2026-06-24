import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useMemo } from 'react';
import type { Scene } from '../types';

interface Props {
  scene: Scene | null;
  projectTitle: string;
  sidebarOpen: boolean;
  canvasOpen: boolean;
  onToggleSidebar: () => void;
  onToggleCanvas: () => void;
  onContentChange: (content: string) => void;
}

function countChars(html: string): number {
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || '').replace(/\s/g, '').length;
}

function ToolbarButton({ onClick, active, children, title }: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      className={`px-2 py-1 rounded text-sm font-['Noto_Serif_JP'] transition-colors ${
        active
          ? 'bg-[#8b6f5e] text-white'
          : 'text-[#5a4a3a] hover:bg-[#c4a882]/30'
      }`}
    >
      {children}
    </button>
  );
}

export default function Editor({ scene, projectTitle, sidebarOpen, canvasOpen, onToggleSidebar, onToggleCanvas, onContentChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'ここに本文を書く…' }),
    ],
    content: scene?.content ? JSON.parse(scene.content) : '',
    onUpdate: ({ editor }) => {
      onContentChange(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: { class: 'ProseMirror' },
    },
  });

  // Switch content when scene changes
  useEffect(() => {
    if (!editor || !scene) return;
    const current = JSON.stringify(editor.getJSON());
    if (current !== scene.content) {
      editor.commands.setContent(scene.content ? JSON.parse(scene.content) : '');
    }
  }, [scene?.id]);

  const charCount = useMemo(() => {
    if (!editor) return 0;
    return countChars(editor.getHTML());
  }, [editor?.state]);

  if (!scene) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#b0a090] text-sm">
        <div className="text-center">
          <div className="text-4xl mb-4 opacity-30">✍</div>
          <p>左のサイドバーでシーンを選択するか、新規作成してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#faf6f1]">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[#c4a882]/40 bg-[#f5f0eb] shrink-0">
        {/* Sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
          className="text-[#8b6f5e] hover:text-[#5a3e2b] hover:bg-[#c4a882]/20 rounded px-1.5 py-1 text-base leading-none mr-1"
        >
          {sidebarOpen ? '‹' : '›'}
        </button>
        <div className="w-px h-5 bg-[#c4a882]/50 mr-1" />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor?.isActive('heading', { level: 1 })}
          title="タイトル"
        >
          タイトル
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor?.isActive('heading', { level: 2 })}
          title="見出し"
        >
          見出し
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor?.isActive('heading', { level: 3 })}
          title="小見出し"
        >
          小見出し
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().setParagraph().run()}
          active={editor?.isActive('paragraph')}
          title="本文"
        >
          本文
        </ToolbarButton>

        <div className="mx-2 h-5 w-px bg-[#c4a882]/50" />

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive('bold')}
          title="太字"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive('italic')}
          title="イタリック"
        >
          <em>I</em>
        </ToolbarButton>

        <div className="flex-1" />

        <span className="text-xs text-[#8b6f5e] font-mono mr-2">{charCount.toLocaleString()} 字</span>
        <div className="w-px h-5 bg-[#c4a882]/50 ml-1" />
        {/* Canvas toggle */}
        <button
          onClick={onToggleCanvas}
          title={canvasOpen ? 'キャンバスを閉じる' : 'キャンバスを開く'}
          className="text-[#8b6f5e] hover:text-[#5a3e2b] hover:bg-[#c4a882]/20 rounded px-1.5 py-1 text-base leading-none ml-1"
        >
          {canvasOpen ? '›' : '‹'}
        </button>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto tiptap-editor">
        <EditorContent editor={editor} className="min-h-full" />
      </div>

      {/* Status bar */}
      <div className="px-4 py-1.5 border-t border-[#c4a882]/30 bg-[#f5f0eb] shrink-0 flex items-center gap-3 text-xs text-[#b0a090]">
        <span>{projectTitle}</span>
        <span>›</span>
        <span>{scene.title}</span>
        <div className="flex-1" />
        <span>合計 {charCount.toLocaleString()} 字</span>
      </div>
    </div>
  );
}
