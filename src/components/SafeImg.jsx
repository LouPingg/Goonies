export default function SafeImg({ src, alt = "", ...rest }) {
  const hasSrc = typeof src === "string" && src.trim().length > 0;
  if (!hasSrc) return null; // ne rend rien si pas de source valide
  return <img src={src} alt={alt} {...rest} />;
}