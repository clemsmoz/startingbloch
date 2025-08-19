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
  console.log('🏢 CabinetsPage - Rendu du composant...');
  
  const navigate = useNavigate();
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);

  // Fonction pour transformer le type numérique en texte
  const getTypeLabel = (type: any): string => {
    if (type === 1 || type === '1') return 'Annuité';
    if (type === 2 || type === '2') return 'Procédure';
    return 'N/A';
  };

  // Fonction pour obtenir la couleur du type
  const getTypeColor = (type: any): string => {
    if (type === 1 || type === '1') return 'blue';
    if (type === 2 || type === '2') return 'green';
    return 'default';
  };
  const [loading, setLoading] = useState(false);
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
      title: 'Nom du Cabinet',
      dataIndex: 'nomCabinet',
      key: 'nomCabinet',
      sorter: (a, b) => a.nomCabinet.localeCompare(b.nomCabinet),
      render: (nom: string) => (
        <span className="font-medium text-gray-900">{nom}</span>
      ),
    },
    {
      title: 'Type',
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
      title: 'Email',
      dataIndex: 'emailCabinet',
      key: 'emailCabinet',
      render: (email?: string) => email || '-',
    },
    {
      title: 'Téléphone',
      dataIndex: 'telephoneCabinet',
      key: 'telephoneCabinet',
      render: (phone?: string) => phone || '-',
    },
    {
      title: 'Référence',
      dataIndex: 'referenceCabinet',
      key: 'referenceCabinet',
      render: (ref?: string) => ref || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => {
        const userRole = (useNotificationStore.getState() as any)?.user?.role || (JSON.parse(sessionStorage.getItem('startingbloch_user') || 'null')?.role);
        const isClient = String(userRole || '').toLowerCase() === 'client';
        const menuItems: MenuProps['items'] = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'Voir détails',
            onClick: () => handleViewCabinet(record),
          },
          {
            key: 'contacts',
            icon: <ContactsOutlined />,
            label: 'Voir contacts',
            onClick: () => handleViewContacts(record),
          },
          // Pour les clients, pas de modification/suppression
          ...(!isClient ? [
            {
              key: 'edit',
              icon: <EditOutlined />,
              label: 'Modifier',
              onClick: () => handleEditCabinet(record),
            },
            { type: 'divider' as const },
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              label: 'Supprimer',
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
        message.error(response.message || 'Erreur lors du chargement des cabinets');
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
      message.error('Erreur lors du chargement des cabinets');
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
    setSearchValue(value);
    // Pour l'instant, on recharge tous les cabinets et on laisse le filtrage côté client
    if (!value.trim()) {
      setCurrentPage(1);
      loadCabinets(1, pageSize);
    }
  };

  // Supprimé le filtrage côté client - la recherche est gérée côté serveur
  // Filtrage temporaire côté client
  const filteredCabinets = Array.isArray(cabinets) ? cabinets.filter(cabinet =>
    searchValue === '' ||
    cabinet.nomCabinet.toLowerCase().includes(searchValue.toLowerCase()) ||
    getTypeLabel(cabinet.type).toLowerCase().includes(searchValue.toLowerCase()) ||
    cabinet.emailCabinet?.toLowerCase().includes(searchValue.toLowerCase()) ||
    cabinet.adresseCabinet?.toLowerCase().includes(searchValue.toLowerCase()) ||
    cabinet.paysCabinet?.toLowerCase().includes(searchValue.toLowerCase())
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
        message.success('Cabinet créé avec succès');
        setIsAddModalVisible(false);
        await loadCabinets();
        
        addNotification({
          type: 'success',
          message: 'Cabinet créé',
          description: `Le cabinet "${values.nomCabinet}" a été créé avec succès.`
        });
      } else {
        message.error(response.message || 'Erreur lors de la création du cabinet');
      }
    } catch (error) {
      console.error('Erreur lors de la création du cabinet:', error);
      message.error('Erreur lors de la création du cabinet');
    }
  };

  const handleUpdateCabinet = async (values: UpdateCabinetDto) => {
    try {
      const response = await cabinetService.update(values);
      if (response.success) {
        message.success('Cabinet modifié avec succès');
        setIsEditModalVisible(false);
        setSelectedCabinet(null);
        await loadCabinets();
        
        addNotification({
          type: 'success',
          message: 'Cabinet modifié',
          description: `Le cabinet a été modifié avec succès.`
        });
      } else {
        message.error(response.message || 'Erreur lors de la modification du cabinet');
      }
    } catch (error) {
      console.error('Erreur lors de la modification du cabinet:', error);
      message.error('Erreur lors de la modification du cabinet');
    }
  };

  const confirmDeleteCabinet = async () => {
    if (!selectedCabinet) return;

    try {
      const response = await cabinetService.delete(selectedCabinet.id);
      if (response.success) {
        message.success('Cabinet supprimé avec succès');
        setIsDeleteModalVisible(false);
        setSelectedCabinet(null);
        await loadCabinets();
        
        addNotification({
          type: 'success',
          message: 'Cabinet supprimé',
          description: `Le cabinet "${selectedCabinet.nomCabinet}" a été supprimé avec succès.`
        });
      } else {
        message.error(response.message || 'Erreur lors de la suppression du cabinet');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du cabinet:', error);
      message.error('Erreur lors de la suppression du cabinet');
    }
  };

  // Actions du header
  const headerActions = [
    <SearchInput
      key="search"
      placeholder="Rechercher un cabinet..."
      onSearch={handleSearch}
      style={{ width: '320px' }}
    />,
    <Button
      key="export"
      icon={<ExportOutlined />}
      onClick={() => message.info('Fonctionnalité d\'export en cours de développement')}
    >
      Exporter
    </Button>,
    // Bouton ajout désactivé pour clients si aucune création côté client ? Ici on autorise via endpoint /my
    <Button
      key="add"
      type="primary"
      icon={<PlusOutlined />}
      onClick={handleAddCabinet}
    >
      Nouveau Cabinet
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
        title="Gestion des Cabinets"
        description="Gérez les cabinets de votre organisation"
        actions={headerActions}
      />

      <DataTable
        columns={columns}
        data={searchValue ? filteredCabinets : cabinets}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1000 }}
  pagination={(searchValue ? false : ((JSON.parse(sessionStorage.getItem('startingbloch_user') || 'null')?.role || '').toLowerCase() === 'client' ? false : {
          current: currentPage,
          pageSize: pageSize,
          total: totalCount,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} sur ${total} cabinets`,
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
        title="Confirmer la suppression"
        open={isDeleteModalVisible}
        onOk={confirmDeleteCabinet}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setSelectedCabinet(null);
        }}
        okText="Supprimer"
        cancelText="Annuler"
        okButtonProps={{ danger: true }}
      >
        <p>
          Êtes-vous sûr de vouloir supprimer le cabinet{' '}
          <strong>{selectedCabinet?.nomCabinet}</strong> ?
        </p>
        <p className="text-red-600 text-sm mt-2">
          Cette action est irréversible.
        </p>
      </Modal>

      {/* Modal de détails */}
      <Modal
        title="Détails du Cabinet"
        open={isDetailModalVisible}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Fermer
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setIsDetailModalVisible(false);
              handleEditCabinet(selectedCabinet!);
            }}
          >
            Modifier
          </Button>,
        ]}
        onCancel={() => setIsDetailModalVisible(false)}
        width={600}
      >
        {selectedCabinet && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom du Cabinet</label>
              <p className="mt-1 text-sm text-gray-900">{selectedCabinet.nomCabinet}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <Tag color={getTypeColor(selectedCabinet.type)}>
                {getTypeLabel(selectedCabinet.type)}
              </Tag>
            </div>
            {selectedCabinet.adresseCabinet && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Adresse</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCabinet.adresseCabinet}</p>
              </div>
            )}
            {selectedCabinet.paysCabinet && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Pays</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCabinet.paysCabinet}</p>
              </div>
            )}
            {selectedCabinet.emailCabinet && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCabinet.emailCabinet}</p>
              </div>
            )}
            {selectedCabinet.telephoneCabinet && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
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
