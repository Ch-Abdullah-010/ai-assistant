export default function GlassPanel({ children, className = '', ...props }) {
  return (
    <div
      className={`glass-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
