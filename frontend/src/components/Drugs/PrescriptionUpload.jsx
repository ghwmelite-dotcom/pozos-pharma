import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import useChatStore from "../../store/chatStore";

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * PozosPharma Prescription Upload Component
 *
 * Upload interface for prescription images. Uses AI vision model to extract
 * medication names, dosages, and instructions. Cross-references with drug DB.
 */
export default function PrescriptionUpload() {
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

  const handleReadPrescription = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    if (!token) {
      setError("Please log in to use the prescription reader.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_URL}/api/vision/read-prescription`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to read prescription.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to read prescription. Please try again.");
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
                alt="Prescription to read"
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
                <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload a prescription image
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Drag and drop, or tap to select. Max 10MB.
            </p>
          </div>
        )}
      </div>

      {/* Read Button */}
      {preview && (
        <button
          type="button"
          onClick={handleReadPrescription}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-indigo hover:bg-indigo-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Reading Prescription...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
                  clipRule="evenodd"
                />
              </svg>
              Read Prescription
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
          {/* Extracted Text */}
          <div className="rounded-xl bg-warm-50 dark:bg-surface-card-dark border border-warm-200/60 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Extracted Medications
            </h3>
            <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {result.extracted}
            </div>
          </div>

          {/* Matched Drugs from DB */}
          {result.matchedDrugs && result.matchedDrugs.length > 0 && (
            <div className="rounded-xl bg-warm-50 dark:bg-surface-card-dark border border-warm-200/60 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                Found in Drug Database
              </h3>
              <div className="space-y-2">
                {result.matchedDrugs.map((drug) => (
                  <div
                    key={drug.id}
                    className="rounded-lg border border-warm-200 dark:border-gray-700/50 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/drugs?id=${drug.id}`}
                          className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-brand-indigo dark:hover:text-indigo-400 transition-colors"
                        >
                          {drug.generic_name}
                        </Link>
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
                      <Link
                        to="/my-medications"
                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                        Add
                      </Link>
                    </div>
                  </div>
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
              AI-based prescription reading may contain errors. Always verify extracted information with your pharmacist or healthcare provider.
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
            to use the prescription reader.
          </p>
        </div>
      )}
    </div>
  );
}
