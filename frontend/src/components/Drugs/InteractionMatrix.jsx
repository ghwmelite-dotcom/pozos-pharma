import { useState } from "react";

const SEVERITY_COLORS = {
  none: {
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-300 dark:border-green-700",
    text: "text-green-800 dark:text-green-300",
    cell: "bg-green-200 dark:bg-green-900/50 hover:bg-green-300 dark:hover:bg-green-800",
    label: "No Interaction",
  },
  moderate: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    border: "border-amber-300 dark:border-amber-700",
    text: "text-amber-800 dark:text-amber-300",
    cell: "bg-amber-200 dark:bg-amber-900/50 hover:bg-amber-300 dark:hover:bg-amber-800",
    label: "Moderate",
  },
  severe: {
    bg: "bg-red-100 dark:bg-red-900/30",
    border: "border-red-300 dark:border-red-700",
    text: "text-red-800 dark:text-red-300",
    cell: "bg-red-200 dark:bg-red-900/50 hover:bg-red-300 dark:hover:bg-red-800",
    label: "Severe",
  },
};

/**
 * InteractionMatrix - Visual grid showing drug pair interactions
 *
 * @param {Object} props
 * @param {Array} props.drugs - Array of drug objects with id and generic_name
 * @param {Array} props.interactions - Array of { drugA, drugB, severity, description }
 */
export default function InteractionMatrix({ drugs, interactions }) {
  const [selected, setSelected] = useState(null);

  if (!drugs || drugs.length < 2 || !interactions) return null;

  // Build a lookup map: "idA-idB" -> interaction
  const interactionMap = {};
  for (const inter of interactions) {
    const keyAB = `${inter.drugA.id}-${inter.drugB.id}`;
    const keyBA = `${inter.drugB.id}-${inter.drugA.id}`;
    interactionMap[keyAB] = inter;
    interactionMap[keyBA] = inter;
  }

  const getInteraction = (drugIdA, drugIdB) => {
    return interactionMap[`${drugIdA}-${drugIdB}`] || null;
  };

  const handleCellClick = (interaction) => {
    if (!interaction) return;
    setSelected(
      selected &&
        selected.drugA.id === interaction.drugA.id &&
        selected.drugB.id === interaction.drugB.id
        ? null
        : interaction
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
        Interaction Matrix
      </h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(SEVERITY_COLORS).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${val.cell}`} />
            <span className="text-gray-600 dark:text-gray-400">{val.label}</span>
          </div>
        ))}
      </div>

      {/* Matrix Grid */}
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="p-2" />
              {drugs.map((drug) => (
                <th
                  key={drug.id}
                  className="p-2 text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate"
                  title={drug.generic_name}
                >
                  {drug.generic_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drugs.map((rowDrug, rowIdx) => (
              <tr key={rowDrug.id}>
                <td
                  className="p-2 text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate"
                  title={rowDrug.generic_name}
                >
                  {rowDrug.generic_name}
                </td>
                {drugs.map((colDrug, colIdx) => {
                  if (rowIdx === colIdx) {
                    return (
                      <td
                        key={colDrug.id}
                        className="w-10 h-10 bg-gray-100 dark:bg-gray-800"
                      />
                    );
                  }
                  // Only show lower triangle as clickable (upper mirrors)
                  if (colIdx > rowIdx) {
                    return (
                      <td
                        key={colDrug.id}
                        className="w-10 h-10 bg-warm-100 dark:bg-gray-900/30"
                      />
                    );
                  }
                  const inter = getInteraction(rowDrug.id, colDrug.id);
                  const severity = inter?.severity || "none";
                  const colors = SEVERITY_COLORS[severity];
                  const isSelected =
                    selected &&
                    ((selected.drugA.id === rowDrug.id && selected.drugB.id === colDrug.id) ||
                      (selected.drugA.id === colDrug.id && selected.drugB.id === rowDrug.id));

                  return (
                    <td
                      key={colDrug.id}
                      className={`w-10 h-10 cursor-pointer transition-all rounded-sm ${colors.cell} ${
                        isSelected ? "ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-900" : ""
                      }`}
                      onClick={() => handleCellClick(inter)}
                      title={`${rowDrug.generic_name} + ${colDrug.generic_name}: ${colors.label}`}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selected && (
        <div
          className={`rounded-xl border p-4 ${
            SEVERITY_COLORS[selected.severity].bg
          } ${SEVERITY_COLORS[selected.severity].border}`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4
              className={`text-sm font-semibold ${
                SEVERITY_COLORS[selected.severity].text
              }`}
            >
              {selected.drugA.generic_name} + {selected.drugB.generic_name}
            </h4>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                SEVERITY_COLORS[selected.severity].bg
              } ${SEVERITY_COLORS[selected.severity].text}`}
            >
              {SEVERITY_COLORS[selected.severity].label}
            </span>
          </div>
          <p
            className={`text-sm ${
              SEVERITY_COLORS[selected.severity].text
            } leading-relaxed`}
          >
            {selected.description || "No known interaction detected in our database."}
          </p>
          <button
            onClick={() => setSelected(null)}
            className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
