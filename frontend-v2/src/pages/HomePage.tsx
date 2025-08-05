/*
 * ================================================================================================
 * PAGE D'ACCUEIL - STARTINGBLOCH
 * ================================================================================================
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Space, Avatar, Statistic, Spin } from 'antd';
import {
  FileProtectOutlined,
  TeamOutlined,
  BankOutlined,
  ArrowRightOutlined,
  UserOutlined,
  ContactsOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { brevetService, clientService, cabinetService, contactService } from '../services';

const { Title, Paragraph } = Typography;

const PageContainer = styled.div`
  padding: 0;
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const LogoImage = styled.img`
  max-width: 300px;
  height: auto;
`;

const StyledCard = styled(Card)`
  height: 100%;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  .ant-card-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 32px 24px;
  }
`;

const IconContainer = styled(Avatar)`
  width: 80px !important;
  height: 80px !important;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  
  .anticon {
    font-size: 32px;
  }
`;

const CardTitle = styled(Title)`
  margin-bottom: 12px !important;
  color: #1890ff;
`;

const CardDescription = styled(Paragraph)`
  margin-bottom: 24px !important;
  color: #8c8c8c;
  flex-grow: 1;
`;

const ActionButton = styled(Button)`
  width: 100%;
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
`;

/**
 * Page d'accueil avec navigation vers les principales sections
 */
const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const cardData = [
    {
      title: "Portefeuille cabinets",
      description: "Accédez à votre portefeuille de cabinets et gérez leurs informations.",
      icon: <BankOutlined />,
      navigateTo: '/cabinets',
      color: '#1890ff'
    },
    {
      title: "Portefeuille clients", 
      description: "Accédez à votre portefeuille de clients et suivez vos relations.",
      icon: <TeamOutlined />,
      navigateTo: '/clients',
      color: '#52c41a'
    },
    {
      title: "Portefeuille brevets",
      description: "Accédez à votre portefeuille de brevets et gérez vos propriétés intellectuelles.",
      icon: <FileProtectOutlined />,
      navigateTo: '/brevets',
      color: '#faad14'
    },
  ];

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Logo de l'entreprise */}
          <LogoContainer>
            <LogoImage 
              src="/src/assets/startigbloch_transparent_corrected.png" 
              alt="StartingBloch"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </LogoContainer>
          
          {/* Titre de la page */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Title level={1} style={{ color: '#1890ff', marginBottom: 8 }}>
              Bienvenue sur StartingBloch
            </Title>
            <Paragraph type="secondary" style={{ fontSize: '16px' }}>
              Choisissez une section pour commencer à travailler
            </Paragraph>
          </div>
          
          {/* Cartes de navigation */}
          <Row gutter={[32, 32]} justify="center">
            {cardData.map((card) => (
              <Col 
                key={card.navigateTo} 
                xs={24} 
                sm={12} 
                lg={8}
                style={{ display: 'flex' }}
              >
                <motion.div
                  style={{ width: '100%' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <StyledCard 
                    onClick={() => navigate(card.navigateTo)}
                    hoverable
                  >
                    <IconContainer 
                      icon={card.icon}
                      style={{ backgroundColor: card.color }}
                    />
                    <CardTitle level={3}>
                      {card.title}
                    </CardTitle>
                    <CardDescription>
                      {card.description}
                    </CardDescription>
                    <ActionButton 
                      type="primary" 
                      icon={<ArrowRightOutlined />}
                      iconPosition="end"
                    >
                      Accéder
                    </ActionButton>
                  </StyledCard>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Space>
      </motion.div>
    </PageContainer>
  );
};

export default HomePage;
