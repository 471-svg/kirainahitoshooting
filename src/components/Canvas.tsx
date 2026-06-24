import { useRef, useState } from 'react';
import type { CanvasData, StickyNote, CanvasImage } from '../types';

const NOTE_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff'];

interface Props {
  data: CanvasData;
  onChange: (data: CanvasData) => void;
  onClose: () => void;
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function Canvas({ data, onChange, onClose }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ id: string; type: 'note' | 'image'; ox: number; oy: number } | null>(null);

  function addNote() {
    const note: StickyNote = {
      id: generateId(),
      x: 40 + Math.random() * 100,
      y: 40 + Math.random() * 100,
      text: '',
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
    };
    onChange({ ...data, notes: [...data.notes, note] });
  }

  function updateNote(id: string, text: string) {
    onChange({ ...data, notes: data.notes.map(n => n.id === id ? { ...n, text } : n) });
  }

  function deleteNote(id: string) {
    onChange({ ...data, notes: data.notes.filter(n => n.id !== id) });
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img: CanvasImage = {
        id: generateId(),
        x: 60 + Math.random() * 80,
        y: 60 + Math.random() * 80,
        width: 180,
        height: 120,
        src: ev.target?.result as string,
      };
      onChange({ ...data, images: [...data.images, img] });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function deleteImage(id: string) {
    onChange({ ...data, images: data.images.filter(i => i.id !== id) });
  }

  function onMouseDown(e: React.MouseEvent, id: string, type: 'note' | 'image', itemX: number, itemY: number) {
    e.preventDefault();
    setDragging({ id, type, ox: e.clientX - itemX, oy: e.clientY - itemY });
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    const nx = e.clientX - dragging.ox;
    const ny = e.clientY - dragging.oy;
    if (dragging.type === 'note') {
      onChange({ ...data, notes: data.notes.map(n => n.id === dragging.id ? { ...n, x: nx, y: ny } : n) });
    } else {
      onChange({ ...data, images: data.images.map(i => i.id === dragging.id ? { ...i, x: nx, y: ny } : i) });
    }
  }

  return (
    <div className="w-72 shrink-0 bg-[#ede7df] border-l border-[#c4a882]/50 flex flex-col h-screen">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#c4a882]/40 flex items-center gap-2">
        <button onClick={onClose} title="キャンバスを閉じる" className="text-[#8b6f5e] hover:text-[#5a3e2b] text-lg leading-none mr-1">›</button>
        <span className="text-xs text-[#8b6f5e] font-medium tracking-wider flex-1">キャンバス</span>
        <button onClick={addNote} className="text-xs text-[#5a3e2b] hover:bg-[#c4a882]/30 px-2 py-1 rounded">付箋＋</button>
        <label className="text-xs text-[#5a3e2b] hover:bg-[#c4a882]/30 px-2 py-1 rounded cursor-pointer">
          画像＋
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>

      {/* Canvas area */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden"
        onMouseMove={onMouseMove}
        onMouseUp={() => setDragging(null)}
        onMouseLeave={() => setDragging(null)}
      >
        {/* Empty state */}
        {data.notes.length === 0 && data.images.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-[#c4a882] text-xs text-center p-6 select-none">
            付箋や画像を追加して<br />メモやイメージを整理
          </div>
        )}

        {/* Images */}
        {data.images.map(img => (
          <div
            key={img.id}
            className="absolute group"
            style={{ left: img.x, top: img.y, width: img.width }}
            onMouseDown={e => onMouseDown(e, img.id, 'image', img.x, img.y)}
          >
            <div className="relative cursor-grab active:cursor-grabbing shadow-md rounded overflow-hidden">
              <img src={img.src} alt="" style={{ width: '100%', height: img.height, objectFit: 'cover' }} />
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={() => deleteImage(img.id)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black/50 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >✕</button>
            </div>
          </div>
        ))}

        {/* Sticky notes */}
        {data.notes.map(note => (
          <div
            key={note.id}
            className="absolute group"
            style={{ left: note.x, top: note.y, width: 140 }}
            onMouseDown={e => onMouseDown(e, note.id, 'note', note.x, note.y)}
          >
            <div
              className="relative shadow-md rounded-sm p-2 cursor-grab active:cursor-grabbing"
              style={{ backgroundColor: note.color }}
            >
              <textarea
                value={note.text}
                onChange={e => updateNote(note.id, e.target.value)}
                onMouseDown={e => e.stopPropagation()}
                placeholder="メモ…"
                rows={4}
                className="w-full bg-transparent resize-none outline-none text-xs text-[#2c2320] placeholder-[#8b7a6a]/60 font-['Noto_Serif_JP'] leading-relaxed"
              />
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={() => deleteNote(note.id)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-[#5a4a3a]/50 hover:text-red-500 text-xs w-4 h-4 flex items-center justify-center"
              >✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-[#c4a882]/30 text-xs text-[#b0a090]">
        ドラッグで移動
      </div>
    </div>
  );
}
