import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Image as KImage } from "react-konva";
import useImage from "use-image";
import TextNode from "./TextNode";
import type { EditorState } from "../../hooks/useEditorState";

const CanvasStage: React.FC<{
  editorState: EditorState;
  dispatch: any;
  resetLocalStorage: any;
}> = ({ editorState, dispatch, resetLocalStorage }) => {
  const stageRef = useRef<any>(null);

  // This will be the fallback if editorState.background is not set yet
  const [bgImage, setBgImage] = useState<{
    src: string;
    width: number;
    height: number;
  } | null>(null);

  // Always prefer background from state, otherwise use local fallback
  const bg = editorState.background || bgImage;
  const imageSrc = bg?.src ?? "";
  const [img] = useImage(imageSrc);

  // Type guard for background object
  const isBgObject = (
    bg: typeof editorState.background | null
  ): bg is { src: string; width: number; height: number } =>
    typeof bg === "object" && bg !== null && typeof bg.src === "string";

  // When reset is triggered
  useEffect(() => {
    if (resetLocalStorage) {
      setBgImage(null);
    }
  }, [resetLocalStorage]);

  // Restore from localStorage and normalize to object format
  useEffect(() => {
    try {
      const saved = localStorage.getItem("itc_state");
      if (saved) {
        const parsed: EditorState = JSON.parse(saved);

        let normalizedBg = null;
        if (typeof parsed.background === "string") {
          // If saved as a string, convert to object with default size until loaded
          normalizedBg = { src: parsed.background, width: 800, height: 600 };
        } else if (parsed.background && parsed.background.src) {
          normalizedBg = parsed.background;
        }

        setBgImage(normalizedBg);
        dispatch({
          type: "SET_EDITOR_STATE",
          payload: {
            ...parsed,
            background: normalizedBg,
          },
        });
      }
    } catch (err) {
      console.error("Failed to restore editor state:", err);
    }
  }, [dispatch]);

  // Scale stage to fit container
  const containerWidth = 900;
  const containerHeight = 600;
  const displayScale = isBgObject(bg)
    ? Math.min(containerWidth / bg.width, containerHeight / bg.height)
    : 1;
  const stageWidth = isBgObject(bg) ? bg.width * displayScale : 800;
  const stageHeight = isBgObject(bg) ? bg.height * displayScale : 600;

  useEffect(() => {
    if (stageRef.current && isBgObject(bg)) {
      stageRef.current.width(stageWidth);
      stageRef.current.height(stageHeight);
      stageRef.current.scale({ x: displayScale, y: displayScale });
      stageRef.current.draw();
    }
  }, [displayScale, bg, stageWidth, stageHeight]);

  const handleExport = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 }); // high-res export
      const link = document.createElement("a");
      link.download = "canvas-export.png";
      link.href = uri;
      link.click();
    }
  };

  return (
    <div>
      <div
        style={{
          width: stageWidth,
          height: stageHeight,
          border: "1px solid #e5e7eb",
          background: "#fff",
        }}
      >
        <Stage ref={stageRef} width={stageWidth} height={stageHeight}>
          <Layer>
            {img && isBgObject(bg) && (
              <KImage
                image={img}
                x={0}
                y={0}
                width={bg.width}
                height={bg.height}
              />
            )}
            {editorState.textLayers.map((t) => (
              <TextNode key={t.id} layer={t} dispatch={dispatch} />
            ))}
          </Layer>
        </Stage>
      </div>

      <button
        onClick={handleExport}
        style={{
          marginTop: "10px",
          padding: "6px 12px",
          background: "#4f46e5",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Export Image
      </button>
    </div>
  );
};

export default CanvasStage;
