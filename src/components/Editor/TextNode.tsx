import React, { useRef, useEffect, useState } from "react";
import { Group, Text, Transformer } from "react-konva";
import type { TextLayer } from "../../hooks/useEditorState";

const TextNode: React.FC<{ layer: TextLayer; dispatch: any }> = ({
  layer,
  dispatch,
}) => {
  const textRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Restore design from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("textLayers");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed)) {
          parsed.forEach((savedLayer) => {
            if (savedLayer.id === layer.id) {
              dispatch({
                type: "UPDATE_TEXT",
                payload: { id: layer.id, patch: savedLayer },
              });
            }
          });
        }
      } catch (err) {
        console.error("Failed to parse saved design:", err);
      }
    }
  }, [layer.id, dispatch]);

  // Save design to localStorage whenever layer changes
  useEffect(() => {
    const savedData = localStorage.getItem("textLayers");
    let layers = [];
    try {
      layers = savedData ? JSON.parse(savedData) : [];
    } catch {
      layers = [];
    }

    // Update or add the current layer
    const existingIndex = layers.findIndex((l: any) => l.id === layer.id);
    if (existingIndex >= 0) {
      layers[existingIndex] = layer;
    } else {
      layers.push(layer);
    }

    localStorage.setItem("textLayers", JSON.stringify(layers));
  }, [layer]);

  // Attach transformer only when not editing
  useEffect(() => {
    if (!isEditing && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [layer.id, isEditing]);

  // Close textarea when clicking outside of it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isEditing &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        finishEditing();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  // Remove transformer selection when clicking outside the shape
  useEffect(() => {
    const stage = textRef.current?.getStage();
    if (!stage) return;

    const handleStageClick = (e: any) => {
      if (e.target === stage) {
        trRef.current?.nodes([]);
        trRef.current?.getLayer()?.batchDraw();
      }
    };

    stage.on("mousedown", handleStageClick);

    return () => {
      stage.off("mousedown", handleStageClick);
    };
  }, []);

  const finishEditing = () => {
    const area = textareaRef.current;
    if (!area) return;

    dispatch({
      type: "UPDATE_TEXT",
      payload: { id: layer.id, patch: { text: area.value } },
    });

    if (document.body.contains(area)) {
      document.body.removeChild(area);
    }
    textareaRef.current = null;
    setIsEditing(false);
  };

  const handleDblClick = () => {
    if (!textRef.current) return;

    const stage = textRef.current.getStage();
    if (!stage) return;

    const stageBox = stage.container().getBoundingClientRect();
    const textPos = textRef.current.getAbsolutePosition();

    const area = document.createElement("textarea");
    textareaRef.current = area;

    Object.assign(area.style, {
      position: "absolute",
      top: `${stageBox.top + textPos.y}px`,
      left: `${stageBox.left + textPos.x}px`,
      width: `${layer.width}px`,
      fontSize: `${layer.fontSize}px`,
      fontFamily: layer.fontFamily,
      color: layer.color || "#000000",
      backgroundColor: "#ffffff",
      border: "1px dashed #ccc",
      padding: "2px",
      margin: "0",
      outline: "none",
      resize: "none",
      overflow: "hidden",
      lineHeight: "1.2",
      transformOrigin: "left top",
      textAlign: layer.align,
      zIndex: "1000",
      whiteSpace: "pre",
    });

    area.value = layer.text;
    document.body.appendChild(area);
    area.focus();
    setIsEditing(true);

    area.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        finishEditing();
      }
    });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: "UPDATE_TEXT",
      payload: { id: layer.id, patch: { color: e.target.value } },
    });
  };

  return (
    <>
      {isEditing && (
        <input
          type="color"
          value={layer.color || "#000000"}
          onChange={handleColorChange}
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 2000,
          }}
        />
      )}

      <Group
        x={layer.x}
        y={layer.y}
        rotation={layer.rotation}
        draggable={!layer.locked}
        onDragEnd={(e) => {
          dispatch({
            type: "UPDATE_TEXT",
            payload: {
              id: layer.id,
              patch: { x: e.target.x(), y: e.target.y() },
            },
          });
        }}
        onDblClick={handleDblClick}
      >
        {!isEditing && (
          <Text
            ref={textRef}
            text={layer.text}
            fontSize={layer.fontSize}
            fontFamily={layer.fontFamily}
            fill={layer.color}
            opacity={layer.opacity}
            width={layer.width}
            align={layer.align}
          />
        )}

        <Transformer
          ref={trRef}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          rotateEnabled
          onTransformEnd={() => {
            if (!textRef.current) return;

            const node = textRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            dispatch({
              type: "UPDATE_TEXT",
              payload: {
                id: layer.id,
                patch: {
                  x: node.x(),
                  y: node.y(),
                  rotation: node.rotation(),
                  width: Math.max(20, node.width() * scaleX),
                  fontSize: Math.max(8, layer.fontSize * scaleY),
                },
              },
            });

            node.scaleX(1);
            node.scaleY(1);
          }}
        />
      </Group>
    </>
  );
};

export default TextNode;
