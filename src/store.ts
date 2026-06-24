import { useState, useEffect } from 'react';
import { Project, Scene, CanvasData } from './types';

const PROJECTS_KEY = 'sw_projects';
const CANVAS_KEY = 'sw_canvas';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveProjects(projects: Project[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

function loadCanvas(projectId: string): CanvasData {
  try {
    const raw = localStorage.getItem(`${CANVAS_KEY}_${projectId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { notes: [], images: [] };
}

function saveCanvas(projectId: string, data: CanvasData) {
  localStorage.setItem(`${CANVAS_KEY}_${projectId}`, JSON.stringify(data));
}

export function useStore() {
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [canvas, setCanvas] = useState<CanvasData>({ notes: [], images: [] });

  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;
  const activeScene = activeProject?.scenes.find(s => s.id === activeSceneId) ?? null;

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (activeProjectId) {
      setCanvas(loadCanvas(activeProjectId));
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (activeProjectId) {
      saveCanvas(activeProjectId, canvas);
    }
  }, [canvas, activeProjectId]);

  // Auto-select first project/scene on load
  useEffect(() => {
    if (projects.length > 0 && !activeProjectId) {
      const p = projects[0];
      setActiveProjectId(p.id);
      if (p.scenes.length > 0) setActiveSceneId(p.scenes[0].id);
    }
  }, []);

  function createProject(title: string) {
    const scene: Scene = { id: generateId(), title: '第一章', content: '' };
    const project: Project = {
      id: generateId(),
      title,
      scenes: [scene],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setProjects(prev => [...prev, project]);
    setActiveProjectId(project.id);
    setActiveSceneId(scene.id);
  }

  function deleteProject(id: string) {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(null);
      setActiveSceneId(null);
    }
  }

  function updateProjectTitle(id: string, title: string) {
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, title, updatedAt: Date.now() } : p
    ));
  }

  function createScene(projectId: string, title: string) {
    const scene: Scene = { id: generateId(), title, content: '' };
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, scenes: [...p.scenes, scene], updatedAt: Date.now() }
        : p
    ));
    setActiveSceneId(scene.id);
  }

  function deleteScene(projectId: string, sceneId: string) {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const scenes = p.scenes.filter(s => s.id !== sceneId);
      return { ...p, scenes, updatedAt: Date.now() };
    }));
    if (activeSceneId === sceneId) {
      const p = projects.find(p => p.id === projectId);
      const remaining = p?.scenes.filter(s => s.id !== sceneId) ?? [];
      setActiveSceneId(remaining[0]?.id ?? null);
    }
  }

  function updateSceneTitle(projectId: string, sceneId: string, title: string) {
    setProjects(prev => prev.map(p =>
      p.id !== projectId ? p : {
        ...p,
        scenes: p.scenes.map(s => s.id === sceneId ? { ...s, title } : s),
        updatedAt: Date.now(),
      }
    ));
  }

  function updateSceneContent(projectId: string, sceneId: string, content: string) {
    setProjects(prev => prev.map(p =>
      p.id !== projectId ? p : {
        ...p,
        scenes: p.scenes.map(s => s.id === sceneId ? { ...s, content } : s),
        updatedAt: Date.now(),
      }
    ));
  }

  function reorderScenes(projectId: string, scenes: Scene[]) {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, scenes, updatedAt: Date.now() } : p
    ));
  }

  return {
    projects,
    activeProject,
    activeScene,
    activeProjectId,
    activeSceneId,
    canvas,
    setCanvas,
    setActiveProjectId: (id: string) => {
      setActiveProjectId(id);
      const p = projects.find(p => p.id === id);
      setActiveSceneId(p?.scenes[0]?.id ?? null);
    },
    setActiveSceneId,
    createProject,
    deleteProject,
    updateProjectTitle,
    createScene,
    deleteScene,
    updateSceneTitle,
    updateSceneContent,
    reorderScenes,
  };
}
