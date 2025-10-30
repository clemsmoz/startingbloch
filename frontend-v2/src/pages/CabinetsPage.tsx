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

import React, { useState, useEffect } from 'react';
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
import { cabinetService, authService } from '../services';

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
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
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

  // Charger les cabinets
  useEffect(() => {
    loadCabinets();
  }, []);

  const loadCabinets = async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true);
    try {
      // Vérifier l'utilisateur connecté et ses rôles
      try {
        const currentUser = await authService.getCurrentUser();
        console.log('👤 CabinetsPage - Utilisateur connecté:', currentUser);
        console.log('🔑 CabinetsPage - Rôle utilisateur:', currentUser.role);
      } catch (userError) {
        console.error('❌ CabinetsPage - Erreur récupération utilisateur:', userError);
      }
      
      // Si l'utilisateur est un client, appeler l'endpoint dédié
      const storedUser = sessionStorage.getItem('startingbloch_user');
      const role = storedUser ? (JSON.parse(storedUser).role || '').toLowerCase() : '';
      console.log(`🏢 CabinetsPage - Début du chargement des cabinets (page ${page}, taille ${size})... Rôle=${role}`);
      const response = role === 'client'
        ? await (async () => {
            const r = await cabinetService.getMine();
            // Adapter en PagedApiResponse minimal pour le code existant
            return { ...r, page: 1, pageSize: r.data?.length ?? 0, totalCount: r.data?.length ?? 0 } as any;
          })()
        : await cabinetService.getAll(page, size);
      console.log('🏢 CabinetsPage - Réponse reçue:', response);
      
      // Le backend retourne un PagedResponse avec des propriétés en PascalCase
      const success = response.success || (response as any).Success;
      const data = response.data || (response as any).Data;
      
  if (success) {
        console.log('📊 CabinetsPage - Type de données reçues:', typeof data);
        console.log('📊 CabinetsPage - Est-ce un tableau?', Array.isArray(data));
        console.log('📊 CabinetsPage - Données brutes:', data);
        
        // S'assurer que nous avons un tableau
        if (Array.isArray(data)) {
          console.log('🔍 Premier cabinet pour debug:', data[0]);
          setCabinets(data);
          // Pour un client, pas de pagination serveur
          const storedRole = (JSON.parse(sessionStorage.getItem('startingbloch_user') || 'null')?.role || '').toLowerCase();
          const isClient = storedRole === 'client';
          setTotalCount(isClient ? data.length : (response.totalCount || 0));
          setCurrentPage(isClient ? 1 : (response.page || page));
          console.log('✅ CabinetsPage - Cabinets chargés directement:', data.length);
        } else if (data && (data as any).data && Array.isArray((data as any).data)) {
          setCabinets((data as any).data);
          setTotalCount(response.totalCount || 0);
          setCurrentPage(response.page || page);
          console.log('✅ CabinetsPage - Cabinets trouvés dans data.data:', (data as any).data.length);
        } else if (data && (data as any).items && Array.isArray((data as any).items)) {
          setCabinets((data as any).items);
          setTotalCount(response.totalCount || 0);
          setCurrentPage(response.page || page);
          console.log('✅ CabinetsPage - Cabinets trouvés dans data.items:', (data as any).items.length);
        } else {
          console.warn('⚠️ CabinetsPage - Format de données inattendu, utilisation d\'un tableau vide');
          console.log('🔍 CabinetsPage - Propriétés disponibles:', Object.keys(data || {}));
          setCabinets([]);
          setTotalCount(0);
        }
        
        console.log('✅ CabinetsPage - Cabinets chargés:', Array.isArray(data) ? data.length : 'Format non-tableau');
  } else {
    console.error('❌ CabinetsPage - Réponse sans succès:', response.message);
    message.error(response.message || t('cabinets.loadError'));
      }
    } catch (error) {
      console.error('❌ CabinetsPage - Erreur lors du chargement des cabinets:', error);
      if (error instanceof Error) {
        console.error('Message:', error.message);
      }
      if ((error as any).response) {
        console.error('Status:', (error as any).response?.status);
        console.error('Data:', (error as any).response?.data);
      }
      message.error(t('cabinets.loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaire de changement de pagination
  const handleTableChange = (page: number, size?: number) => {
    const newPageSize = size || pageSize;
    setCurrentPage(page);
    setPageSize(newPageSize);
    loadCabinets(page, newPageSize);
  };

  // Recherche côté client en attendant l'implémentation côté serveur
  const handleSearch = async (value: string) => {
    const query = value?.trim() || '';
    setSearchValue(query);
    // Normaliser côté client pour la sensibilité à la casse
    if (!query) {
      setCurrentPage(1);
      loadCabinets(1, pageSize);
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
        await loadCabinets();
        
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
        await loadCabinets();
        
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
        await loadCabinets();
        
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

  // Ajouter le bouton de suppression groupée
  headerActions.unshift(
    <Button key="bulk-delete" danger icon={<DeleteOutlined />} onClick={async () => {
      if (!selectedRowKeys || selectedRowKeys.length === 0) {
        message.info(t('actions.selectAtLeastOne'));
        return;
      }
      Modal.confirm({
        title: t('actions.delete') + ' ? ',
        content: t('cabinets.confirmDelete.multiple', { count: selectedRowKeys.length }) ?? `Supprimer ${selectedRowKeys.length} cabinets ?`,
        okText: t('actions.delete'),
        okType: 'danger',
        cancelText: t('actions.cancel'),
        onOk: async () => {
          try {
            for (const k of selectedRowKeys) {
              const id = Number(k);
              if (!Number.isNaN(id)) await cabinetService.delete(id);
            }
            message.success(t('cabinets.deleteSuccess'));
            setSelectedRowKeys([]);
            await loadCabinets(1, pageSize);
          } catch (e) {
            console.error('Erreur suppression groupée cabinets', e);
            message.error(t('cabinets.deleteError'));
          }
        }
      });
    }} disabled={selectedRowKeys.length === 0}>{t('actions.deleteSelected')}</Button>
  );

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
        loading={loading}
        rowSelection={{ selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys) }}
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
