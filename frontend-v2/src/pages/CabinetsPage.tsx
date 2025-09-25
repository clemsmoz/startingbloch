import { useTranslation } from 'react-i18next';
/*
 * ================================================================================================
 * PAGE CABINETS - STARTINGBLOCH
 * ================================================================================================
 * 
 * Page de gestion des cabinets avec liste, ajout, modification et suppression.
 * 
 * ================================================================================================
 */

import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
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
import { AddCabinetModal, EditCabinetModal } from '../components/modals';

// Services
import { cabinetService } from '../services';

// Types
import type { Cabinet, CreateCabinetDto, UpdateCabinetDto } from '../types';

// Hooks
import { useNotificationStore } from '../store/notificationStore';

const CabinetsPage: React.FC = () => {
  const { t } = useTranslation();
  console.log('🏢 CabinetsPage - Rendu du composant...');
  
  const navigate = useNavigate();
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);

  // Fonction pour transformer le type numérique en texte
  const getTypeLabel = (type: any): string => {
  if (type === 1 || type === '1') return t('cabinets.type.annuite');
  if (type === 2 || type === '2') return t('cabinets.type.procedure');
  return t('common.na');
  };

  // Fonction pour obtenir la couleur du type
  const getTypeColor = (type: any): string => {
     if (type === 1 || type === '1') return 'blue';
     if (type === 2 || type === '2') return 'green';
     return 'default';
  };
  
  const [searchValue, setSearchValue] = useState('');
  const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const { addNotification } = useNotificationStore();
  const queryClient = useQueryClient();

  // detect role once per render (used by query key)
  const storedUser = sessionStorage.getItem('startingbloch_user');
  const role = storedUser ? (JSON.parse(storedUser).role || '').toLowerCase() : '';

  // Colonnes du tableau
  const columns: ColumnsType<Cabinet> = [
    {
      title: t('cabinets.columns.name'),
      dataIndex: 'nomCabinet',
      key: 'nomCabinet',
      sorter: (a, b) => a.nomCabinet.localeCompare(b.nomCabinet),
      render: (nom: string) => (
        <span className="font-medium text-gray-900">{nom}</span>
      ),
    },
    {
      title: t('cabinets.columns.type'),
      dataIndex: 'type',
      key: 'type',
      sorter: (a, b) => (a.type || '').toString().localeCompare((b.type || '').toString()),
      render: (type: any) => {
        const typeLabel = getTypeLabel(type);
        const typeColor = getTypeColor(type);
        return (
          <Tag color={typeColor}>
            {typeLabel}
          </Tag>
        );
      },
    },
    {
      title: t('cabinets.columns.email'),
      dataIndex: 'emailCabinet',
      key: 'emailCabinet',
      render: (email?: string) => email || t('common.notProvided'),
    },
    {
      title: t('cabinets.columns.phone'),
      dataIndex: 'telephoneCabinet',
      key: 'telephoneCabinet',
      render: (phone?: string) => phone || t('common.notProvided'),
    },
    {
      title: t('cabinets.columns.reference'),
      dataIndex: 'referenceCabinet',
      key: 'referenceCabinet',
      render: (ref?: string) => ref || t('common.notProvided'),
    },
    {
      title: t('actions.title'),
      key: 'actions',
      width: 120,
      render: (_, record) => {
        const userRole = (useNotificationStore.getState() as any)?.user?.role || (JSON.parse(sessionStorage.getItem('startingbloch_user') || 'null')?.role);
        const isClient = String(userRole || '').toLowerCase() === 'client';
        const menuItems: MenuProps['items'] = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: t('actions.viewDetails'),
            onClick: () => handleViewCabinet(record),
          },
          {
            key: 'contacts',
            icon: <ContactsOutlined />,
            label: t('cabinets.actions.viewContacts'),
            onClick: () => handleViewContacts(record),
          },
          // Pour les clients, pas de modification/suppression
          ...(!isClient ? [
            {
              key: 'edit',
                icon: <EditOutlined />,
                label: t('actions.edit'),
              onClick: () => handleEditCabinet(record),
            },
            { type: 'divider' as const },
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              label: t('actions.delete'),
              danger: true,
              onClick: () => handleDeleteCabinet(record),
            },
          ] : []),
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button
              type="text"
              icon={<MoreOutlined />}
              className="flex items-center justify-center"
            />
          </Dropdown>
        );
      },
    },
  ];

  // Use react-query to load cabinets (role-aware)
  const { isLoading: queryLoading } = useQuery(
    ['cabinets', role, currentPage, pageSize],
    async () => {
      if (role === 'client') {
        const r = await cabinetService.getMine();
        return { ...r, page: 1, pageSize: r.data?.length ?? 0, totalCount: r.data?.length ?? 0 } as any;
      }
      return await cabinetService.getAll(currentPage, pageSize);
    },
    {
      onSuccess: (response: any) => {
        const data = response?.data || response?.Data;
        const success = response?.success || response?.Success;
        if (success && data) {
          if (Array.isArray(data)) {
            setCabinets(data as Cabinet[]);
            const isClient = role === 'client';
            setTotalCount(isClient ? data.length : (response.totalCount || 0));
            setCurrentPage(isClient ? 1 : (response.page || currentPage));
          } else if (data?.data && Array.isArray(data.data)) {
            setCabinets(data.data);
            setTotalCount(response.totalCount || 0);
            setCurrentPage(response.page || currentPage);
          } else if (data?.items && Array.isArray(data.items)) {
            setCabinets(data.items);
            setTotalCount(response.totalCount || 0);
            setCurrentPage(response.page || currentPage);
          } else {
            setCabinets([]);
            setTotalCount(0);
          }
        } else {
          message.error(response?.message || t('cabinets.loadError'));
        }
      },
      onError: (error: any) => {
        console.error('❌ CabinetsPage - Erreur lors du chargement des cabinets:', error);
        message.error(t('cabinets.loadError'));
      },
    }
  );

  // Gestionnaire de changement de pagination
  const handleTableChange = (page: number, size?: number) => {
    const newPageSize = size || pageSize;
    setCurrentPage(page);
    setPageSize(newPageSize);
    // query will refetch because queryKey depends on currentPage/pageSize
  };

  // Recherche côté client en attendant l'implémentation côté serveur
  const handleSearch = async (value: string) => {
    const query = value?.trim() || '';
    setSearchValue(query);
    // Normaliser côté client pour la sensibilité à la casse
    if (!query) {
      // reset to first page; the query will refetch because the key depends on currentPage/pageSize
      setCurrentPage(1);
    }
  };

  // Supprimé le filtrage côté client - la recherche est gérée côté serveur
  // Filtrage temporaire côté client
  const normalize = (s?: string) => (s || '').toLowerCase();
  const filteredCabinets = Array.isArray(cabinets) ? cabinets.filter(cabinet =>
    searchValue === '' ||
    normalize(cabinet.nomCabinet).includes(normalize(searchValue)) ||
    normalize(getTypeLabel(cabinet.type)).includes(normalize(searchValue)) ||
    normalize(cabinet.emailCabinet).includes(normalize(searchValue)) ||
    normalize(cabinet.adresseCabinet).includes(normalize(searchValue)) ||
    normalize(cabinet.paysCabinet).includes(normalize(searchValue))
  ) : [];

  // Actions
  const handleAddCabinet = () => {
    setIsAddModalVisible(true);
  };

  const handleViewCabinet = (cabinet: Cabinet) => {
    setSelectedCabinet(cabinet);
    setIsDetailModalVisible(true);
  };

  const handleEditCabinet = (cabinet: Cabinet) => {
    setSelectedCabinet(cabinet);
    setIsEditModalVisible(true);
  };

  const handleDeleteCabinet = (cabinet: Cabinet) => {
    setSelectedCabinet(cabinet);
    setIsDeleteModalVisible(true);
  };

  const handleViewContacts = (cabinet: Cabinet) => {
    // Naviguer vers la page des contacts avec l'ID du cabinet
    navigate(`/contacts?cabinetId=${cabinet.id}&cabinetName=${encodeURIComponent(cabinet.nomCabinet)}`);
  };

  const handleCreateCabinet = async (values: CreateCabinetDto) => {
    try {
      const storedUser = sessionStorage.getItem('startingbloch_user');
      const role = storedUser ? (JSON.parse(storedUser).role || '').toLowerCase() : '';
      const response = role === 'client'
        ? await cabinetService.createForMe(values)
        : await cabinetService.create(values);
    if (response.success) {
  message.success(t('cabinets.createSuccess'));
        setIsAddModalVisible(false);
        await queryClient.invalidateQueries({ queryKey: ['cabinets'] });
        
        addNotification({
          type: 'success',
          message: t('cabinets.createSuccessTitle'),
          description: t('cabinets.createSuccessDesc', { name: values.nomCabinet })
        });
      } else {
  message.error(response.message || t('cabinets.createError'));
      }
    } catch (error) {
      console.error('Erreur lors de la création du cabinet:', error);
  message.error(t('cabinets.createError'));
    }
  };

  const handleUpdateCabinet = async (values: UpdateCabinetDto) => {
    try {
      const response = await cabinetService.update(values);
    if (response.success) {
  message.success(t('cabinets.updateSuccess'));
        setIsEditModalVisible(false);
        setSelectedCabinet(null);
        await queryClient.invalidateQueries({ queryKey: ['cabinets'] });
        
        addNotification({
          type: 'success',
          message: t('cabinets.updateSuccessTitle'),
          description: t('cabinets.updateSuccessDesc')
        });
      } else {
    message.error(response.message || t('cabinets.updateError'));
      }
    } catch (error) {
      console.error('Erreur lors de la modification du cabinet:', error);
  message.error(t('cabinets.updateError'));
    }
  };

  const confirmDeleteCabinet = async () => {
    if (!selectedCabinet) return;

    try {
      const response = await cabinetService.delete(selectedCabinet.id);
    if (response.success) {
  message.success(t('cabinets.deleteSuccess'));
        setIsDeleteModalVisible(false);
        setSelectedCabinet(null);
        await queryClient.invalidateQueries({ queryKey: ['cabinets'] });
        
        addNotification({
          type: 'success',
          message: t('cabinets.deleteSuccessTitle'),
          description: t('cabinets.deleteSuccessDesc', { name: selectedCabinet.nomCabinet })
        });
      } else {
  message.error(response.message || t('cabinets.deleteError'));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du cabinet:', error);
  message.error(t('cabinets.deleteError'));
    }
  };

  // Actions du header
  const headerActions = [
    <SearchInput
  key="search"
  placeholder={t('cabinets.searchPlaceholder')}
      onSearch={handleSearch}
      style={{ width: '320px' }}
    />,
    <Button
      key="export"
      icon={<ExportOutlined />}
      onClick={() => message.info(t('common.exportInProgress'))}
    >
      {t('actions.export')}
    </Button>,
    // Bouton ajout désactivé pour clients si aucune création côté client ? Ici on autorise via endpoint /my
    <Button
      key="add"
      type="primary"
      icon={<PlusOutlined />}
      onClick={handleAddCabinet}
    >
      {t('cabinets.actions.new')}
    </Button>,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title={t('menu.cabinets')}
    description={t('cabinets.pageDescription')}
        actions={headerActions}
      />

      <DataTable
        columns={columns}
        data={searchValue ? filteredCabinets : cabinets}
        loading={queryLoading}
        rowKey="id"
        scroll={{ x: 1000 }}
  pagination={(searchValue ? false : ((JSON.parse(sessionStorage.getItem('startingbloch_user') || 'null')?.role || '').toLowerCase() === 'client' ? false : {
          current: currentPage,
          pageSize: pageSize,
          total: totalCount,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            t('cabinets.pagination.showTotal', { from: range[0], to: range[1], total }),
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: handleTableChange,
          onShowSizeChange: handleTableChange,
  }))}
      />

      {/* Modal d'ajout */}
      <AddCabinetModal
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSubmit={handleCreateCabinet}
      />

      {/* Modal d'édition */}
      <EditCabinetModal
        visible={isEditModalVisible}
        cabinet={selectedCabinet}
        onCancel={() => {
          setIsEditModalVisible(false);
          setSelectedCabinet(null);
        }}
        onSubmit={handleUpdateCabinet}
      />

      {/* Modal de suppression */}
      <Modal
  title={t('cabinets.confirmDelete.title')}
        open={isDeleteModalVisible}
        onOk={confirmDeleteCabinet}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setSelectedCabinet(null);
        }}
  okText={t('actions.delete')}
  cancelText={t('actions.cancel')}
        okButtonProps={{ danger: true }}
      >
            <p>
          {t('cabinets.confirmDelete.content', { name: selectedCabinet?.nomCabinet })}
        </p>
        <p className="text-red-600 text-sm mt-2">
          {t('cabinets.confirmDelete.warning')}
        </p>
      </Modal>

      {/* Modal de détails */}
      <Modal
  title={t('cabinets.detailTitle')}
        open={isDetailModalVisible}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            {t('actions.close')}
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setIsDetailModalVisible(false);
              handleEditCabinet(selectedCabinet!);
            }}
          >
            {t('actions.edit')}
          </Button>,
        ]}
        onCancel={() => setIsDetailModalVisible(false)}
        width={600}
      >
        {selectedCabinet && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('cabinets.labels.name')}</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCabinet.nomCabinet}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">{t('cabinets.labels.type')}</label>
              <Tag color={getTypeColor(selectedCabinet.type)}>
                {getTypeLabel(selectedCabinet.type)}
              </Tag>
            </div>
            {selectedCabinet.adresseCabinet && (
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('cabinets.labels.address')}</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCabinet.adresseCabinet}</p>
              </div>
            )}
            {selectedCabinet.paysCabinet && (
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('cabinets.labels.country')}</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCabinet.paysCabinet}</p>
              </div>
            )}
            {selectedCabinet.emailCabinet && (
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('cabinets.labels.email')}</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCabinet.emailCabinet}</p>
              </div>
            )}
            {selectedCabinet.telephoneCabinet && (
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('cabinets.labels.phone')}</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCabinet.telephoneCabinet}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default CabinetsPage;
