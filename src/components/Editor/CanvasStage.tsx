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
  const [bgImage, setBgImage] = useState<string>("");
  const bg = editorState.background || bgImage;
  const imageSrc = typeof bg === "string" ? bg : bg?.src ?? "";
  const [img] = useImage(imageSrc);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    if (resetLocalStorage) {
      setBgImage("");
    }
  }, [resetLocalStorage]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("itc_state");
      if (saved) {
        const parsed: EditorState = JSON.parse(saved);
        setBgImage(
          typeof parsed.background === "string"
            ? parsed.background
            : parsed.background?.src ?? ""
        );
        dispatch({ type: "SET_EDITOR_STATE", payload: parsed });
      }
    } catch (err) {
      console.error("Failed to restore editor state:", err);
    }
  }, [dispatch]);

  // Scale stage to fit container but keep logical coordinates
  const containerWidth = 900;
  const containerHeight = 600;
  const isBgObject = (
    bg: typeof editorState.background | string
  ): bg is { src: string; width: number; height: number } =>
    typeof bg !== "string" && bg !== null;

  const displayScale = isBgObject(bg)
    ? Math.min(containerWidth / bg.width, containerHeight / bg.height)
    : 1;
  const stageWidth = isBgObject(bg) ? bg.width * displayScale : 800;
  const stageHeight = isBgObject(bg) ? bg.height * displayScale : 600;

  useEffect(() => {
    if (stageRef.current && bg) {
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

      {/* Export button (NEW) */}
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
