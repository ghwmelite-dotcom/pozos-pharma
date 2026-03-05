import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import Button from "../components/UI/Button";
import PharmacistDashboard from "../components/Pharmacist/PharmacistDashboard";

const API_URL = import.meta.env.VITE_API_URL || "";

const SPECIALIZATIONS = [
  "Community Pharmacy",
  "Hospital Pharmacy",
  "Clinical Pharmacy",
  "Industrial Pharmacy",
  "Pharmacology",
  "Pharmaceutical Chemistry",
  "Pharmacognosy",
  "Pharmacy Practice",
  "Drug Information",
  "Public Health Pharmacy",
  "Other",
];

/**
 * PozosPharma Pharmacist Portal Page
 *
 * Two modes:
 * 1. Registration form (if not yet a pharmacist)
 * 2. PharmacistDashboard (if verified pharmacist)
 *
 * Shows "Pending verification" status after registration with Adinkra patience symbol.
 */
export default function PharmacistPortal() {
  const { user, token, isPharmacist, isAuthenticated } = useAuth();

  const [pharmacistStatus, setPharmacistStatus] = useState(null); // null | "none" | "pending" | "verified" | "rejected"
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [country, setCountry] = useState("Ghana");
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [licenseFile, setLicenseFile] = useState(null);

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Check pharmacist status on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    if (isPharmacist) {
      setPharmacistStatus("verified");
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/api/pharmacist/status`, { headers });
        if (res.ok) {
          const data = await res.json();
          setPharmacistStatus(data.status || "none");
        } else {
          setPharmacistStatus("none");
        }
      } catch {
        setPharmacistStatus("none");
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [isAuthenticated, isPharmacist, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim() || !licenseNumber.trim() || !specialization) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate Ghana license number format: PCG/XXXXX or similar
    if (country === "Ghana" && !/^PCG\/\d{4,6}$/i.test(licenseNumber.trim())) {
      setError("License number should be in Pharmacy Council of Ghana format (e.g., PCG/12345).");
      return;
    }

    setSubmitLoading(true);

    try {
      const formData = new FormData();
      formData.append("full_name", fullName.trim());
      formData.append("license_number", licenseNumber.trim());
      formData.append("country", country);
      formData.append("specialization", specialization);
      formData.append("bio", bio.trim());
      if (licenseFile) {
        formData.append("license_document", licenseFile);
      }

      const res = await fetch(`${API_URL}/api/pharmacist/register`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Registration failed" }));
        throw new Error(err.detail || "Registration failed");
      }

      setPharmacistStatus("pending");
      setSuccess("Registration submitted successfully! Your application is under review.");
    } catch (err) {
      setError(err.message || "Failed to submit registration. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-brand-indigo/10 dark:bg-indigo-900/20 flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-brand-indigo dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Sign in to access the Pharmacist Portal
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            You need to be logged in to register or access the pharmacist dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading portal...</p>
        </div>
      </div>
    );
  }

  // Verified pharmacist - show dashboard
  if (pharmacistStatus === "verified") {
    return <PharmacistDashboard />;
  }

  // Pending verification
  if (pharmacistStatus === "pending") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md text-center bg-white dark:bg-surface-card-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          {/* Adinkra patience symbol - Boa Me Na Me Mmoa Wo */}
          <div className="mx-auto w-16 h-16 rounded-full bg-ghana-gold/15 dark:bg-yellow-900/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-ghana-gold" viewBox="0 0 40 40" fill="currentColor" aria-hidden="true">
              <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M20 6v6M20 28v6M6 20h6M28 20h6M11 11l4 4M25 25l4 4M11 29l4-4M25 15l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Verification Pending
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Your pharmacist registration is being reviewed by our verification team.
            This typically takes 1-3 business days. You will be notified once your
            credentials have been verified.
          </p>

          {/* Ghana flag accent */}
          <div className="h-1 w-24 mx-auto mt-5 rounded-full overflow-hidden flex">
            <div className="flex-1 bg-ghana-red" />
            <div className="flex-1 bg-ghana-gold" />
            <div className="flex-1 bg-ghana-green" />
          </div>

          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 italic">
            &ldquo;Boa Me Na Me Mmoa Wo&rdquo; &mdash; Help me and let me help you
          </p>

          {success && (
            <div className="mt-4 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300">
              {success}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Registration form
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-surface-card-dark rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-teal to-brand-emerald px-6 py-6 text-white kente-border-accent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Pharmacist Registration</h1>
              <p className="text-sm text-teal-100">
                Register as a verified pharmacist on PozosPharma
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error / Success */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300" role="alert">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor="pharm-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="pharm-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Kwame Asante"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            />
          </div>

          {/* License Number */}
          <div>
            <label htmlFor="pharm-license" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              License Number (Pharmacy Council of Ghana) <span className="text-red-500">*</span>
            </label>
            <input
              id="pharm-license"
              type="text"
              required
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="PCG/12345"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Format: PCG/XXXXX (Pharmacy Council of Ghana registration number)
            </p>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="pharm-country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country
            </label>
            <select
              id="pharm-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              <option value="Ghana">Ghana</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Kenya">Kenya</option>
              <option value="South Africa">South Africa</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Specialization */}
          <div>
            <label htmlFor="pharm-spec" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Specialization <span className="text-red-500">*</span>
            </label>
            <select
              id="pharm-spec"
              required
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              <option value="">Select specialization</option>
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="pharm-bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Professional Bio
            </label>
            <textarea
              id="pharm-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your experience and areas of expertise..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent resize-none"
            />
          </div>

          {/* License Document Upload */}
          <div>
            <label htmlFor="pharm-doc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              License Document
            </label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="pharm-doc"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-teal bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Upload
              </label>
              <input
                id="pharm-doc"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              {licenseFile && (
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                  {licenseFile.name}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              PDF, JPG, or PNG. Max 5MB. Upload your Pharmacy Council registration certificate.
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            loading={submitLoading}
            className="w-full"
          >
            Submit Registration
          </Button>

          <p className="text-xs text-center text-gray-400 dark:text-gray-500">
            Your credentials will be verified by the PozosPharma admin team.
            Verification typically takes 1-3 business days.
          </p>
        </form>
      </div>
    </div>
  );
}
