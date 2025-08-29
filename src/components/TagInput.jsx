import { useState } from "react";

export default function TagInput({ value = [], onChange, placeholder = "Ajouter un titre (Enter)" }) {
  const [input, setInput] = useState("");

  function addTag() {
    const t = input.trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setInput("");
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  }

  function remove(tag) {
    onChange(value.filter((x) => x !== tag));
  }

  return (
    <div className="taginput">
      <ul className="taginput__list">
        {value.map((t) => (
          <li key={t} className="tag">
            {t}
            <button type="button" onClick={() => remove(t)} aria-label={`Supprimer ${t}`}>×</button>
          </li>
        ))}
      </ul>

      <div className="taginput__form">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
        />
        <button type="button" onClick={addTag}>Ajouter</button>
      </div>
    </div>
  );
}