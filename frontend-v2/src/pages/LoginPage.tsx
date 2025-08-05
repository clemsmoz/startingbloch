/*
 * ================================================================================================
 * PAGE DE CONNEXION - STARTINGBLOCH
 * ================================================================================================
 * 
 * Page de connexion avec authentification JWT et validation.
 * Utilise les composants Ant Design natifs pour un design cohérent.
 * 
 * ================================================================================================
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Alert, 
  Typography, 
  Image
} from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuthStore } from '@store/authStore';
import { useNotificationStore } from '@store/notificationStore';

const { Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

/**
 * Page de connexion
 */
const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (values: unknown) => {
    const loginData = values as LoginForm;
    try {
      const success = await login(loginData.username, loginData.password);
      
      if (success) {
        addNotification({
          type: 'success',
          message: 'Connexion réussie',
          description: 'Bienvenue dans StartingBloch!'
        });
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '800px',
          maxWidth: '90vw',
          minWidth: '400px',
          backgroundColor: 'white',
          padding: '60px',
          borderRadius: '20px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Image
            src="/src/assets/icons/startigbloch_transparent_corrected.png"
            alt="StartingBloch"
            height={120}
            preview={false}
            fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 24 24' fill='none' stroke='%23667eea' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16.21 2.76.21 3.91 0C20.16 27 24 22.55 24 17V7l-10-5z'/%3E%3C/svg%3E"
          />
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
          layout="vertical"
        >
          {error && (
            <Alert
              message="Erreur de connexion"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Form.Item
            label="Nom d'utilisateur"
            name="username"
            rules={[
              { required: true, message: 'Veuillez saisir votre nom d\'utilisateur' },
              { min: 3, message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="admin@startingbloch.com"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="Mot de passe"
            name="password"
            rules={[
              { required: true, message: 'Veuillez saisir votre mot de passe' },
              { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              icon={<LoginOutlined />}
              size="large"
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Version 2.0 • © 2025 StartingBloch
            </Text>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
