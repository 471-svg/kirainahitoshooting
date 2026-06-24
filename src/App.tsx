import { useStore } from './store';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Canvas from './components/Canvas';

export default function App() {
  const store = useStore();

  return (
    <div className="flex h-screen overflow-hidden">
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
      />

      <Editor
        scene={store.activeScene}
        projectTitle={store.activeProject?.title ?? ''}
        onContentChange={content => {
          if (store.activeProjectId && store.activeSceneId) {
            store.updateSceneContent(store.activeProjectId, store.activeSceneId, content);
          }
        }}
      />

      <Canvas
        data={store.canvas}
        onChange={store.setCanvas}
      />
    </div>
  );
}
