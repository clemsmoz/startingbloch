/*
 * ================================================================================================
 * COMPOSANT STATUS BADGE
 * ================================================================================================
 */

import React from 'react';
import { Badge } from 'antd';

interface StatusBadgeProps {
  status: 'success' | 'processing' | 'error' | 'warning' | 'default';
  text: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  return <Badge status={status} text={text} />;
};

export default StatusBadge;
