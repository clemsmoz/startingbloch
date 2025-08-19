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
import { userAdminService, clientService, roleService } from '../services';
import type { User, UserRole, RoleItem, Client } from '../types';

const { Option } = Select;

// Fonction d'icône pour le champ mot de passe (stabilisée hors composant)
const passwordIconRender = (visible: boolean) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />);

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
  prenom: string;
  nom: string;
  email: string;
  username: string;
  password: string;
  role: UserRole; // 'Admin' | 'User' | 'Client'
  isActive: boolean;
  canWrite?: boolean;
  clientId?: number; // obligatoire si role = Client
}

interface UpdateUserDto {
  prenom?: string;
  nom?: string;
  email?: string;
  username?: string;
  role?: UserRole;
  isActive?: boolean;
  canWrite?: boolean;
  clientId?: number | null;
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
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  // Note: pagination serveur future – totalPages non utilisé pour le moment
  
  const { addNotification } = useNotificationStore();

  // Statistiques calculées
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'Admin').length,
    clients: users.filter(u => u.role === 'Client').length
  };

  // Helpers pour lisibilité (évite les ternaires imbriqués)
  const roleMeta: Record<UserRole, { color: string; label: string }> = {
    Admin: { color: 'red', label: 'Administrateur' },
    User: { color: 'blue', label: 'Utilisateur' },
    Client: { color: 'purple', label: 'Client' },
  };

  const normalizeRoleFromDb = (name: string): UserRole => {
    const n = name.trim().toLowerCase();
    if (n === 'admin') return 'Admin';
    if (n === 'client') return 'Client';
    return 'User';
  };

  // Chargement des utilisateurs avec pagination
  const loadUsers = async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true);
    try {
      const response = await userAdminService.getAll(page, size);
      // Le backend retourne un PagedResponse standard
      const success = response.success ?? (response as any).Success;
      const data = (response.data ?? (response as any).Data) as any;

      let items: User[] = [];
      if (Array.isArray(data)) {
        items = data as User[];
      } else if (Array.isArray(data?.items)) {
        items = data.items as User[];
      } else if (Array.isArray(data?.users)) {
        items = data.users as User[];
      }

      if (success) {
        setUsers(items);
        setTotalCount(response.totalCount || (data?.totalCount ?? items.length) || 0);
        setCurrentPage(response.page || data?.page || page);
      }
    } catch (error) {
      console.error('❌ AdminUsersPage - Erreur lors du chargement des utilisateurs:', error);
      addNotification({ type: 'error', message: 'Impossible de charger les utilisateurs' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([loadUsers(), loadRoles(), loadClients()]);
    })();
  }, []);

  const loadRoles = async () => {
    const res = await roleService.getAll();
    if (res.success) setRoles(res.data);
  };

  const loadClients = async () => {
    const res = await clientService.getAll(1, 1000);
    if (res.success) setClients(res.data);
  };

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
        <Tag color={roleMeta[role].color}>{roleMeta[role].label}</Tag>
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
      title: "Écriture",
      key: 'canWrite',
      render: (_, record) => (
        <Switch
          checked={!!(record as any).canWrite}
          onChange={async (checked) => {
            await userAdminService.updatePermissions(record.id, true, checked);
            await loadUsers();
          }}
          disabled={record.role === 'Admin'}
          checkedChildren="Oui"
          unCheckedChildren="Non"
        />
      )
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
        // Mise à jour via API
        const selRole = (values as any).role as UserRole | undefined;
        const payload: UpdateUserDto = {
          email: (values as any).email,
          username: (values as any).username,
          role: selRole,
          isActive: (values as any).isActive,
          canWrite: (values as any).canWrite,
          clientId: (values as any).role === 'Client' ? (values as any).clientId : null,
        };
        await userAdminService.update(editingUser.id, payload);
        await loadUsers();
        message.success('Utilisateur modifié avec succès');
      } else {
        // Création via API
        const role = (values as any).role as UserRole;
        if (role === 'Admin' || role === 'User') {
          await userAdminService.createEmployee({
            username: (values as any).username,
            email: (values as any).email,
            password: (values as any).password,
            role: role === 'Admin' ? 'admin' : 'user',
            canWrite: (values as any).canWrite ?? false,
            isActive: (values as any).isActive ?? true,
          });
        } else {
          // Client
          await userAdminService.createClientAccount({
            clientId: (values as any).clientId,
            username: (values as any).username,
            email: (values as any).email,
            password: (values as any).password,
            canWrite: (values as any).canWrite ?? false,
            isActive: (values as any).isActive ?? true,
          });
        }
        await loadUsers();
        message.success('Utilisateur créé avec succès');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      if (user.isActive) {
        await userAdminService.deactivate(user.id);
      } else {
        await userAdminService.activate(user.id);
      }
      await loadUsers();
      message.success(`Utilisateur ${!user.isActive ? 'activé' : 'désactivé'}`);
    } catch (error) {
      console.error(error);
      message.error('Erreur lors de la modification du statut');
    }
  };

  const handleDelete = async (id: number) => {
    try {
  await userAdminService.delete(id);
  setUsers(prev => prev.filter(u => u.id !== id));
  message.success('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error(error);
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
                iconRender={passwordIconRender}
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
                <Select placeholder="Sélectionner un rôle" onChange={() => form.validateFields(['clientId'])}>
                  {roles.map(r => {
                    const uiRole = normalizeRoleFromDb(r.name);
                    return (
                      <Option key={r.id} value={uiRole}>{roleMeta[uiRole].label}</Option>
                    );
                  })}
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

          {/* Permissions écriture si rôle User ou Client */}
          <Form.Item shouldUpdate={(prev, curr) => prev.role !== curr.role}>
            {() => {
              const role = form.getFieldValue('role') as UserRole;
              if (role === 'User' || role === 'Client') {
                return (
                  <Form.Item name="canWrite" label="Droit d'écriture" valuePropName="checked" initialValue={false}>
                    <Switch checkedChildren="Oui" unCheckedChildren="Non" />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          {/* Sélecteur Client requis si rôle Client */}
          <Form.Item shouldUpdate={(prev, curr) => prev.role !== curr.role}>
            {() => {
              const role = form.getFieldValue('role') as UserRole;
              if (role === 'Client') {
                return (
                  <Form.Item
                    name="clientId"
                    label="Client lié"
                    rules={[{ required: true, message: 'Le client est requis pour un compte client' }]}
                  >
                    <Select placeholder="Sélectionner un client">
                      {clients.map(c => (
                        <Option key={c.id} value={c.id}>{c.nomClient}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

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
