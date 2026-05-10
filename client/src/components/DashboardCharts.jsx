import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const COLORS = ['#E8500A', '#F97316', '#FB923C', '#FDBA74', '#FFEDD5'];

const DashboardCharts = ({ stats }) => {
  const hasData = stats && stats.expenseCount > 0;

  // Actual data from backend or empty state defaults
  const spendingByGroup = hasData 
    ? stats.spendingByGroup.slice(0, 5).map(g => ({ name: g.name.substring(0, 10), amount: g.amount }))
    : [
        { name: 'Empty', amount: 0 },
        { name: 'Empty', amount: 0 },
        { name: 'Empty', amount: 0 },
        { name: 'Empty', amount: 0 },
        { name: 'Empty', amount: 0 },
      ];

  const spendingByCategory = hasData 
    ? stats.spendingByCategory 
    : [
        { name: 'Food', value: 1 },
        { name: 'Travel', value: 1 },
        { name: 'Stay', value: 1 },
        { name: 'Other', value: 1 },
      ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Spending by Group */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-foreground">Spending by Group</h3>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1">
              {hasData ? 'Total group volume' : 'No activity yet'}
            </p>
          </div>
          {!hasData && (
             <span className="text-[10px] font-bold bg-gray-100 text-gray-400 px-2 py-1 rounded-full uppercase tracking-tighter">
                Empty State
             </span>
          )}
        </div>
        
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendingByGroup} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Bar 
                dataKey="amount" 
                fill="#E8500A" 
                radius={[6, 6, 0, 0]} 
                barSize={32}
                opacity={hasData ? 1 : 0.1}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-foreground">Category Breakdown</h3>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1">
              {hasData ? 'Where your money goes' : 'No current data'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="h-[200px] w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  opacity={hasData ? 1 : 0.1}
                >
                  {spendingByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            {spendingByCategory.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hasData ? COLORS[i % COLORS.length] : '#f1f5f9' }}></div>
                  <span className="text-xs font-bold text-gray-600">{item.name}</span>
                </div>
                <span className="text-xs font-black text-foreground">
                  {hasData ? `₹${item.value.toLocaleString()}` : '0%'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
