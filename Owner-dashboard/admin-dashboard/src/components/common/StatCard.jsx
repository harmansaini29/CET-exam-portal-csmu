export default function StatCard({ label, value, sub, color = 'blue', icon }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-card-label">{icon} {label}</div>
      <div className="stat-card-value">{value}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  )
}