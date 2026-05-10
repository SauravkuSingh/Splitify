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
import { Card } from "@/components/ui/card";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

const COLORS = ['#E8500A', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

const DashboardCharts = ({ stats }) => {
  const hasData = stats && stats.expenseCount > 0;

  // Actual data from backend or empty state defaults
  const spendingByGroup = hasData 
    ? stats.spendingByGroup.slice(0, 5).map(g => ({ name: g.name.substring(0, 8), amount: g.amount }))
    : [
        { name: 'Group A', amount: 0 },
        { name: 'Group B', amount: 0 },
        { name: 'Group C', amount: 0 },
        { name: 'Group D', amount: 0 },
        { name: 'Group E', amount: 0 },
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Spending by Group */}
      <Card className="bg-white p-8 rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Group Volume</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mt-1">
                {hasData ? 'Spending per group' : 'No activity detected'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="h-[280px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendingByGroup} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: '800', padding: '12px 16px' }}
                itemStyle={{ color: '#E8500A' }}
              />
              <Bar 
                dataKey="amount" 
                fill="#E8500A" 
                radius={[8, 8, 8, 8]} 
                barSize={32}
                opacity={hasData ? 1 : 0.05}
                className="transition-all duration-500"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category Distribution */}
      <Card className="bg-white p-8 rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Category Distribution</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mt-1">
                {hasData ? 'Where your money goes' : 'Awaiting data'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-10 relative z-10">
          <div className="h-[220px] w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                  opacity={hasData ? 1 : 0.05}
                >
                  {spendingByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: '800', padding: '12px 16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 space-y-5 w-full">
            {spendingByCategory.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between group/item">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: hasData ? COLORS[i % COLORS.length] : '#f1f5f9' }}></div>
                  <span className="text-xs font-black text-muted-foreground group-hover/item:text-foreground transition-colors uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-xs font-black text-foreground tabular-nums">
                  {hasData ? `₹${item.value.toLocaleString()}` : '0%'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardCharts;
