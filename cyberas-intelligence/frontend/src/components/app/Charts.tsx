import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const colors = ['#DC2626', '#FFB020', '#FFA500', '#10b981', '#00E5A0']

export function LineChartComponent({ data, title }: { data: any[]; title: string }) {
  return (
    <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
          <XAxis stroke="#8B98A5" />
          <YAxis stroke="#8B98A5" />
          <Tooltip contentStyle={{ backgroundColor: '#111826', border: '1px solid #1E293B', borderRadius: '8px', color: '#E6EDF3' }} />
          <Legend wrapperStyle={{ color: '#8B98A5' }} />
          <Line type="monotone" dataKey="value" stroke="#DC2626" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BarChartComponent({ data, title }: { data: any[]; title: string }) {
  return (
    <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
          <XAxis stroke="#8B98A5" />
          <YAxis stroke="#8B98A5" />
          <Tooltip contentStyle={{ backgroundColor: '#111826', border: '1px solid #1E293B', borderRadius: '8px', color: '#E6EDF3' }} />
          <Legend wrapperStyle={{ color: '#8B98A5' }} />
          <Bar dataKey="value" fill="#DC2626" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PieChartComponent({ data, title }: { data: any[]; title: string }) {
  return (
    <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#111826', border: '1px solid #1E293B', borderRadius: '8px', color: '#E6EDF3' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function KpiCardWithTrend({ value, label, trend, unit = '' }: { value: string | number; label: string; trend: number; unit?: string }) {
  const isPositive = trend >= 0
  return (
    <div className="bg-surface-dark border border-border-dark rounded-lg p-6 space-y-2">
      <p className="text-text-on-dark-muted text-sm">{label}</p>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-extrabold text-white">
          {value}{unit && <span className="text-sm text-text-on-dark-muted ml-1">{unit}</span>}
        </div>
        <div className={`text-sm font-semibold flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      </div>
    </div>
  )
}
