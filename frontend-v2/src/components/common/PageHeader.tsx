/*
 * ================================================================================================
 * COMPOSANT PAGE HEADER
 * ================================================================================================
 */

import React from 'react';
import { Typography, Space, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;

const HeaderContainer = styled.div`
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode[];
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions
}) => {
  const breadcrumbItems = breadcrumbs ? [
    {
      title: <HomeOutlined />,
      href: '/dashboard',
      key: 'home'
    },
    ...breadcrumbs.map((item, index) => ({
      ...item,
      key: `breadcrumb-${index}`
    }))
  ] : [];

  return (
    <HeaderContainer>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb 
          items={breadcrumbItems}
          style={{ marginBottom: 16 }}
        />
      )}
      
      <HeaderTop>
        <HeaderContent>
          <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
            {title}
          </Title>
          {description && (
            <Text type="secondary">{description}</Text>
          )}
        </HeaderContent>
        
        {actions && actions.length > 0 && (
          <HeaderActions>
            <Space>
              {actions.map((action, index) => (
                <React.Fragment key={index}>
                  {action}
                </React.Fragment>
              ))}
            </Space>
          </HeaderActions>
        )}
      </HeaderTop>
    </HeaderContainer>
  );
};

export default PageHeader;
