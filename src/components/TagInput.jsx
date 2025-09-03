
import { useRef, useState } from "react";
import CatButton from "./CatButton";

export default function TagInput({ value = [], onChange, placeholder = "Add a title (Enter)..." }) {
  const [input, setInput] = useState("");
  const ref = useRef(null);

  function add() {
    const t = input.trim();
    if (!t) return;
    const next = Array.from(new Set([...(value || []), t]));
    onChange?.(next);
    setInput("");
    ref.current?.focus();
  }

  function remove(tag) {
    const next = (value || []).filter((x) => x !== tag);
    onChange?.(next);
  }

  function onKeyDown(e) {
    if (e.key === "Enter") { e.preventDefault(); add(); }
    if (e.key === "Backspace" && !input && value?.length) remove(value[value.length - 1]);
  }

  return (
    <div className="taginput">
      <div className="taginput__row">
        <input
          ref={ref}
          className="taginput__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
        />
        <CatButton variant="add" label="Add" onClick={add} size={90} showLabel />
      </div>

      {!!value?.length && (
        <ul className="taginput__list">
          {value.map((t) => (
            <li key={t} className="tag">
              <span>{t}</span>
              <CatButton variant="delete" size={40} label="Remove" onClick={() => remove(t)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}