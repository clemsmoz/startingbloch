/*
 * ================================================================================================
 * COMPOSANT LOADING SPINNER
 * ================================================================================================
 */

import React from 'react';
import { Spin } from 'antd';
import styled from 'styled-components';

const SpinnerContainer = styled.div<{ fullscreen?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  ${props => props.fullscreen ? `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 9999;
  ` : `
    padding: 48px;
  `}
`;

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  fullscreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'default',
  tip = 'Chargement...',
  fullscreen = false
}) => {
  return (
    <SpinnerContainer fullscreen={fullscreen}>
      <Spin size={size} tip={tip} />
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
