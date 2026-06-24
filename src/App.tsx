import { useState } from 'react';
import { useStore } from './store';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Canvas from './components/Canvas';

export default function App() {
  const store = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [canvasOpen, setCanvasOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          projects={store.projects}
          activeProjectId={store.activeProjectId}
          activeSceneId={store.activeSceneId}
          onSelectProject={store.setActiveProjectId}
          onSelectScene={store.setActiveSceneId}
          onCreateProject={store.createProject}
          onDeleteProject={store.deleteProject}
          onCreateScene={store.createScene}
          onDeleteScene={store.deleteScene}
          onUpdateSceneTitle={store.updateSceneTitle}
          onReorderScenes={store.reorderScenes}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <Editor
        scene={store.activeScene}
        projectTitle={store.activeProject?.title ?? ''}
        sidebarOpen={sidebarOpen}
        canvasOpen={canvasOpen}
        onToggleSidebar={() => setSidebarOpen(v => !v)}
        onToggleCanvas={() => setCanvasOpen(v => !v)}
        onContentChange={content => {
          if (store.activeProjectId && store.activeSceneId) {
            store.updateSceneContent(store.activeProjectId, store.activeSceneId, content);
          }
        }}
      />

      {canvasOpen && (
        <Canvas
          data={store.canvas}
          onChange={store.setCanvas}
          onClose={() => setCanvasOpen(false)}
        />
      )}
    </div>
  );
}
