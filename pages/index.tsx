import React, { useEffect, useState } from "react";
import { useEditorState } from "../src/hooks/useEditorState";
import CanvasStage from "../src/components/Editor/CanvasStage";

const Home: React.FC = () => {
  const { history, dispatch, addText, undo, redo, reset, setTextLayer } =
    useEditorState();
  const [resetLocal, setResetLocal] = useState(false);

  // Simple autosave
  useEffect(() => {
    if (localStorage.getItem("itc_state")) return;
    localStorage.setItem("itc_state", JSON.stringify(history.present));
  }, [history.present]);

  useEffect(() => {
    const textLayer = JSON.parse(localStorage.getItem("textLayers"));
    if (textLayer) {
      console.log(textLayer, "textLayer3");
      setTextLayer(textLayer); // ✅ update history.present.textLayer
    }
  }, [setTextLayer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="max-w-10xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
          <h1 className="text-2xl font-bold text-white">
            🎨 Image Text Composer
          </h1>
          <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
            <button
              onClick={() => addText()}
              className="px-4 py-2 bg-white text-indigo-600 font-medium rounded-lg shadow hover:bg-indigo-50 transition"
            >
              ➕ Add Text
            </button>
            <button
              onClick={() => undo()}
              className="px-4 py-2 bg-white text-gray-700 font-medium rounded-lg shadow hover:bg-gray-50 transition"
            >
              ↩ Undo
            </button>
            <button
              onClick={() => redo()}
              className="px-4 py-2 bg-white text-gray-700 font-medium rounded-lg shadow hover:bg-gray-50 transition"
            >
              ↪ Redo
            </button>
            <button
              onClick={() => {
                reset();

                setResetLocal(true);
              }}
              className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg shadow hover:bg-red-600 transition"
            >
              🔄 Reset
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-col lg:flex-row gap-6 p-6">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-64 p-4 bg-gray-50 rounded-xl shadow-inner border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PNG Image
            </label>
            <input
              type="file"
              accept="image/png"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const dataUrl = reader.result as string;
                  const img = new Image();
                  img.onload = () => {
                    dispatch({
                      type: "SET_BACKGROUND",
                      payload: {
                        src: dataUrl,
                        width: img.width,
                        height: img.height,
                      },
                    });
                  };
                  img.src = dataUrl;
                };
                reader.readAsDataURL(f);
              }}
              className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-3 text-xs text-gray-500">
              PNG only. Canvas will match image aspect ratio.
            </p>
          </aside>

          {/* Canvas */}
          <section className="flex-1 bg-gray-100 rounded-xl shadow-inner flex items-center justify-center p-4 border border-gray-200">
            <CanvasStage
              editorState={history.present}
              dispatch={dispatch}
              resetLocalStorage={resetLocal}
            />
          </section>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-64 p-4 bg-gray-50 rounded-xl shadow-inner border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Layers</h2>
            <div className="space-y-2">
              {history.present.textLayers.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <span className="text-sm text-gray-800 truncate max-w-[120px]">
                    {t.text.slice(0, 20) || "Text"}
                  </span>
                  <button
                    onClick={() =>
                      dispatch({
                        type: "DELETE_TEXT",
                        payload: { id: t.id },
                      })
                    }
                    className="px-2 py-1 text-red-500 hover:text-red-700 text-xs font-semibold"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default Home;
