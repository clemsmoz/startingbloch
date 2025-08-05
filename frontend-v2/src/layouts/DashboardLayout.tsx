/*
 * ================================================================================================
 * LAYOUT DASHBOARD - STARTINGBLOCH
 * ================================================================================================
 * 
 * Layout principal pour l'application avec navigation, sidebar et header.
 * Inclut la gestion responsive et les menus de navigation.
 * 
 * ================================================================================================
 */

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Typography,
  Space,
  Button,
  Badge,
  Drawer,
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileProtectOutlined,
  BankOutlined,
  UserOutlined,
  ExperimentOutlined,
  CrownOutlined,
  AuditOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useAuthStore } from '@store/authStore';
import { useNotificationStore } from '@store/notificationStore';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// Styled components
const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledHeader = styled(Header)`
  background: #fff;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoImage = styled.img`
  height: 40px;
  width: auto;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
`;

const BrandText = styled(Title)`
  margin: 0 !important;
  color: #1890ff;
  font-size: 20px;
  font-weight: 600;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const StyledContent = styled(Content)`
  margin: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  min-height: calc(100vh - 112px);
`;

const MobileMenuButton = styled(Button)`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const DesktopSider = styled(Sider)`
  @media (max-width: 768px) {
    display: none !important;
  }
`;

/**
 * Configuration du menu de navigation
 */
const getMenuItems = (userRole: string) => {
  console.log('🎯 Menu - Rôle utilisateur:', userRole);
  console.log('🎯 Menu - Est Admin?', userRole === 'Admin');
  
  const baseItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/clients',
      icon: <TeamOutlined />,
      label: 'Clients',
    },
    {
      key: '/brevets',
      icon: <FileProtectOutlined />,
      label: 'Brevets',
    },
    {
      key: '/cabinets',
      icon: <BankOutlined />,
      label: 'Cabinets',
    },
  ];
  
  const adminItems = userRole === 'Admin' ? [
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Gestion Utilisateurs',
    },
    {
      key: '/logs',
      icon: <AuditOutlined />,
      label: 'Logs système',
    },
  ] : [];
  
  const allItems = [...baseItems, ...adminItems];
  console.log('🎯 Menu - Items générés:', allItems.map(item => item.label));
  
  return allItems;
};

/**
 * Layout principal du dashboard
 */
const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { notifications } = useNotificationStore();

  console.log('👤 DashboardLayout - Utilisateur:', user);
  console.log('👤 DashboardLayout - Rôle:', user?.role);
  console.log('👤 DashboardLayout - Utilisateur complet:', JSON.stringify(user, null, 2));

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    setMobileMenuVisible(false); // Fermer le menu mobile après navigation
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mon profil',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Paramètres',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Déconnexion',
      onClick: handleLogout,
    },
  ];

  const menuItems = getMenuItems(user?.role || 'User');

  const siderContent = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ height: '100%', borderRight: 0 }}
    />
  );

  return (
    <StyledLayout>
      {/* Header */}
      <StyledHeader>
        <LogoContainer>
          <MobileMenuButton
            type="text"
            icon={<MenuUnfoldOutlined />}
            onClick={() => setMobileMenuVisible(true)}
          />
          
          <LogoImage 
            src="/src/assets/icons/startigbloch_transparent_corrected.png" 
            alt="StartingBloch"
            onError={(e) => {
              // Fallback SVG si l'image ne charge pas
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%231890ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16.21 2.76.21 3.91 0C20.16 27 24 22.55 24 17V7l-10-5z'/%3E%3C/svg%3E";
            }}
          />
        </LogoContainer>

        <HeaderActions>
          {/* Notifications */}
          <Badge count={notifications.length} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ fontSize: '16px' }}
            />
          </Badge>

          {/* Bouton collapse pour desktop */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ 
              fontSize: '16px',
              display: window.innerWidth <= 768 ? 'none' : 'flex'
            }}
          />

          {/* Menu utilisateur */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <UserInfo>
              <Avatar size="small" icon={<UserOutlined />} />
              <Space direction="vertical" size={0}>
                <Text strong style={{ fontSize: '14px' }}>
                  {user?.username || 'Utilisateur'}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {user?.role || 'User'}
                </Text>
              </Space>
            </UserInfo>
          </Dropdown>
        </HeaderActions>
      </StyledHeader>

      <Layout>
        {/* Sidebar Desktop */}
        <DesktopSider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="dark"
        >
          {siderContent}
        </DesktopSider>

        {/* Sidebar Mobile */}
        <Drawer
          title="Navigation"
          placement="left"
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          styles={{ body: { padding: 0 } }}
          width={250}
        >
          {siderContent}
        </Drawer>

        {/* Contenu principal */}
        <StyledContent>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={location.pathname}
          >
            <Outlet />
          </motion.div>
        </StyledContent>
      </Layout>
    </StyledLayout>
  );
};

export default DashboardLayout;
