import { useNavigate } from "react-router-dom";
import useChatStore from "../../store/chatStore";

/**
 * PozosPharma Topic Rooms Grid
 *
 * Grid of room cards showing icon, name, description, active user count,
 * and total messages. Click navigates to /chat/{slug}.
 * Kente-pattern decorative borders on hover.
 */
export default function TopicRooms() {
  const rooms = useChatStore((s) => s.rooms);
  const navigate = useNavigate();

  // Fallback rooms if store is empty (for initial load)
  const displayRooms = rooms.length > 0 ? rooms : [];

  if (displayRooms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-brand-indigo dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Loading topic rooms...
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Choose a Topic Room
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Join a conversation or start a new one with PozosBot AI
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayRooms.map((room) => (
          <button
            key={room.slug || room.id}
            type="button"
            onClick={() => navigate(`/chat/${room.slug}`)}
            className="group relative text-left bg-warm-50 dark:bg-surface-card-dark rounded-xl border border-warm-200/60 dark:border-gray-700 p-5 hover:shadow-lg hover:border-brand-indigo dark:hover:border-indigo-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:ring-offset-2 dark:focus:ring-offset-gray-950"
          >
            {/* Kente border accent on hover */}
            <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex h-full">
                <div className="flex-1 bg-ghana-red" />
                <div className="flex-1 bg-ghana-gold" />
                <div className="flex-1 bg-ghana-green" />
              </div>
            </div>

            <div className="flex items-start gap-3">
              {/* Icon */}
              <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true">
                {room.icon || "#"}
              </span>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-indigo dark:group-hover:text-indigo-400 transition-colors truncate">
                  {room.name || room.slug}
                </h3>
                {room.description && (
                  <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {room.description}
                  </p>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-warm-200 dark:border-gray-700/50">
              {/* Active users */}
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span>{room.active_count || 0} online</span>
              </div>

              {/* Total messages */}
              {room.total_messages != null && (
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-500">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  </svg>
                  <span>{room.total_messages.toLocaleString()} messages</span>
                </div>
              )}
            </div>

            {/* Category tag */}
            {room.category && (
              <span className="inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-brand-indigo dark:text-indigo-400">
                {room.category}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
