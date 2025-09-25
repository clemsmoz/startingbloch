import React from 'react';
import { Spin, Typography } from 'antd';

const { Text } = Typography;

export const PrefetchOverlay: React.FC<{ done: number; total: number }> = ({ done, total }) => {
  if (done >= total) return null;
  return (
    <div style={{ position: 'fixed', zIndex: 9999, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)' }}>
      <div style={{ textAlign: 'center', padding: 24, borderRadius: 8, background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
        <Spin size="large" />
        <div style={{ marginTop: 12 }}>
          <Text strong>Connexion en cours</Text>
          <div style={{ marginTop: 6 }}><Text type="secondary">Chargement des données ({done}/{total})...</Text></div>
        </div>
      </div>
    </div>
  );
};

export default PrefetchOverlay;
