export interface Scene {
  id: string;
  title: string;
  content: string; // TipTap JSON string
}

export interface Project {
  id: string;
  title: string;
  scenes: Scene[];
  createdAt: number;
  updatedAt: number;
}

export interface StickyNote {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

export interface CanvasImage {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
}

export interface CanvasData {
  notes: StickyNote[];
  images: CanvasImage[];
}
