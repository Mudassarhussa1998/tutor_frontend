'use client';

import { MoreHorizontal, Phone, Mail, Calendar } from 'lucide-react';

const deals = {
  'Contacted': [
    {
      id: 1,
      company: 'TechCorp Inc.',
      value: '$45,000',
      contact: 'Sarah Johnson',
      lastActivity: '2 hours ago',
      priority: 'high'
    },
    {
      id: 2,
      company: 'DataFlow Solutions',
      value: '$28,000',
      contact: 'Mike Chen',
      lastActivity: '1 day ago',
      priority: 'medium'
    }
  ],
  'Negotiation': [
    {
      id: 3,
      company: 'CloudSync Ltd.',
      value: '$67,000',
      contact: 'Emma Davis',
      lastActivity: '3 hours ago',
      priority: 'high'
    },
    {
      id: 4,
      company: 'InnovateLabs',
      value: '$52,000',
      contact: 'Alex Rodriguez',
      lastActivity: '5 hours ago',
      priority: 'medium'
    }
  ],
  'Closed': [
    {
      id: 5,
      company: 'GlobalTech',
      value: '$89,000',
      contact: 'Lisa Wang',
      lastActivity: '2 days ago',
      priority: 'high'
    }
  ]
};

function DealCard({ deal }: { deal: any }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-accent text-sm">{deal.company}</h4>
          <p className="text-lg font-semibold text-success mt-1">{deal.value}</p>
        </div>
        <button className="text-muted hover:text-accent">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-xs text-muted">
          <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
          {deal.contact}
        </div>
        <div className="flex items-center text-xs text-muted">
          <Calendar className="w-3 h-3 mr-2" />
          {deal.lastActivity}
        </div>
      </div>

      <div className="flex space-x-2 mt-4">
        <button className="flex-1 bg-[#F7F7F2] text-accent px-3 py-2 rounded-lg text-xs font-medium hover:bg-accent hover:text-white transition-colors flex items-center justify-center">
          <Phone className="w-3 h-3 mr-1" />
          Call
        </button>
        <button className="flex-1 bg-[#F7F7F2] text-accent px-3 py-2 rounded-lg text-xs font-medium hover:bg-accent hover:text-white transition-colors flex items-center justify-center">
          <Mail className="w-3 h-3 mr-1" />
          Email
        </button>
      </div>
    </div>
  );
}

export function KanbanBoard() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-accent mb-6">Deals Pipeline</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(deals).map(([column, columnDeals]) => (
          <div key={column} className="min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-accent">{column}</h4>
              <span className="bg-accent text-white text-xs px-2 py-1 rounded-full">
                {columnDeals.length}
              </span>
            </div>

            <div className="space-y-4">
              {columnDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}