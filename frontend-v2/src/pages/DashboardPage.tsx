/*
 * ================================================================================================
 * PAGE DASHBOARD - STARTINGBLOCH
 * ================================================================================================
 * 
 * Page principale du dashboard avec aperçu des statistiques et widgets.
 * 
 * ================================================================================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Typography, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  UserOutlined,
  FileProtectOutlined,
  TeamOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import styled from 'styled-components';

// Services
import { clientService, brevetService, contactService, cabinetService } from '../services';

const { Title } = Typography;

const PageContainer = styled.div`
  padding: 0;
`;

const StatsCard = styled(Card)`
  .ant-card-body {
    padding: 24px;
  }
  
  .ant-statistic-title {
    font-size: 14px;
    font-weight: 500;
    color: #8c8c8c;
  }
  
  .ant-statistic-content {
    font-size: 24px;
    font-weight: 600;
  }
`;

const ClickableCard = styled(StatsCard)`
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  }
`;

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clients: 0,
    brevets: 0,
    contacts: 0,
    cabinets: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
  const storedUser = sessionStorage.getItem('startingbloch_user');
  const role = storedUser ? ((JSON.parse(storedUser).role ?? '') as string).toLowerCase() : '';
      const [clientsResponse, brevetsResponse, contactsResponse, cabinetsResponse] = await Promise.all([
        clientService.getAll(),
        brevetService.getAll(),
        contactService.getAll(),
        role === 'client' ? (async () => {
          const res = await cabinetService.getMine();
          return { success: res.success, data: res.data } as any;
        })() : cabinetService.getAll()
      ]);

      setStats({
    clients: clientsResponse.success ? (clientsResponse.data?.length ?? 0) : 0,
    brevets: brevetsResponse.success ? (brevetsResponse.data?.length ?? 0) : 0,
    contacts: contactsResponse.success ? (contactsResponse.data?.length ?? 0) : 0,
  cabinets: cabinetsResponse.success ? (cabinetsResponse.data?.length ?? 0) : 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2} style={{ marginBottom: 8 }}>
              {t('dashboard.title')}
            </Title>
            <Typography.Text type="secondary">
              {t('dashboard.subtitle')}
            </Typography.Text>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <ClickableCard onClick={() => navigate('/clients')}>
          <Statistic
            title={t('dashboard.stats.clients')}
                  value={stats.clients}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                  loading={loading}
                />
              </ClickableCard>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <ClickableCard onClick={() => navigate('/number-converter')}>
                <Statistic
                  title={t('menu.numberConverter')}
                  value={' '}
                  prefix={<FileProtectOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </ClickableCard>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <ClickableCard onClick={() => navigate('/brevets')}>
                <Statistic
                  title={t('dashboard.stats.brevets')}
                  value={stats.brevets}
                  prefix={<FileProtectOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                  loading={loading}
                />
              </ClickableCard>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatsCard>
                <Statistic
                  title={t('dashboard.stats.contacts')}
                  value={stats.contacts}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#faad14' }}
                  loading={loading}
                />
              </StatsCard>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <ClickableCard onClick={() => navigate('/cabinets')}>
                <Statistic
                  title={t('dashboard.stats.cabinets')}
                  value={stats.cabinets}
                  prefix={<BankOutlined />}
                  valueStyle={{ color: '#f5222d' }}
                  loading={loading}
                />
              </ClickableCard>
            </Col>
          </Row>

          <Card title={t('dashboard.recent.title')} style={{ marginTop: 24 }}>
            <Typography.Text type="secondary">
              {t('dashboard.recent.empty')}
            </Typography.Text>
          </Card>
        </Space>
      </motion.div>
    </PageContainer>
  );
};

export default DashboardPage;
