"use client";

// Violet pill toggle — matches the switch used on the Campaigns table.
export function ToggleViolet({ active, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5.5 w-11 items-center rounded-full transition-colors duration-200 ${
        active ? "bg-violet-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          active ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// Green checkbox-style toggle — matches the "Activity control" switch on Settings.
export function ToggleGreen({ checked, onChange }) {
  return (
    <label className="relative inline-block w-11 h-6 cursor-pointer">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      <div
        className={`absolute inset-0 rounded-full transition-colors ${
          checked ? "bg-green-500" : "bg-gray-300"
        }`}
      />
      <div
        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </label>
  );
}
