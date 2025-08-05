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
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const { addNotification } = useNotificationStore();

  // Charger les clients avec pagination
  const loadClients = async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true);
    try {
      const response = await clientService.getAll(page, size);
      if (response.success && response.data) {
        setClients(response.data);
        setTotalCount(response.totalCount || 0);
        setTotalPages(response.totalPages || 0);
        setCurrentPage(response.page || page);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur',
        description: 'Impossible de charger la liste des clients'
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

  const handleDelete = async (id: number) => {
    try {
      await clientService.delete(id);
      addNotification({
        type: 'success',
        message: 'Client supprimé avec succès'
      });
      loadClients();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      addNotification({
        type: 'error',
        message: 'Erreur lors de la suppression du client'
      });
    }
  };

  const handleAddSuccess = () => {
    setIsAddModalVisible(false);
    loadClients();
    addNotification({
      type: 'success',
      message: 'Client ajouté avec succès'
    });
  };

  const handleEditSuccess = () => {
    setIsEditModalVisible(false);
    setClientToEdit(null);
    loadClients();
    addNotification({
      type: 'success',
      message: 'Client modifié avec succès'
    });
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Gestionnaire de changement de pagination
  const handleTableChange = (page: number, size?: number) => {
    const newPageSize = size || pageSize;
    setCurrentPage(page);
    setPageSize(newPageSize);
    loadClients(page, newPageSize);
  };

  // Recherche
  const handleSearch = async (value: string) => {
    setSearchValue(value);
    if (value.trim()) {
      setLoading(true);
      try {
        const response = await clientService.search(value);
        if (response.success && response.data) {
          setClients(response.data);
          // Réinitialiser la pagination pour la recherche
          setCurrentPage(1);
          setTotalCount(response.data.length);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Erreur de recherche:', error);
        addNotification({
          type: 'error',
          message: 'Erreur de recherche',
          description: 'Impossible d\'effectuer la recherche'
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
      title: 'Confirmer la suppression',
      content: `Êtes-vous sûr de vouloir supprimer le client "${client.nomClient}" ?`,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => handleDelete(client.id)
    });
  };

  // Actions par ligne
  const getRowActions = (record: Client): MenuProps['items'] => [
    {
      key: 'view',
      label: 'Voir les détails',
      icon: <EyeOutlined />,
      onClick: () => handleView(record)
    },
    {
      key: 'contacts',
      label: 'Voir contacts',
      icon: <ContactsOutlined />,
      onClick: () => handleViewContacts(record)
    },
    {
      key: 'edit',
      label: 'Modifier',
      icon: <EditOutlined />,
      onClick: () => handleEdit(record)
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      label: 'Supprimer',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => confirmDelete(record)
    }
  ];

  // Colonnes de la table
  const columns: ColumnsType<Client> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Nom',
      dataIndex: 'nomClient',
      key: 'nomClient',
      sorter: (a, b) => a.nomClient.localeCompare(b.nomClient),
      filterSearch: true,
    },
    {
      title: 'Email',
      dataIndex: 'emailClient',
      key: 'emailClient',
      render: (email: string) => (
        email ? <a href={`mailto:${email}`}>{email}</a> : '-'
      ),
    },
    {
      title: 'Téléphone',
      dataIndex: 'telephoneClient',
      key: 'telephoneClient',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut: string) => {
        const color = statut === 'Actif' ? 'green' : 'orange';
        return <Tag color={color}>{statut || 'Non défini'}</Tag>;
      },
      filters: [
        { text: 'Actif', value: 'Actif' },
        { text: 'Inactif', value: 'Inactif' },
      ],
      onFilter: (value, record) => record.statut === value,
    },
    {
      title: 'Actions',
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
        // TODO: Implémenter l'export
        message.info('Fonctionnalité d\'export en cours de développement');
      }}
    >
      Exporter
    </Button>,
    <Button
      key="add"
      type="primary"
      icon={<PlusOutlined />}
      onClick={handleAdd}
    >
      Nouveau client
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
        title="Clients"
        description="Gestion des clients et de leurs informations"
        breadcrumbs={[
          { title: 'Clients' }
        ]}
        actions={headerActions}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <SearchInput
          placeholder="Rechercher un client..."
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
              `${range[0]}-${range[1]} sur ${total} clients`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange,
          }}
        />
      </Space>

      {/* Modal de détails */}
      <Modal
        title={`Détails du client - ${selectedClient?.nomClient}`}
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedClient(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Fermer
          </Button>
        ]}
        width={600}
      >
        {selectedClient && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div><strong>ID:</strong> {selectedClient.id}</div>
            <div><strong>Nom:</strong> {selectedClient.nomClient}</div>
            <div><strong>Email:</strong> {selectedClient.emailClient || 'Non renseigné'}</div>
            <div><strong>Téléphone:</strong> {selectedClient.telephoneClient || 'Non renseigné'}</div>
            <div><strong>Adresse:</strong> {selectedClient.adresseClient || 'Non renseignée'}</div>
            <div><strong>Statut:</strong> <Tag color={selectedClient.statut === 'Actif' ? 'green' : 'orange'}>{selectedClient.statut || 'Non défini'}</Tag></div>
            <div><strong>Date de création:</strong> {new Date(selectedClient.createdAt).toLocaleDateString('fr-FR')}</div>
          </Space>
        )}
      </Modal>

      {/* Modal d'ajout */}
      <AddClientModal
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSubmit={async (values) => {
          try {
            await clientService.create(values);
            handleAddSuccess();
          } catch (error) {
            addNotification({
              type: 'error',
              message: 'Erreur lors de la création du client'
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
            addNotification({
              type: 'error',
              message: 'Erreur lors de la modification du client'
            });
          }
        }}
      />
    </motion.div>
  );
};

export default ClientsPage;
