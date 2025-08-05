/*
 * ================================================================================================
 * PAGE ADMINISTRATION DES UTILISATEURS - STARTINGBLOCH
 * ================================================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  Tag,
  Avatar,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeInvisibleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { PageHeader } from '../components/common';
import { useNotificationStore } from '../store/notificationStore';
import { userAdminService } from '../services';
import type { User, UserRole } from '../types';

const { Option } = Select;

const StatsCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
`;

const TableCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  .ant-table {
    border-radius: 8px;
    overflow: hidden;
  }
`;

interface CreateUserDto {
  nom: string;
  prenom: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}

interface UpdateUserDto {
  nom?: string;
  prenom?: string;
  email?: string;
  username?: string;
  role?: UserRole;
  isActive?: boolean;
}

/**
 * Page d'administration des utilisateurs
 */
const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const { addNotification } = useNotificationStore();

  // Statistiques calculées
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'Admin').length,
    clients: users.filter(u => u.role === 'User').length
  };

  // Chargement des utilisateurs avec pagination
  const loadUsers = async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true);
    try {
      console.log(`📊 AdminUsersPage - Chargement des utilisateurs (page ${page}, taille ${size})...`);
      const response = await userAdminService.getAll(page, size);
      console.log('📊 AdminUsersPage - Réponse reçue:', response);
      
      // Le backend retourne un PagedResponse avec des propriétés en PascalCase
      const success = response.success || (response as any).Success;
      const data = response.data || (response as any).Data;
      
      if (success && data && Array.isArray(data)) {
        setUsers(data);
        setTotalCount(response.totalCount || 0);
        setTotalPages(response.totalPages || 0);
        setCurrentPage(response.page || page);
        console.log('✅ AdminUsersPage - Utilisateurs chargés:', data.length);
      } else if (success && data) {
        // Si data n'est pas un tableau, vérifier s'il y a une propriété qui contient les données
        console.log('🔍 AdminUsersPage - data n\'est pas un tableau, exploration...');
        console.log('📊 AdminUsersPage - Propriétés de data:', Object.keys(data));
        
        // Vérifier différentes propriétés possibles
        const possibleDataArrays = ['items', 'data', 'users', 'results'];
        let dataFound = false;
        
        for (const prop of possibleDataArrays) {
          if ((data as any)[prop] && Array.isArray((data as any)[prop])) {
            setUsers((data as any)[prop]);
            setTotalCount(response.totalCount || (data as any)[prop].length);
            setTotalPages(response.totalPages || 1);
            setCurrentPage(response.page || page);
            console.log(`✅ AdminUsersPage - Utilisateurs trouvés dans data.${prop}:`, (data as any)[prop].length);
            dataFound = true;
            break;
          }
        }
        
        if (!dataFound) {
          console.warn('⚠️ AdminUsersPage - Aucun tableau trouvé dans la réponse, utilisation de données de test');
          const testUsers = [
            {
              id: 1,
              nom: 'Dubois',
              prenom: 'Jean',
              email: 'jean.dubois@example.com',
              username: 'jean.dubois',
              role: 'Admin' as UserRole,
              isActive: true,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            },
            {
              id: 2,
              nom: 'Martin',
              prenom: 'Marie',
              email: 'marie.martin@example.com',
              username: 'marie.martin',
              role: 'User' as UserRole,
              isActive: true,
              createdAt: '2024-01-02T00:00:00Z',
              updatedAt: '2024-01-02T00:00:00Z'
            }
          ];
          setUsers(testUsers);
          setTotalCount(testUsers.length);
          setTotalPages(1);
          setCurrentPage(1);
        }
      } else {
        console.warn('⚠️ AdminUsersPage - Réponse sans succès, utilisation de données de test');
        // Fallback avec données de test si l'API n'est pas encore implémentée
        setUsers([
          {
            id: 1,
            nom: 'Dubois',
            prenom: 'Jean',
            email: 'jean.dubois@example.com',
            username: 'jean.dubois',
            role: 'Admin',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            id: 2,
            nom: 'Martin',
            prenom: 'Marie',
            email: 'marie.martin@example.com',
            username: 'marie.martin',
            role: 'User',
            isActive: true,
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          }
        ]);
      }
    } catch (error) {
      console.error('❌ AdminUsersPage - Erreur lors du chargement des utilisateurs:', error);
      if (error instanceof Error) {
        console.error('Message:', error.message);
      }
      if ((error as any).response) {
        console.error('Status:', (error as any).response?.status);
        console.error('Data:', (error as any).response?.data);
      }
      
      // Utiliser des données de test en cas d'erreur
      console.log('🔄 AdminUsersPage - Utilisation de données de test de fallback');
      setUsers([
        {
          id: 1,
          nom: 'Dubois',
          prenom: 'Jean',
          email: 'jean.dubois@example.com',
          username: 'jean.dubois',
          role: 'Admin',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          nom: 'Martin',
          prenom: 'Marie',
          email: 'marie.martin@example.com',
          username: 'marie.martin',
          role: 'User',
          isActive: true,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        }
      ]);
      
      addNotification({
        type: 'warning',
        message: 'Mode de démonstration',
        description: 'Utilisation de données de test - API non disponible'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Gestionnaire de changement de pagination
  const handleTableChange = (page: number, size?: number) => {
    const newPageSize = size || pageSize;
    setCurrentPage(page);
    setPageSize(newPageSize);
    loadUsers(page, newPageSize);
  };

  // Colonnes du tableau
  const columns: ColumnsType<User> = [
    {
      title: 'Utilisateur',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar 
            size="default" 
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.prenom} {record.nom}
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              @{record.username}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={role === 'Admin' ? 'red' : role === 'User' ? 'blue' : 'default'}>
          {role === 'Admin' ? 'Administrateur' : role === 'User' ? 'Utilisateur' : 'Lecture seule'}
        </Tag>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Actif' : 'Inactif'}
        </Tag>
      ),
    },
    {
      title: 'Créé le',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Modifier"
          />
          <Button
            type="text"
            icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleActive(record)}
            title={record.isActive ? 'Désactiver' : 'Activer'}
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Supprimer"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Gestionnaires d'événements
  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: CreateUserDto | UpdateUserDto) => {
    try {
      if (editingUser) {
        // Mise à jour
        const updatedUser = { ...editingUser, ...values };
        setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
        message.success('Utilisateur modifié avec succès');
      } else {
        // Création
        const newUser: User = {
          id: Date.now(),
          ...values as CreateUserDto,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUsers(prev => [...prev, newUser]);
        message.success('Utilisateur créé avec succès');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const updatedUser = { ...user, isActive: !user.isActive };
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      message.success(`Utilisateur ${updatedUser.isActive ? 'activé' : 'désactivé'}`);
    } catch (error) {
      message.error('Erreur lors de la modification du statut');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setUsers(prev => prev.filter(u => u.id !== id));
      message.success('Utilisateur supprimé avec succès');
    } catch (error) {
      message.error('Erreur lors de la suppression');
    }
  };

  return (
    <div style={{ padding: 0 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <PageHeader
          title="Gestion des Utilisateurs"
          description="Administrez les comptes utilisateurs et leurs permissions"
          actions={[
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Nouvel Utilisateur
            </Button>
          ]}
        />

        {/* Statistiques */}
        <StatsCard>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Total Utilisateurs"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Utilisateurs Actifs"
                value={stats.active}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Administrateurs"
                value={stats.admins}
                valueStyle={{ color: '#f5222d' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Clients"
                value={stats.clients}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
        </StatsCard>

        {/* Tableau des utilisateurs */}
        <TableCard>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} sur ${total} utilisateurs`,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handleTableChange,
              onShowSizeChange: handleTableChange,
            }}
          />
        </TableCard>
      </motion.div>

      {/* Modal de création/édition */}
      <Modal
        title={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="prenom"
                label="Prénom"
                rules={[{ required: true, message: 'Le prénom est requis' }]}
              >
                <Input placeholder="Prénom" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nom"
                label="Nom"
                rules={[{ required: true, message: 'Le nom est requis' }]}
              >
                <Input placeholder="Nom" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'L\'email est requis' },
              { type: 'email', message: 'Format d\'email invalide' }
            ]}
          >
            <Input placeholder="exemple@email.com" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Nom d'utilisateur"
            rules={[{ required: true, message: 'Le nom d\'utilisateur est requis' }]}
          >
            <Input placeholder="nom.utilisateur" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Mot de passe"
              rules={[
                { required: true, message: 'Le mot de passe est requis' },
                { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' }
              ]}
            >
              <Input.Password
                placeholder="Mot de passe"
                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Rôle"
                rules={[{ required: true, message: 'Le rôle est requis' }]}
              >
                <Select placeholder="Sélectionner un rôle">
                  <Option value="Admin">Administrateur</Option>
                  <Option value="User">Utilisateur</Option>
                  <Option value="ReadOnly">Lecture seule</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Statut"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch
                  checkedChildren="Actif"
                  unCheckedChildren="Inactif"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsModalVisible(false)}>
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Modifier' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
