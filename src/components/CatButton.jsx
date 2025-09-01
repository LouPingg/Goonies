// src/components/CatButton.jsx
import React from "react";

/**
 * Bouton rond illustré par une icône PNG locale.
 * Place les images dans /public/assets/cats/ :
 * confirm.png, cancel.png, add.png, delete.png, edit.png, upload.png, save.png, back.png
 *
 * NOTE: plus d'inline style pour la taille.
 * - Si "size" est fourni, on ajoute une classe "catbtn--s-XX".
 * - Sinon, la taille par défaut vient du CSS: .catbtn { --s: 72px; }
 */
export default function CatButton({
  variant = "confirm",          // "confirm" | "cancel" | "add" | "delete" | "edit" | "upload" | "save" | "back"
  label,
  onClick,
  size = null,                  // ⬅️ par défaut null → pas d'inline style
  disabled = false,
  className = "",
  type = "button",
  showLabel = false,
}) {
  const base = import.meta.env.BASE_URL || "/";
  const FILES = {
    confirm: "confirm.png",
    cancel:  "cancel.png",
    add:     "add.png",
    delete:  "delete.png",
    edit:    "edit.png",
    upload:  "upload.png",
    save:    "save.png",
    back:    "back.png",
  };
  const src = `${base}assets/cats/${FILES[variant] || FILES.confirm}`;

  const title =
    label ||
    {
      confirm: "Valider",
      cancel:  "Annuler",
      add:     "Ajouter",
      delete:  "Supprimer",
      edit:    "Modifier",
      upload:  "Téléverser",
      save:    "Enregistrer",
      back:    "Retour",
    }[variant] ||
    "Action";

  // Mappe size -> classe CSS (ex: 84 => "catbtn--s-84")
  const sizeClass =
    Number.isFinite(size) ? `catbtn--s-${Math.round(size)}` : "";

  const Btn = (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`catbtn ${sizeClass} ${className}`.trim()}
      aria-label={title}
      title={title}
    >
      <img
        src={src}
        alt=""
        className="catbtn__img"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          // fallback texte si l'image est manquante
          e.currentTarget.style.display = "none";
          const span = document.createElement("span");
          span.className = "catbtn__fallback";
          span.textContent = title;
          e.currentTarget.parentElement?.appendChild(span);
        }}
      />
    </button>
  );

  if (!showLabel) return Btn;

  return (
    <div className="catbtn-box" role="group" aria-label={title}>
      {Btn}
      <span className="catbtn__label">{title}</span>
    </div>
  );
}