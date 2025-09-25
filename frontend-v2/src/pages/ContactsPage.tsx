/*
 * ================================================================================================
 * PAGE CONTACTS - STARTINGBLOCH
 * ================================================================================================
 * 
 * Page de gestion des contacts avec liste, ajout, modification et suppression.
 * 
 * ================================================================================================
 */

import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
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
import { useTranslation } from 'react-i18next';

const ContactsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
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
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  // Récupérer les paramètres d'URL
  const clientId = searchParams.get('clientId');
  const clientName = searchParams.get('clientName');
  const cabinetId = searchParams.get('cabinetId');
  const cabinetName = searchParams.get('cabinetName');

  // Déterminer le titre et le contexte
  const getPageTitle = () => {
    if (clientId && clientName) {
      return `${t('menu.contacts')} - ${decodeURIComponent(clientName)}`;
    }
    if (cabinetId && cabinetName) {
      return `${t('menu.contacts')} - ${decodeURIComponent(cabinetName)}`;
    }
    return t('menu.contacts') ?? '';
  };

  const getPageDescription = () => {
    if (clientId) {
      return t('contacts.description.forClient', { name: decodeURIComponent(clientName ?? 'sélectionné') });
    }
    if (cabinetId) {
      return t('contacts.description.forCabinet', { name: decodeURIComponent(cabinetName ?? 'sélectionné') });
    }
    return t('contacts.description.all');
  };

  // Helper functions for handling union types
  const getEmailValue = (email: string | ContactEmail): string => {
    return typeof email === 'string' ? email : (email.email ?? '');
  };

  const getEmailType = (email: string | ContactEmail): string => {
    return typeof email === 'string' ? 'email' : (email.type ?? 'email');
  };

  const getPhoneValue = (phone: string | ContactPhone): string => {
    return typeof phone === 'string' ? phone : (phone.numero ?? '');
  };

  const getPhoneType = (phone: string | ContactPhone): string => {
    return typeof phone === 'string' ? 'telephone' : (phone.type ?? 'telephone');
  };

  const getRoleValue = (role: string | ContactRole): string => {
    return typeof role === 'string' ? role : (role.role ?? '');
  };

  // Use react-query to load contacts (role/client/cabinet-aware)
  const { isLoading: queryLoading } = useQuery(
    ['contacts', clientId, cabinetId, currentPage, pageSize],
    async () => {
      if (clientId) {
        return await contactService.getByClient(parseInt(clientId), currentPage, pageSize);
      }
      if (cabinetId) {
        return await contactService.getByCabinet(parseInt(cabinetId), currentPage, pageSize);
      }
      return await contactService.getAll(currentPage, pageSize);
    },
    {
      keepPreviousData: true,
      onSuccess: (response: any) => {
        if (response?.success && response?.data) {
          setContacts(response.data);
          setTotalCount(response.totalCount || 0);
          const newPage = response.page ?? currentPage;
          setCurrentPage(newPage);
        } else {
          setContacts([]);
          setTotalCount(0);
        }
      },
      onError: (error: any) => {
        console.error('Erreur lors du chargement des contacts:', error);
        addNotification({
          type: 'error',
          message: t('notifications.error'),
          description: t('contacts.loadError')
        });
        setContacts([]);
        setTotalCount(0);
      }
    }
  );

  const isAnyLoading = queryLoading || searchLoading || mutating;

  // Gestionnaire de changement de pagination
  const handleTableChange = (page: number, size?: number) => {
  const newPageSize = size ?? pageSize;
    setCurrentPage(page);
    setPageSize(newPageSize);
    // query will refetch automatically because the query key includes currentPage/pageSize
  };

  // Recherche
  const handleSearch = async (value: string) => {
  const query = value?.trim() ?? '';
    if (query) {
      const normalized = query.toLowerCase();
      setSearchLoading(true);
      try {
        const response = await contactService.search(normalized);
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
            message: t('notifications.error'),
            description: t('contacts.searchError')
          });
        } finally {
          setSearchLoading(false);
        }
    } else {
      // Retourner à la pagination normale si recherche vide
      setCurrentPage(1);
      // query will refetch automatically
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
  setMutating(true);
    try {
      // Ajouter le clientId ou cabinetId selon le contexte
      const enrichedContactData = {
        ...contactData,
        ...(clientId && { idClient: parseInt(clientId) }),
        ...(cabinetId && { idCabinet: parseInt(cabinetId) })
      };
      
      await contactService.create(enrichedContactData);
      setAddModalVisible(false);
      await queryClient.invalidateQueries({ queryKey: ['contacts'] });
      addNotification({
        type: 'success',
        message: t('notifications.success'),
        description: t('contacts.createSuccess')
      });
    } catch (error) {
      console.error('Erreur création contact:', error);
      addNotification({
        type: 'error',
        message: t('notifications.error'),
        description: t('contacts.createError')
      });
    } finally {
      setMutating(false);
    }
  };

  const handleContactUpdated = async (contactData: any) => {
  setMutating(true);
    try {
      if (contactToEdit) {
        await contactService.update(contactToEdit.id, contactData);
        setEditModalVisible(false);
        setContactToEdit(null);
        await queryClient.invalidateQueries({ queryKey: ['contacts'] });
        addNotification({
          type: 'success',
          message: t('notifications.success'),
          description: t('contacts.updateSuccess')
        });
      }
    } catch (error) {
      console.error('Erreur mise à jour contact:', error);
      addNotification({
        type: 'error',
        message: t('notifications.error'),
        description: t('contacts.updateError')
      });
    } finally {
      setMutating(false);
    }
  };

  // Supprimer un contact
  const handleDelete = async (contact: Contact) => {
      Modal.confirm({
        title: t('contacts.confirmDelete.title'),
        content: t('contacts.confirmDelete.content', { name: `${contact.prenom} ${contact.nom}` }),
        okText: t('actions.delete'),
        okType: 'danger',
        cancelText: t('actions.cancel'),
          onOk: async () => {
        try {
          await contactService.delete(contact.id);
          addNotification({
            type: 'success',
              message: t('contacts.deleteSuccessTitle'),
              description: t('contacts.deleteSuccessDesc', { name: `${contact.prenom} ${contact.nom}` })
          });
          await queryClient.invalidateQueries({ queryKey: ['contacts'] });
        } catch (error) {
          console.error('Erreur suppression contact:', error);
          addNotification({
            type: 'error',
              message: t('notifications.error'),
              description: t('contacts.deleteError')
          });
        }
      }
    });
  };

  // Actions par ligne
  const getRowActions = (record: Contact): MenuProps['items'] => [
    {
      key: 'view',
      label: t('actions.viewDetails'),
      icon: <EyeOutlined />,
      onClick: () => {
        setSelectedContact(record);
        setIsModalVisible(true);
      }
    },
    {
      key: 'edit',
      label: t('actions.edit'),
      icon: <EditOutlined />,
      onClick: () => handleEditContact(record)
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      label: t('actions.delete'),
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record)
    }
  ];

  // Colonnes de la table
  const columns: ColumnsType<Contact> = [
    {
  title: t('contacts.columns.contact'),
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
  title: t('contacts.columns.company'),
      dataIndex: 'societe',
      key: 'societe',
      render: (societe: string) => societe || t('common.notProvided'),
    },
    {
  title: t('contacts.columns.primaryEmail'),
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
        ) : t('common.notProvided');
      },
    },
    {
  title: t('contacts.columns.primaryPhone'),
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
        ) : t('common.notProvided');
      },
    },
    {
  title: t('contacts.columns.roles'),
      key: 'roles',
      render: (_, record) => (
        <Space wrap>
          {record.roles?.map((role, index) => (
            <Tag key={index} color="blue">{getRoleValue(role)}</Tag>
          )) || t('common.notProvided')}
        </Space>
      ),
    },
    {
  title: t('actions.title'),
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
        message.info(t('common.exportInProgress'));
      }}
    >
      {t('actions.export')}
    </Button>,
    <Button
      key="add"
      type="primary"
      icon={<PlusOutlined />}
      onClick={handleAddContact}
    >
  {t('contacts.actions.new')}
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
        breadcrumbs={
          clientId && clientName ? [
            { title: t('menu.clients'), href: '/clients' },
            { title: decodeURIComponent(clientName) },
            { title: t('menu.contacts') }
          ] : cabinetId && cabinetName ? [
            { title: t('menu.cabinets'), href: '/cabinets' },
            { title: decodeURIComponent(cabinetName) },
            { title: t('menu.contacts') }
          ] : [
            { title: t('menu.contacts') }
          ]
        }
        actions={headerActions}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <SearchInput
  placeholder={t('contacts.searchPlaceholder')}
          onSearch={handleSearch}
          style={{ maxWidth: 400 }}
        />

        <DataTable
          columns={columns}
          data={contacts}
          loading={isAnyLoading}
          rowKey="id"
          pagination={
            // Désactiver la pagination quand on filtre par client/cabinet
            clientId || cabinetId ? false : {
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showQuickJumper: true,
                showTotal: (total, range) => 
                t('contacts.pagination.showTotal', { from: range[0], to: range[1], total }),
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handleTableChange,
              onShowSizeChange: handleTableChange,
            }
          }
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
            {t('actions.close')}
          </Button>
        ]}
        width={700}
      >
        {selectedContact && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
                  <h4>{t('contacts.sections.generalInfo')}</h4>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div><strong>{t('contacts.labels.firstName')}:</strong> {selectedContact.prenom}</div>
                    <div><strong>{t('contacts.labels.lastName')}:</strong> {selectedContact.nom}</div>
                    <div><strong>{t('contacts.labels.position')}:</strong> {selectedContact.fonction || t('common.notProvided')}</div>
                    <div><strong>{t('contacts.labels.company')}:</strong> {selectedContact.societe || t('common.notProvided')}</div>
                    <div><strong>{t('contacts.labels.createdAt')}:</strong> {new Date(selectedContact.createdAt).toLocaleDateString(i18n?.language || 'fr-FR')}</div>
              </Space>
            </div>

            {selectedContact.emails && selectedContact.emails.length > 0 && (
              <div>
                <h4>{t('contacts.sections.emails')}</h4>
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
                <h4>{t('contacts.sections.phones')}</h4>
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
                <h4>{t('contacts.sections.roles')}</h4>
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
        loading={mutating}
        prefilledClientId={clientId ? parseInt(clientId) : undefined}
        prefilledCabinetId={cabinetId ? parseInt(cabinetId) : undefined}
      />

      <EditContactModal
        visible={editModalVisible}
        contact={contactToEdit}
        onCancel={() => {
          setEditModalVisible(false);
          setContactToEdit(null);
        }}
        onSubmit={handleContactUpdated}
        loading={mutating}
      />
    </motion.div>
  );
};

export default ContactsPage;
