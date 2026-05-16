import React from 'react';
import { MoreHorizontal, MessageSquare, Phone } from 'lucide-react';

const mockCases = {
  new: [
    { id: 1, title: 'Network Issue', company: 'TechCorp', avatar: 'https://i.pravatar.cc/150?u=1', priority: 'High' },
    { id: 2, title: 'Login Failure', company: 'GlobalInc', avatar: 'https://i.pravatar.cc/150?u=2', priority: 'Medium' }
  ],
  inProgress: [
    { id: 3, title: 'Server Upgrade', company: 'DataSystems', avatar: 'https://i.pravatar.cc/150?u=3', priority: 'Low' },
    { id: 4, title: 'Database Sync', company: 'CloudNet', avatar: 'https://i.pravatar.cc/150?u=4', priority: 'High' }
  ],
  awaiting: [
    { id: 5, title: 'API Integration', company: 'WebSolutions', avatar: 'https://i.pravatar.cc/150?u=5', priority: 'Medium' }
  ],
  closed: [
    { id: 6, title: 'Password Reset', company: 'User123', avatar: 'https://i.pravatar.cc/150?u=6', priority: 'Low' },
    { id: 7, title: 'Billing Inquiry', company: 'Acme Corp', avatar: 'https://i.pravatar.cc/150?u=7', priority: 'Medium' }
  ]
};

const CaseCard = ({ caseData }) => (
  <div className="pill-card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
    <img src={caseData.avatar} alt="avatar" className="avatar avatar-sm" style={{ marginRight: '1rem' }} />
    <div style={{ flex: 1 }}>
      <div className="font-semibold text-sm">{caseData.title}</div>
      <div className="text-xs text-secondary">{caseData.company}</div>
    </div>
    <div className="flex gap-2 text-secondary">
      <MessageSquare size={16} strokeWidth={1.5} />
      <MoreHorizontal size={16} strokeWidth={1.5} />
    </div>
  </div>
);

const KanbanColumn = ({ title, count, cases }) => (
  <div className="flex-col">
    <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
      <h2 className="font-semibold">{title}</h2>
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600' }}>
        {count}
      </div>
    </div>
    <div className="flex-col">
      {cases.map(c => <CaseCard key={c.id} caseData={c} />)}
    </div>
  </div>
);

const KanbanBoard = () => {
  return (
    <div className="kanban-board">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Cases Overview</h1>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)' }}></div>
          <span className="text-secondary text-sm">Showing 1-7 of 7</span>
        </div>
        
        <div className="flex gap-1" style={{ backgroundColor: 'var(--bg-main)', padding: '0.35rem', borderRadius: '9999px' }}>
          <button className="tab-pill">Pipeline</button>
          <button className="tab-pill active">In Progress</button>
          <button className="tab-pill">Completed</button>
          <button className="tab-pill">Expired</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <KanbanColumn title="New Cases" count={2} cases={mockCases.new} />
        <KanbanColumn title="In Progress" count={2} cases={mockCases.inProgress} />
        <KanbanColumn title="Awaiting Info" count={1} cases={mockCases.awaiting} />
        <KanbanColumn title="Closed" count={2} cases={mockCases.closed} />
      </div>
    </div>
  );
};

export default KanbanBoard;
