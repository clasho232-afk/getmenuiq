import React from 'react';
import { ArrowRight, Bell } from 'lucide-react';
import { UberEatsIcon, DeliverooIcon, JustEatIcon } from './PlatformIcons';

const AlertSystemWidget = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="harmonized-card-bg w-full h-full rounded-[24px] flex flex-col relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
      style={{ padding: '1.25rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', marginBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <h2 className="text-xl font-bold text-gray-900 leading-tight m-0">Alert Center</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FEF2F2', padding: '6px', borderRadius: '50%' }}>
          <Bell size={14} color="#EF4444" />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Massive KPI */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem', marginTop: '0' }}>
          <div style={{ fontSize: '4.5rem', fontWeight: 800, color: '#E86A58', lineHeight: 1, letterSpacing: '-0.02em' }}>9</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.1em', marginTop: '8px' }}>TOTAL ALERTS</div>
        </div>

        {/* Platform Pill Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#06C16715', padding: '4px 10px', borderRadius: '12px' }}>
            <UberEatsIcon size={20} color="#06C167" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#06C167' }}>5</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#00CCBC15', padding: '4px 10px', borderRadius: '12px' }}>
            <DeliverooIcon size={20} color="#00CCBC" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#00CCBC' }}>2</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FF800015', padding: '4px 10px', borderRadius: '12px' }}>
            <JustEatIcon size={20} color="#FF8000" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF8000' }}>2</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF' }}>Updated just now</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#E86A58' }}>
          Open Center <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
};

export default AlertSystemWidget;
