/*
 * ================================================================================================
 * PAGE CLIENTS - STARTINGBLOCH
 * ================================================================================================
 * 
 * Page de gestion des clients avec liste, ajout, modification et suppression.
 * 
 * ================================================================================================
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Space, 
  message, 
  Modal, 
  Tag,
  Dropdown,
  MenuProps
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  ExportOutlined,
  ContactsOutlined
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { motion } from 'framer-motion';

// Components
import { PageHeader, DataTable, SearchInput } from '../components/common';
import { AddClientModal, EditClientModal } from '../components/modals';

// Services
import { clientService } from '../services';

// Types
import type { Client } from '../types';

// Hooks
import { useNotificationStore } from '../store/notificationStore';

const ClientsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  // Recherche contrôlée localement (pas besoin d'état séparé)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  const { addNotification } = useNotificationStore();

  // Charger les clients avec pagination
  const loadClients = async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true);
    try {
      const response = await clientService.getAll(page, size);
      if (response.success && response.data) {
        setClients(response.data);
  setTotalCount(response.totalCount ?? 0);
  setCurrentPage(response.page ?? page);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
        addNotification({
          type: 'error',
          message: t('clients.loadErrorTitle'),
          description: t('clients.loadErrorDesc')
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers pour les modales
  const handleAdd = () => {
    setIsAddModalVisible(true);
  };

  const handleEdit = (client: Client) => {
    setClientToEdit(client);
    setIsEditModalVisible(true);
  };

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setIsDetailModalVisible(true);
  };

  const handleViewContacts = (client: Client) => {
    // Naviguer vers la page des contacts avec l'ID du client
    navigate(`/contacts?clientId=${client.id}&clientName=${encodeURIComponent(client.nomClient)}`);
  };

  const handleViewBrevets = (client: Client) => {
  // Naviguer vers la page dédiée des brevets d'un client
  navigate(`/clients/${client.id}/brevets?clientName=${encodeURIComponent(client.nomClient)}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await clientService.delete(id);
      addNotification({
        type: 'success',
          message: t('clients.deleteSuccess')
      });
      loadClients();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      addNotification({
        type: 'error',
          message: t('clients.deleteError')
      });
    }
  };

  const handleAddSuccess = () => {
    setIsAddModalVisible(false);
    loadClients();
    addNotification({
      type: 'success',
      message: t('clients.addSuccess')
    });
  };

  const handleEditSuccess = () => {
    setIsEditModalVisible(false);
    setClientToEdit(null);
    loadClients();
    addNotification({
      type: 'success',
      message: t('clients.editSuccess')
    });
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Gestionnaire de changement de pagination
  const handleTableChange = (page: number, size?: number) => {
  const newPageSize = size ?? pageSize;
    setCurrentPage(page);
    setPageSize(newPageSize);
    loadClients(page, newPageSize);
  };

  // Recherche
  const handleSearch = async (value: string) => {
  const query = value?.trim() ?? '';
    if (query) {
      // Normaliser la requête pour la rendre insensible à la casse côté client
      const normalized = query.toLowerCase();
      setLoading(true);
      try {
        const response = await clientService.search(normalized);
        if (response.success && response.data) {
          setClients(response.data);
          // Réinitialiser la pagination pour la recherche
          setCurrentPage(1);
          setTotalCount(response.data.length);
        }
      } catch (error) {
        console.error('Erreur de recherche:', error);
        addNotification({
        type: 'error',
        message: t('clients.searchErrorTitle'),
        description: t('clients.searchErrorDesc')
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Retourner à la pagination normale si recherche vide
      setCurrentPage(1);
      loadClients(1, pageSize);
    }
  };

  // Supprimer un client
  const confirmDelete = (client: Client) => {
    Modal.confirm({
      title: t('clients.confirmDeleteTitle'),
      content: t('clients.confirmDeleteContent', { name: client.nomClient }),
      okText: t('clients.actions.delete'),
      okType: 'danger',
      cancelText: t('clients.cancel'),
      onOk: () => handleDelete(client.id)
    });
  };

  // Actions par ligne
  const getRowActions = (record: Client): MenuProps['items'] => {
    return [
      {
        key: 'view',
        label: t('clients.actions.view'),
        icon: <EyeOutlined />,
        onClick: () => handleView(record)
      },
      {
        key: 'contacts',
        label: t('clients.actions.contacts'),
        icon: <ContactsOutlined />,
        onClick: () => handleViewContacts(record)
      },
      {
        key: 'brevets',
        label: t('clients.actions.brevets'),
        icon: <EyeOutlined />,
        onClick: () => handleViewBrevets(record)
      },
      {
        key: 'edit',
        label: t('clients.actions.edit'),
        icon: <EditOutlined />,
        onClick: () => handleEdit(record)
      },
      {
        type: 'divider'
      },
      {
        key: 'delete',
        label: t('clients.actions.delete'),
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => confirmDelete(record)
      }
    ];
  };

  const columns: ColumnsType<Client> = [
    {
      title: t('clients.columns.id'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: t('clients.columns.name'),
      dataIndex: 'nomClient',
      key: 'nomClient',
      sorter: (a, b) => a.nomClient.localeCompare(b.nomClient),
      filterSearch: true,
    },
    {
      title: t('clients.columns.email'),
      dataIndex: 'emailClient',
      key: 'emailClient',
      render: (email: string) => (
        email ? <a href={`mailto:${email}`}>{email}</a> : t('common.notProvided')
      ),
    },
    {
      title: t('clients.columns.phone'),
      dataIndex: 'telephoneClient',
      key: 'telephoneClient',
  render: (phone: string) => phone ?? t('common.notProvided'),
    },
    {
      title: t('clients.columns.status'),
      dataIndex: 'statut',
      key: 'statut',
      render: (statut: string) => {
        const color = statut === 'Actif' ? 'green' : 'orange';
  return <Tag color={color}>{statut ?? t('clients.detailModal.notDefined')}</Tag>;
      },
      filters: [
        { text: t('clients.status.active'), value: 'Actif' },
        { text: t('clients.status.inactive'), value: 'Inactif' },
      ],
      onFilter: (value: any, record: any) => record.statut === value,
    },
    {
      title: t('clients.columns.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getRowActions(record) }}
          trigger={['click']}
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];

  // Actions de l'en-tête
  const headerActions = [
    <Button
      key="export"
      icon={<ExportOutlined />}
      onClick={() => {
    message.info(t('clients.buttons.exportComing'));
      }}
    >
  {t('clients.buttons.export')}
    </Button>,
    <Button
      key="add"
      type="primary"
      icon={<PlusOutlined />}
      onClick={handleAdd}
    >
  {t('clients.buttons.new')}
    </Button>
  ];

  // Supprimé le filtrage côté client - la recherche est gérée côté serveur

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
  title={t('clients.title')}
  description={t('clients.description')}
        breadcrumbs={[
          { title: t('clients.title') }
        ]}
        actions={headerActions}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <SearchInput
          placeholder={t('clients.searchPlaceholder')}
          onSearch={handleSearch}
          style={{ maxWidth: 400 }}
        />

        <DataTable
          columns={columns}
          data={clients}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              t('clients.pagination.showTotal', { from: range[0], to: range[1], total }),
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange,
          }}
        />
      </Space>

      {/* Modal de détails */}
      <Modal
  title={t('clients.detailModal.title', { name: selectedClient?.nomClient })}
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedClient(null);
        }}
        footer={[
            <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            {t('clients.detailModal.close') ?? 'Fermer'}
          </Button>
        ]}
        width={600}
      >
        {selectedClient && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div><strong>{t('clients.columns.id')}:</strong> {selectedClient.id}</div>
            <div><strong>{t('clients.columns.name')}:</strong> {selectedClient.nomClient}</div>
            <div><strong>{t('clients.columns.email')}:</strong> {selectedClient.emailClient ?? t('clients.detailModal.notProvided')}</div>
            <div><strong>{t('clients.columns.phone')}:</strong> {selectedClient.telephoneClient ?? t('clients.detailModal.notProvided')}</div>
            <div><strong>{t('clients.address')}:</strong> {selectedClient.adresseClient ?? t('clients.detailModal.notProvided')}</div>
            <div><strong>{t('clients.columns.status')}:</strong> <Tag color={selectedClient.statut === 'Actif' ? 'green' : 'orange'}>{selectedClient.statut ?? t('clients.detailModal.notDefined')}</Tag></div>
            <div><strong>{t('clients.createdAt')}:</strong> {new Date(selectedClient.createdAt).toLocaleDateString(i18n?.language ?? 'fr-FR')}</div>
          </Space>
        )}
      </Modal>

      {/* Modal d'ajout */}
      <AddClientModal
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSubmit={async (values, hasUserAccount) => {
          try {
            if (hasUserAccount) {
              // Créer client avec compte utilisateur - Appel direct à UserAdmin
              console.log('🔄 Création client avec compte utilisateur via UserAdmin');
              const userValues = values as any; // Cast pour accéder aux champs utilisateur
              
              const clientWithUserData = {
                // Données client
                nomClient: values.nomClient,
                referenceClient: values.referenceClient,
                adresseClient: values.adresseClient,
                codePostal: values.codePostal,
                paysClient: values.paysClient,
                emailClient: values.emailClient,
                telephoneClient: values.telephoneClient,
                
                // Données utilisateur
                username: userValues.userEmail,
                userEmail: userValues.userEmail,
                password: userValues.password,
                
                // Permissions
                canWrite: values.canWrite ?? false,
                canRead: values.canRead ?? true,
                isActive: !(values.isBlocked ?? false),
              };
              
              // Appel direct à l'endpoint UserAdmin
              const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/useradmin/create-new-client-with-user`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${sessionStorage.getItem('startingbloch_token')}`
                },
                body: JSON.stringify(clientWithUserData)
              });
              
              if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
              }
              
            } else {
              // Créer client simple
              console.log('🔄 Création client simple');
              await clientService.create(values);
            }
            handleAddSuccess();
          } catch (error) {
            console.error('❌ Erreur création client:', error);
            addNotification({
              type: 'error',
              message: t('clients.createError')
            });
          }
        }}
      />

      {/* Modal d'édition */}
      <EditClientModal
        visible={isEditModalVisible}
        client={clientToEdit}
        onCancel={() => {
          setIsEditModalVisible(false);
          setClientToEdit(null);
        }}
        onSubmit={async (values) => {
          try {
            if (clientToEdit?.id) {
              await clientService.update(clientToEdit.id, values);
              handleEditSuccess();
            }
          } catch (error) {
            console.error('Erreur lors de la modification:', error);
            addNotification({
              type: 'error',
            message: t('clients.updateError')
            });
          }
        }}
      />
    </motion.div>
  );
};

export default ClientsPage;
