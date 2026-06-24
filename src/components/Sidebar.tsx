import { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Project, Scene } from '../types';

interface Props {
  projects: Project[];
  activeProjectId: string | null;
  activeSceneId: string | null;
  onSelectProject: (id: string) => void;
  onSelectScene: (id: string) => void;
  onClose: () => void;
  onCreateProject: (title: string) => void;
  onDeleteProject: (id: string) => void;
  onCreateScene: (projectId: string, title: string) => void;
  onDeleteScene: (projectId: string, sceneId: string) => void;
  onUpdateSceneTitle: (projectId: string, sceneId: string, title: string) => void;
  onReorderScenes: (projectId: string, scenes: Scene[]) => void;
}

function SortableScene({ scene, isActive, onSelect, onDelete, onRename }: {
  scene: Scene;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(scene.title);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: scene.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const commit = () => {
    setEditing(false);
    if (draft.trim()) onRename(draft.trim());
    else setDraft(scene.title);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer group text-sm ${
        isActive ? 'bg-[#c4a882]/40 text-[#2c2320]' : 'hover:bg-[#c4a882]/20 text-[#5a4a3a]'
      }`}
    >
      <span {...attributes} {...listeners} className="text-[#c4a882] cursor-grab active:cursor-grabbing select-none text-xs">⠿</span>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false); setDraft(scene.title); } }}
          className="flex-1 bg-transparent border-b border-[#8b6f5e] outline-none text-sm font-['Noto_Serif_JP']"
        />
      ) : (
        <span className="flex-1 truncate" onClick={onSelect} onDoubleClick={() => setEditing(true)}>
          {scene.title}
        </span>
      )}
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 text-[#8b6f5e] hover:text-red-500 text-xs px-1"
        title="削除"
      >✕</button>
    </div>
  );
}

export default function Sidebar({
  projects, activeProjectId, activeSceneId,
  onSelectProject, onSelectScene, onCreateProject, onDeleteProject,
  onCreateScene, onDeleteScene, onUpdateSceneTitle, onReorderScenes, onClose,
}: Props) {
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newSceneTitle, setNewSceneTitle] = useState('');
  const [showNewScene, setShowNewScene] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId);
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    if (!activeProject) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = activeProject.scenes.findIndex(s => s.id === active.id);
      const newIndex = activeProject.scenes.findIndex(s => s.id === over.id);
      onReorderScenes(activeProject.id, arrayMove(activeProject.scenes, oldIndex, newIndex));
    }
  }

  return (
    <div className="w-60 shrink-0 bg-[#ede7df] border-r border-[#c4a882]/50 flex flex-col h-screen">
      {/* App title */}
      <div className="px-4 py-4 border-b border-[#c4a882]/40 flex items-center justify-between">
        <h1 className="text-base font-bold text-[#5a3e2b] tracking-widest">StoryWeaver</h1>
        <button onClick={onClose} title="サイドバーを閉じる" className="text-[#8b6f5e] hover:text-[#5a3e2b] text-lg leading-none">‹</button>
      </div>

      {/* Projects */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#8b6f5e] tracking-wider font-medium">プロジェクト</span>
          <button onClick={() => setShowNewProject(v => !v)} className="text-[#8b6f5e] hover:text-[#5a3e2b] text-sm">＋</button>
        </div>
        {showNewProject && (
          <form onSubmit={e => { e.preventDefault(); if (newProjectTitle.trim()) { onCreateProject(newProjectTitle.trim()); setNewProjectTitle(''); setShowNewProject(false); }}}>
            <input
              autoFocus
              value={newProjectTitle}
              onChange={e => setNewProjectTitle(e.target.value)}
              placeholder="プロジェクト名"
              className="w-full bg-white/60 border border-[#c4a882] rounded px-2 py-1 text-sm outline-none mb-1 font-['Noto_Serif_JP']"
            />
          </form>
        )}
        <div className="space-y-0.5">
          {projects.map(p => (
            <div
              key={p.id}
              className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer group text-sm font-medium ${
                activeProjectId === p.id ? 'bg-[#8b6f5e]/20 text-[#2c2320]' : 'hover:bg-[#c4a882]/20 text-[#5a4a3a]'
              }`}
              onClick={() => onSelectProject(p.id)}
            >
              <span className="flex-1 truncate">📁 {p.title}</span>
              <button
                onClick={e => { e.stopPropagation(); onDeleteProject(p.id); }}
                className="opacity-0 group-hover:opacity-100 text-[#8b6f5e] hover:text-red-500 text-xs"
              >✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      {activeProject && <div className="mx-3 my-2 border-t border-[#c4a882]/40" />}

      {/* Scenes */}
      {activeProject && (
        <div className="px-3 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#8b6f5e] tracking-wider font-medium">シーン / セクション</span>
            <button onClick={() => setShowNewScene(v => !v)} className="text-[#8b6f5e] hover:text-[#5a3e2b] text-sm">＋</button>
          </div>
          {showNewScene && (
            <form onSubmit={e => { e.preventDefault(); if (newSceneTitle.trim()) { onCreateScene(activeProject.id, newSceneTitle.trim()); setNewSceneTitle(''); setShowNewScene(false); }}}>
              <input
                autoFocus
                value={newSceneTitle}
                onChange={e => setNewSceneTitle(e.target.value)}
                placeholder="シーン名"
                className="w-full bg-white/60 border border-[#c4a882] rounded px-2 py-1 text-sm outline-none mb-1 font-['Noto_Serif_JP']"
              />
            </form>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={activeProject.scenes.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {activeProject.scenes.map(scene => (
                <SortableScene
                  key={scene.id}
                  scene={scene}
                  isActive={activeSceneId === scene.id}

                  onSelect={() => onSelectScene(scene.id)}
                  onDelete={() => onDeleteScene(activeProject.id, scene.id)}
                  onRename={title => onUpdateSceneTitle(activeProject.id, scene.id, title)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Bottom hint */}
      <div className="px-4 py-3 text-xs text-[#b0a090] border-t border-[#c4a882]/30">
        シーン名をダブルクリックで編集
      </div>
    </div>
  );
}
