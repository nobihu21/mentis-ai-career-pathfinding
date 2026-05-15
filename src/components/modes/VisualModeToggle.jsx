import { useVisualMode } from "../../contexts/VisualModeContext";

const modes = [
  { id: "classic", label: "Classic" },
  { id: "dimensional", label: "3D Lite" },
  { id: "immersive", label: "3D Premium" }
];

export default function VisualModeToggle() {
  const { mode, setMode } = useVisualMode();

  return (
    <div className="flex flex-wrap gap-2">
      {modes.map((item) => (
        <button
          key={item.id}
          onClick={() => setMode(item.id)}
          className={`rounded-lg px-3 py-1 text-xs transition ${
            mode === item.id ? "bg-mentisPrimary text-white" : "border border-slate-700 bg-mentisBg/80 text-mentisTextSecondary hover:text-mentisText"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
