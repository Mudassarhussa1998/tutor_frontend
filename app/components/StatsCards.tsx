import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

const stats = [
  {
    title: 'Total Revenue',
    value: '$124,500',
    change: '+12.5%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    title: 'Active Deals',
    value: '47',
    change: '+8.2%',
    changeType: 'positive',
    icon: Target,
  },
  {
    title: 'New Customers',
    value: '23',
    change: '+4.1%',
    changeType: 'positive',
    icon: Users,
  },
  {
    title: 'Conversion Rate',
    value: '68%',
    change: '-2.1%',
    changeType: 'negative',
    icon: TrendingUp,
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-card border border-border rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted font-medium">{stat.title}</p>
              <p className="text-2xl font-semibold text-accent mt-1">{stat.value}</p>
              <p className={`text-sm mt-2 ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change} from last month
              </p>
            </div>
            <div className="p-3 bg-[#F7F7F2] rounded-lg">
              <stat.icon className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}