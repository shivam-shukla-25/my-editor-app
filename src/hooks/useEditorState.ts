import { useReducer, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

export type TextLayer = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  opacity: number;
  align: "left" | "center" | "right";
  zIndex: number;
  locked?: boolean;
};

export type EditorState = {
  background: { src: string; width: number; height: number } | null;
  currentSelectionId?: string | null;
  textLayers: TextLayer[];
};

type History = {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
};

const initialState: EditorState = {
  background: null,
  currentSelectionId: null,
  textLayers: [],
};

const HISTORY_LIMIT = 20;

type Action =
  | {
      type: "SET_BACKGROUND";
      payload: { src: string; width: number; height: number };
    }
  | { type: "ADD_TEXT" }
  | { type: "UPDATE_TEXT"; payload: { id: string; patch: Partial<TextLayer> } }
  | { type: "DELETE_TEXT"; payload: { id: string } }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET" }
  | { type: "SET_TEXT_LAYER"; payload: TextLayer };

function editorReducer(state: History, action: Action): History {
  const { past, present, future } = state;
  const push = (nextPresent: EditorState): History => {
    const newPast = [...past, present].slice(-HISTORY_LIMIT);
    return { past: newPast, present: nextPresent, future: [] };
  };

  switch (action.type) {
    case "SET_BACKGROUND":
      return push({ ...present, background: action.payload });
    case "ADD_TEXT": {
      const newText: TextLayer = {
        id: uuidv4(),
        x: (present.background?.width ?? 800) / 2 - 100,
        y: (present.background?.height ?? 600) / 2 - 30,
        width: 200,
        height: 60,
        rotation: 0,
        text: "New text",
        fontFamily: "Roboto",
        fontSize: 36,
        color: "#000000",
        opacity: 1,
        align: "center",
        zIndex: present.textLayers.length,
        locked: false,
      };
      return push({
        ...present,
        textLayers: [...present.textLayers, newText],
        currentSelectionId: newText.id,
      });
    }
    case "UPDATE_TEXT": {
      const updated = present.textLayers.map((t) =>
        t.id === action.payload.id ? { ...t, ...action.payload.patch } : t
      );
      return push({ ...present, textLayers: updated });
    }
    case "DELETE_TEXT":
      return push({
        ...present,
        textLayers: present.textLayers.filter(
          (t) => t.id !== action.payload.id
        ),
      });
    case "UNDO":
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      return {
        past: past.slice(0, -1),
        present: previous,
        future: [present, ...future],
      };
    case "REDO":
      if (future.length === 0) return state;
      const next = future[0];
      return {
        past: [...past, present],
        present: next,
        future: future.slice(1),
      };
    case "SET_TEXT_LAYER":
      return {
        ...state,
        present: {
          ...state.present,
          textLayers: action.payload,
        },
      };
    case "RESET":
      return { past: [], present: initialState, future: [] };
    default:
      return state;
  }
}

export function useEditorState() {
  const [history, dispatch] = useReducer(editorReducer, {
    past: [],
    present: initialState,
    future: [],
  });

  const addText = useCallback(() => dispatch({ type: "ADD_TEXT" }), []);
  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);
  const reset = useCallback(() => {
    localStorage.clear();
    dispatch({ type: "RESET" });
  }, []);
  const setTextLayer = useCallback(
    (textLayer) => dispatch({ type: "SET_TEXT_LAYER", payload: textLayer }),
    []
  );

  return { history, dispatch, addText, undo, redo, reset, setTextLayer };
}
