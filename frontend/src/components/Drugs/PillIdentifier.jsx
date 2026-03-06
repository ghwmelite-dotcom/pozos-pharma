import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import useChatStore from "../../store/chatStore";

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * PozosPharma Pill Identifier Component
 *
 * Camera/upload interface for pill identification via AI vision model.
 * Supports drag-and-drop, file input with mobile camera capture,
 * image preview, and displays AI identification results with matched drugs from DB.
 */
export default function PillIdentifier() {
  const token = useChatStore((s) => s.token);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const inputRef = useRef(null);

  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Image too large. Maximum size is 10MB.");
      return;
    }

    setFile(selectedFile);
    setError("");
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const droppedFile = e.dataTransfer?.files?.[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleIdentify = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    if (!token) {
      setError("Please log in to use the pill identifier.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_URL}/api/vision/identify-pill`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to identify pill.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to identify pill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-5">
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !preview && inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          dragActive
            ? "border-brand-indigo bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500"
            : preview
              ? "border-gray-300 dark:border-gray-600"
              : "border-gray-300 dark:border-gray-600 hover:border-brand-indigo dark:hover:border-indigo-500 hover:bg-warm-200/40 dark:hover:bg-gray-800/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />

        {preview ? (
          <div className="p-4">
            <div className="relative mx-auto max-w-sm">
              <img
                src={preview}
                alt="Pill to identify"
                className="w-full rounded-lg object-contain max-h-64"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-900/60 text-white flex items-center justify-center hover:bg-gray-900/80 transition-colors"
                aria-label="Remove image"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-brand-indigo dark:text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Take a photo or upload a pill image
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Drag and drop, or tap to select. Max 10MB.
            </p>
          </div>
        )}
      </div>

      {/* Identify Button */}
      {preview && (
        <button
          type="button"
          onClick={handleIdentify}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-indigo hover:bg-indigo-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                <path
                  fillRule="evenodd"
                  d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
              Identify Pill
            </>
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* AI Identification */}
          <div className="rounded-xl bg-warm-50 dark:bg-surface-card-dark border border-warm-200/60 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              AI Identification
            </h3>
            <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {result.identification}
            </div>
          </div>

          {/* Matched Drugs from DB */}
          {result.matchedDrugs && result.matchedDrugs.length > 0 && (
            <div className="rounded-xl bg-warm-50 dark:bg-surface-card-dark border border-warm-200/60 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                Matching Drugs in Database
              </h3>
              <div className="space-y-2">
                {result.matchedDrugs.map((drug) => (
                  <Link
                    key={drug.id}
                    to={`/drugs?id=${drug.id}`}
                    className="block rounded-lg border border-warm-200 dark:border-gray-700/50 p-3 hover:bg-warm-200/40 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {drug.generic_name}
                        </p>
                        {drug.brand_names && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {drug.brand_names}
                          </p>
                        )}
                        {drug.drug_class && (
                          <p className="text-xs text-brand-teal dark:text-teal-400 font-medium mt-0.5">
                            {drug.drug_class}
                          </p>
                        )}
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-400 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
            <svg
              className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              AI-based identification is not a substitute for professional advice. Always consult a pharmacist or healthcare provider to confirm pill identity.
            </p>
          </div>
        </div>
      )}

      {/* Auth reminder for logged-out users */}
      {!token && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please{" "}
            <Link to="/login" className="text-brand-indigo dark:text-indigo-400 font-medium hover:underline">
              log in
            </Link>{" "}
            to use the pill identifier.
          </p>
        </div>
      )}
    </div>
  );
}
