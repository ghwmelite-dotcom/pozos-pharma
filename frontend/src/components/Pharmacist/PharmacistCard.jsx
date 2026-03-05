import Badge from "../UI/Badge";
import Button from "../UI/Button";

/**
 * PozosPharma Pharmacist Card
 *
 * Displays a pharmacist profile with avatar, name, specialization,
 * country flag, star rating, badge level, online status, session count,
 * and bio excerpt.
 *
 * @param {object} props
 * @param {object} props.pharmacist
 * @param {string} props.pharmacist.id
 * @param {string} props.pharmacist.full_name
 * @param {string} [props.pharmacist.avatar_url]
 * @param {string} props.pharmacist.specialization
 * @param {string} props.pharmacist.country
 * @param {string} [props.pharmacist.country_flag]
 * @param {number} props.pharmacist.rating
 * @param {string} props.pharmacist.badge_level - "gold" | "silver" | "bronze" | "new"
 * @param {boolean} props.pharmacist.is_online
 * @param {number} props.pharmacist.total_sessions
 * @param {string} [props.pharmacist.bio]
 * @param {(id: string) => void} [props.onConnect]
 */
export default function PharmacistCard({ pharmacist, onConnect }) {
  const {
    id,
    full_name,
    avatar_url,
    specialization,
    country,
    country_flag,
    rating = 0,
    badge_level = "new",
    is_online = false,
    total_sessions = 0,
    bio,
  } = pharmacist;

  const badgeColors = {
    gold: "bg-ghana-gold/20 text-yellow-700 dark:text-yellow-300 ring-1 ring-yellow-400 dark:ring-yellow-600",
    silver: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 ring-1 ring-gray-400 dark:ring-gray-600",
    bronze: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 ring-1 ring-orange-400 dark:ring-orange-600",
    new: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-400 dark:ring-indigo-600",
  };

  const badgeLabel = {
    gold: "Gold",
    silver: "Silver",
    bronze: "Bronze",
    new: "New",
  };

  // Star rating renderer
  const renderStars = (score) => {
    const full = Math.floor(score);
    const half = score - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    const stars = [];

    for (let i = 0; i < full; i++) {
      stars.push(
        <svg key={`f${i}`} className="w-4 h-4 text-ghana-gold" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    if (half) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-ghana-gold" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <defs>
            <linearGradient id={`half-star-${id}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill={`url(#half-star-${id})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    for (let i = 0; i < empty; i++) {
      stars.push(
        <svg key={`e${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return stars;
  };

  return (
    <div className="relative bg-white dark:bg-surface-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-5">
      {/* Online status dot */}
      <div className="absolute top-4 right-4">
        {is_online ? (
          <Badge type="online" label="Online" />
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-gray-400" aria-hidden="true" />
            Offline
          </span>
        )}
      </div>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          {avatar_url ? (
            <img
              src={avatar_url}
              alt={full_name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-brand-indigo/15 dark:bg-indigo-900/40 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700">
              <span className="text-lg font-bold text-brand-indigo dark:text-indigo-300">
                {full_name?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
          )}
          {/* Badge level indicator */}
          <span
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${badgeColors[badge_level] || badgeColors.new}`}
            title={`${badgeLabel[badge_level] || "New"} badge`}
          >
            {badge_level === "gold" ? "G" : badge_level === "silver" ? "S" : badge_level === "bronze" ? "B" : "N"}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
            {full_name}
          </h3>
          <p className="text-sm text-brand-teal dark:text-teal-400 font-medium">
            {specialization}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {country_flag || ""} {country}
          </p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mt-3">
        <div className="flex items-center" aria-label={`Rating: ${rating} out of 5`}>
          {renderStars(rating)}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({rating.toFixed(1)})
        </span>
      </div>

      {/* Bio */}
      {bio && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {bio}
        </p>
      )}

      {/* Stats + Connect */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
          <span>{total_sessions} sessions</span>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onConnect?.(id)}
          disabled={!is_online}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          </svg>
          Connect
        </Button>
      </div>
    </div>
  );
}
