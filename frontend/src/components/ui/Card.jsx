export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`glass-card p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}
