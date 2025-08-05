/*
 * ================================================================================================
 * PAGE CONTACTS - STARTINGBLOCH
 * ================================================================================================
 * 
 * Page de gestion des contacts avec liste, ajout, modification et suppression.
 * 
 * ================================================================================================
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Button, 
  Space, 
  message, 
  Modal, 
  Tag,
  Dropdown,
  MenuProps,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  ExportOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { motion } from 'framer-motion';

// Components
import { PageHeader, DataTable, SearchInput } from '../components/common';
import { AddContactModal, EditContactModal } from '../components/modals';

// Services
import { contactService } from '../services';

// Types
import type { Contact, ContactEmail, ContactPhone, ContactRole } from '../types';

// Hooks
import { useNotificationStore } from '../store/notificationStore';

const ContactsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // États pour les modales d'ajout et modification
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  const { addNotification } = useNotificationStore();

  // Récupérer les paramètres d'URL
  const clientId = searchParams.get('clientId');
  const clientName = searchParams.get('clientName');
  const cabinetId = searchParams.get('cabinetId');
  const cabinetName = searchParams.get('cabinetName');

  // Déterminer le titre et le contexte
  const getPageTitle = () => {
    if (clientId && clientName) {
      return `Contacts - ${decodeURIComponent(clientName)}`;
    }
    if (cabinetId && cabinetName) {
      return `Contacts - ${decodeURIComponent(cabinetName)}`;
    }
    return 'Contacts';
  };

  const getPageDescription = () => {
    if (clientId) {
      return `Gérez les contacts associés au client ${decodeURIComponent(clientName || 'sélectionné')}`;
    }
    if (cabinetId) {
      return `Gérez les contacts associés au cabinet ${decodeURIComponent(cabinetName || 'sélectionné')}`;
    }
    return 'Gérez tous les contacts de votre organisation';
  };

  // Helper functions for handling union types
  const getEmailValue = (email: string | ContactEmail): string => {
    return typeof email === 'string' ? email : email.email || '';
  };

  const getEmailType = (email: string | ContactEmail): string => {
    return typeof email === 'string' ? 'email' : email.type || 'email';
  };

  const getPhoneValue = (phone: string | ContactPhone): string => {
    return typeof phone === 'string' ? phone : phone.numero || '';
  };

  const getPhoneType = (phone: string | ContactPhone): string => {
    return typeof phone === 'string' ? 'telephone' : phone.type || 'telephone';
  };

  const getRoleValue = (role: string | ContactRole): string => {
    return typeof role === 'string' ? role : role.role || '';
  };

  // Charger les contacts avec pagination et filtrage
  const loadContacts = async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true);
    try {
      const response = await contactService.getAll(page, size);
      if (response.success && response.data) {
        let filteredContacts = response.data;
        
        // Filtrer selon le client ou cabinet si spécifié dans l'URL
        if (clientId) {
          filteredContacts = response.data.filter(contact => 
            contact.idClient?.toString() === clientId
          );
        } else if (cabinetId) {
          filteredContacts = response.data.filter(contact => 
            contact.idCabinet?.toString() === cabinetId
          );
        }
        
        setContacts(filteredContacts);
        setTotalCount(filteredContacts.length);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
      addNotification({
        type: 'error',
        message: 'Erreur',
        description: 'Impossible de charger la liste des contacts'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // Gestionnaire de changement de pagination
  const handleTableChange = (page: number, size?: number) => {
    const newPageSize = size || pageSize;
    setCurrentPage(page);
    setPageSize(newPageSize);
    loadContacts(page, newPageSize);
  };

  // Recherche
  const handleSearch = async (value: string) => {
    if (value.trim()) {
      setLoading(true);
      try {
        const response = await contactService.search(value);
        if (response.success && response.data) {
          setContacts(response.data);
          // Réinitialiser la pagination pour la recherche
          setCurrentPage(1);
          setTotalCount(response.data.length);
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
      loadContacts(1, pageSize);
    }
  };

  // Gestionnaires pour les modales
  const handleAddContact = () => {
    setAddModalVisible(true);
  };

  const handleEditContact = (contact: Contact) => {
    setContactToEdit(contact);
    setEditModalVisible(true);
  };

  const handleContactCreated = async (contactData: any) => {
    try {
      // Ajouter le clientId ou cabinetId selon le contexte
      const enrichedContactData = {
        ...contactData,
        ...(clientId && { idClient: parseInt(clientId) }),
        ...(cabinetId && { idCabinet: parseInt(cabinetId) })
      };
      
      await contactService.create(enrichedContactData);
      setAddModalVisible(false);
      await loadContacts();
      addNotification({
        type: 'success',
        message: 'Succès',
        description: 'Contact créé avec succès'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur',
        description: 'Impossible de créer le contact'
      });
    }
  };

  const handleContactUpdated = async (contactData: any) => {
    try {
      if (contactToEdit) {
        await contactService.update(contactToEdit.id, contactData);
        setEditModalVisible(false);
        setContactToEdit(null);
        await loadContacts();
        addNotification({
          type: 'success',
          message: 'Succès',
          description: 'Contact modifié avec succès'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur',
        description: 'Impossible de modifier le contact'
      });
    }
  };

  // Supprimer un contact
  const handleDelete = async (contact: Contact) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: `Êtes-vous sûr de vouloir supprimer le contact "${contact.prenom} ${contact.nom}" ?`,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await contactService.delete(contact.id);
          addNotification({
            type: 'success',
            message: 'Contact supprimé',
            description: `Le contact ${contact.prenom} ${contact.nom} a été supprimé avec succès`
          });
          loadContacts();
        } catch (error) {
          addNotification({
            type: 'error',
            message: 'Erreur',
            description: 'Impossible de supprimer le contact'
          });
        }
      }
    });
  };

  // Actions par ligne
  const getRowActions = (record: Contact): MenuProps['items'] => [
    {
      key: 'view',
      label: 'Voir les détails',
      icon: <EyeOutlined />,
      onClick: () => {
        setSelectedContact(record);
        setIsModalVisible(true);
      }
    },
    {
      key: 'edit',
      label: 'Modifier',
      icon: <EditOutlined />,
      onClick: () => handleEditContact(record)
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      label: 'Supprimer',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record)
    }
  ];

  // Colonnes de la table
  const columns: ColumnsType<Contact> = [
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>
              {`${record.prenom} ${record.nom}`}
            </div>
            {record.fonction && (
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                {record.fonction}
              </div>
            )}
          </div>
        </Space>
      ),
      sorter: (a, b) => `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`),
    },
    {
      title: 'Société',
      dataIndex: 'societe',
      key: 'societe',
      render: (societe: string) => societe || '-',
    },
    {
      title: 'Email principal',
      key: 'email',
      render: (_, record) => {
        const primaryEmail = record.emails?.find(e => 
          typeof e === 'object' && e.type === 'principal'
        ) || record.emails?.[0];
        return primaryEmail ? (
          <Space>
            <MailOutlined style={{ color: '#1890ff' }} />
            <a href={`mailto:${getEmailValue(primaryEmail)}`}>{getEmailValue(primaryEmail)}</a>
          </Space>
        ) : '-';
      },
    },
    {
      title: 'Téléphone principal',
      key: 'phone',
      render: (_, record) => {
        const primaryPhone = record.phones?.find(p => 
          typeof p === 'object' && p.type === 'principal'
        ) || record.phones?.[0];
        return primaryPhone ? (
          <Space>
            <PhoneOutlined style={{ color: '#52c41a' }} />
            <span>{getPhoneValue(primaryPhone)}</span>
          </Space>
        ) : '-';
      },
    },
    {
      title: 'Rôles',
      key: 'roles',
      render: (_, record) => (
        <Space wrap>
          {record.roles?.map((role, index) => (
            <Tag key={index} color="blue">{getRoleValue(role)}</Tag>
          )) || '-'}
        </Space>
      ),
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
        message.info('Fonctionnalité d\'export en cours de développement');
      }}
    >
      Exporter
    </Button>,
    <Button
      key="add"
      type="primary"
      icon={<PlusOutlined />}
      onClick={handleAddContact}
    >
      Nouveau contact
    </Button>
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title={getPageTitle()}
        description={getPageDescription()}
        breadcrumbs={[
          { title: 'Contacts' }
        ]}
        actions={headerActions}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <SearchInput
          placeholder="Rechercher un contact..."
          onSearch={handleSearch}
          style={{ maxWidth: 400 }}
        />

        <DataTable
          columns={columns}
          data={contacts}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} sur ${total} contacts`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange,
          }}
        />
      </Space>

      {/* Modal de détails */}
      <Modal
        title={
          <Space>
            <Avatar icon={<UserOutlined />} />
            {`${selectedContact?.prenom} ${selectedContact?.nom}`}
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedContact(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Fermer
          </Button>
        ]}
        width={700}
      >
        {selectedContact && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <h4>Informations générales</h4>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div><strong>Prénom:</strong> {selectedContact.prenom}</div>
                <div><strong>Nom:</strong> {selectedContact.nom}</div>
                <div><strong>Fonction:</strong> {selectedContact.fonction || 'Non renseignée'}</div>
                <div><strong>Société:</strong> {selectedContact.societe || 'Non renseignée'}</div>
                <div><strong>Date de création:</strong> {new Date(selectedContact.createdAt).toLocaleDateString('fr-FR')}</div>
              </Space>
            </div>

            {selectedContact.emails && selectedContact.emails.length > 0 && (
              <div>
                <h4>Emails</h4>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {selectedContact.emails.map((email, index) => (
                    <div key={index}>
                      <Tag color="blue">{getEmailType(email)}</Tag>
                      <a href={`mailto:${getEmailValue(email)}`}>{getEmailValue(email)}</a>
                    </div>
                  ))}
                </Space>
              </div>
            )}

            {selectedContact.phones && selectedContact.phones.length > 0 && (
              <div>
                <h4>Téléphones</h4>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {selectedContact.phones.map((phone, index) => (
                    <div key={index}>
                      <Tag color="green">{getPhoneType(phone)}</Tag>
                      <span>{getPhoneValue(phone)}</span>
                    </div>
                  ))}
                </Space>
              </div>
            )}

            {selectedContact.roles && selectedContact.roles.length > 0 && (
              <div>
                <h4>Rôles</h4>
                <Space wrap>
                  {selectedContact.roles.map((role, index) => (
                    <Tag key={index} color="purple">{getRoleValue(role)}</Tag>
                  ))}
                </Space>
              </div>
            )}
          </Space>
        )}
      </Modal>

      {/* Modales de gestion */}
      <AddContactModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSubmit={handleContactCreated}
        loading={loading}
      />

      <EditContactModal
        visible={editModalVisible}
        contact={contactToEdit}
        onCancel={() => {
          setEditModalVisible(false);
          setContactToEdit(null);
        }}
        onSubmit={handleContactUpdated}
        loading={loading}
      />
    </motion.div>
  );
};

export default ContactsPage;
