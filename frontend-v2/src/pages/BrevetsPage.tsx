/*
 * ================================================================================================
 * PAGE BREVETS - STARTINGBLOCH
 * ================================================================================================
 * 
 * Page de gestion des brevets avec liste, ajout, modification et suppression.
 * 
 * ================================================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Space, 
  message, 
  Modal, 
  Tag,
  Dropdown,
  MenuProps,
  Tooltip,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  ExportOutlined,
  FileProtectOutlined,
  FlagOutlined
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { motion } from 'framer-motion';

// Components
import { PageHeader, DataTable, SearchInput } from '../components/common';
import { AddBrevetModal, EditBrevetModal } from '../components/modals';

// Services
import { brevetService, statutService } from '../services';

// Types
import type { Brevet } from '../types';

// Hooks
import { useNotificationStore } from '../store/notificationStore';

const BrevetsPage: React.FC = () => {
  const [brevets, setBrevets] = useState<Brevet[]>([]);
  const [allBrevets, setAllBrevets] = useState<Brevet[]>([]); // Stockage de tous les brevets
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedBrevet, setSelectedBrevet] = useState<Brevet | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [brevetToEdit, setBrevetToEdit] = useState<Brevet | null>(null);
  const [statuts, setStatuts] = useState<Array<{text: string; value: string}>>([]);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const { addNotification } = useNotificationStore();

  // Fonction pour obtenir l'emoji du drapeau du pays
  const getFlagEmoji = (codeIso?: string): string => {
    if (!codeIso || codeIso.length !== 2) return '🏳️';
    
    const flagEmojis: { [key: string]: string } = {
      'FR': '🇫🇷', 'DE': '🇩🇪', 'GB': '🇬🇧', 'US': '🇺🇸', 'IT': '🇮🇹', 
      'ES': '🇪🇸', 'NL': '🇳🇱', 'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹',
      'SE': '🇸🇪', 'DK': '🇩🇰', 'FI': '🇫🇮', 'NO': '🇳🇴', 'PL': '🇵🇱',
      'CZ': '🇨🇿', 'HU': '🇭🇺', 'SK': '🇸🇰', 'SI': '🇸🇮', 'HR': '🇭🇷',
      'RO': '🇷🇴', 'BG': '🇧🇬', 'GR': '🇬🇷', 'CY': '🇨🇾', 'MT': '🇲🇹',
      'LU': '🇱🇺', 'IE': '🇮🇪', 'PT': '🇵🇹', 'EE': '🇪🇪', 'LV': '🇱🇻',
      'LT': '🇱🇹', 'CA': '🇨🇦', 'AU': '🇦🇺', 'JP': '🇯🇵', 'KR': '🇰🇷',
      'CN': '🇨🇳', 'IN': '🇮🇳', 'BR': '🇧🇷', 'MX': '🇲🇽', 'AR': '🇦🇷',
      'CL': '🇨🇱', 'CO': '🇨🇴', 'PE': '🇵🇪', 'VE': '🇻🇪', 'UY': '🇺🇾',
      'RU': '🇷🇺', 'TR': '🇹🇷', 'IL': '🇮🇱', 'SA': '🇸🇦', 'AE': '🇦🇪',
      'EG': '🇪🇬', 'ZA': '🇿🇦', 'MA': '🇲🇦', 'TN': '🇹🇳', 'DZ': '🇩🇿'
    };
    
    return flagEmojis[codeIso.toUpperCase()] || '🏳️';
  };

  // Fonction pour obtenir les couleurs cohérentes des statuts
  const getStatutColor = (statut?: string): string => {
    if (!statut) return 'default';
    
    const statutLower = statut.toLowerCase();
    
    // Statuts positifs/actifs - VERT
    if (statutLower.includes('accordé') || statutLower.includes('délivré') || 
        statutLower.includes('actif') || statutLower.includes('validé') ||
        statutLower.includes('maintenu') || statutLower.includes('en vigueur')) {
      return 'green';
    }
    
    // Statuts en cours/processus - BLEU
    if (statutLower.includes('en cours') || statutLower.includes('déposé') || 
        statutLower.includes('examen') || statutLower.includes('instruction') ||
        statutLower.includes('publié') || statutLower.includes('publication')) {
      return 'blue';
    }
    
    // Statuts d'attente/préparation - CYAN
    if (statutLower.includes('préparation') || statutLower.includes('attente') || 
        statutLower.includes('soumis') || statutLower.includes('enregistré')) {
      return 'cyan';
    }
    
    // Statuts d'alerte/attention - ORANGE
    if (statutLower.includes('suspendu') || statutLower.includes('opposition') || 
        statutLower.includes('recours') || statutLower.includes('limitation') ||
        statutLower.includes('annuité due') || statutLower.includes('échéance proche')) {
      return 'orange';
    }
    
    // Statuts négatifs/terminés - ROUGE
    if (statutLower.includes('rejeté') || statutLower.includes('refusé') || 
        statutLower.includes('abandonné') || statutLower.includes('expiré') ||
        statutLower.includes('annulé') || statutLower.includes('révoqué') ||
        statutLower.includes('caduc') || statutLower.includes('déchu')) {
      return 'red';
    }
    
    // Statuts neutres/informatifs - GRIS
    if (statutLower.includes('retiré') || statutLower.includes('non applicable') || 
        statutLower.includes('en attente') || statutLower.includes('reporté')) {
      return 'default';
    }
    
    // Statuts spéciaux - VIOLET
    if (statutLower.includes('licence') || statutLower.includes('cession') || 
        statutLower.includes('transfert') || statutLower.includes('modification')) {
      return 'purple';
    }
    
    return 'default';
  };

  // Fonction utilitaire pour les couleurs de statut (garde l'ancienne pour compatibilité)
  const getStatusColor = (statut?: string): string => {
    switch (statut) {
      case 'Actif': return 'green';
      case 'En cours': return 'blue';
      case 'Accordé': return 'green';
      case 'Expiré': return 'red';
      case 'Rejeté': return 'red';
      case 'Abandonné': return 'orange';
      default: return 'default';
    }
  };

  // Charger les statuts depuis l'API
  const loadStatuts = async () => {
    try {
      const response = await statutService.getAll();
      if (response.success && response.data) {
        // Transformer les statuts pour les filtres
        const statutFilters = response.data.map(statut => ({
          text: statut.nomStatut,
          value: statut.nomStatut
        }));
        setStatuts(statutFilters);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statuts:', error);
      // En cas d'erreur, utiliser des statuts par défaut
      setStatuts([
        { text: 'Actif', value: 'Actif' },
        { text: 'En cours', value: 'En cours' },
        { text: 'Accordé', value: 'Accordé' },
        { text: 'Expiré', value: 'Expiré' },
        { text: 'Rejeté', value: 'Rejeté' },
        { text: 'Suspendu', value: 'Suspendu' },
        { text: 'Abandonné', value: 'Abandonné' },
      ]);
    }
  };

  // Charger les brevets avec pagination
  const loadBrevets = async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true);
    try {
      const response = await brevetService.getAll(page, size);
      if (response.success && response.data) {
        setBrevets(response.data);
        setAllBrevets(response.data); // Stocker tous les brevets pour le filtrage local
        setTotalCount(response.totalCount || 0);
        setTotalPages(response.totalPages || 0);
        setCurrentPage(response.page || page);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur',
        description: 'Impossible de charger la liste des brevets'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers pour les modales
  const handleAdd = () => {
    setIsAddModalVisible(true);
  };

  const handleEdit = (brevet: Brevet) => {
    setBrevetToEdit(brevet);
    setIsEditModalVisible(true);
  };

  const handleView = async (brevet: Brevet) => {
    try {
      setLoading(true);
      setIsDetailModalVisible(true);
      
      // Récupérer les détails complets du brevet avec toutes les relations
      const response = await brevetService.getById(brevet.id);
      if (response.success && response.data) {
        setSelectedBrevet(response.data);
      } else {
        // Si erreur, utiliser les données de base
        setSelectedBrevet(brevet);
        addNotification({
          type: 'warning',
          message: 'Certains détails pourraient ne pas être disponibles'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      // En cas d'erreur, utiliser les données de base
      setSelectedBrevet(brevet);
      addNotification({
        type: 'warning',
        message: 'Impossible de récupérer tous les détails du brevet'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await brevetService.delete(id);
      addNotification({
        type: 'success',
        message: 'Brevet supprimé avec succès'
      });
      loadBrevets();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      addNotification({
        type: 'error',
        message: 'Erreur lors de la suppression du brevet'
      });
    }
  };

  const handleAddSuccess = () => {
    setIsAddModalVisible(false);
    loadBrevets();
    addNotification({
      type: 'success',
      message: 'Brevet ajouté avec succès'
    });
  };

  const handleEditSuccess = () => {
    setIsEditModalVisible(false);
    setBrevetToEdit(null);
    loadBrevets();
    addNotification({
      type: 'success',
      message: 'Brevet modifié avec succès'
    });
  };

  useEffect(() => {
    loadBrevets();
    loadStatuts(); // Charger aussi les statuts au démarrage
  }, []);

  // Gestionnaire de changement de pagination
  const handleTableChange = (page: number, size?: number) => {
    const newPageSize = size || pageSize;
    setCurrentPage(page);
    setPageSize(newPageSize);
    loadBrevets(page, newPageSize);
  };

  // Recherche locale en temps réel
  const handleSearch = (value: string) => {
    setSearchValue(value);
    
    if (!value.trim()) {
      // Si recherche vide, afficher tous les brevets
      setBrevets(allBrevets);
      setTotalCount(allBrevets.length);
      setCurrentPage(1);
    } else {
      // Filtrer localement les brevets
      const searchTerm = value.toLowerCase();
      const filteredBrevets = allBrevets.filter(brevet => 
        (brevet.titreBrevet?.toLowerCase().includes(searchTerm)) ||
        (brevet.numeroBrevet?.toLowerCase().includes(searchTerm)) ||
        (brevet.descriptionBrevet?.toLowerCase().includes(searchTerm)) ||
        (brevet.classesBrevet?.toLowerCase().includes(searchTerm))
      );
      
      setBrevets(filteredBrevets);
      setTotalCount(filteredBrevets.length);
      setCurrentPage(1);
    }
  };

  // Supprimer un brevet avec confirmation
  const confirmDelete = (brevet: Brevet) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: `Êtes-vous sûr de vouloir supprimer le brevet "${brevet.titreBrevet}" ?`,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => handleDelete(brevet.id)
    });
  };

  // Actions par ligne
  const getRowActions = (record: Brevet): MenuProps['items'] => [
    {
      key: 'view',
      label: 'Voir les détails',
      icon: <EyeOutlined />,
      onClick: () => handleView(record)
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
  const columns: ColumnsType<Brevet> = [
    {
      title: 'Titre',
      dataIndex: 'titreBrevet',
      key: 'titreBrevet',
      sorter: (a, b) => (a.titreBrevet || '').localeCompare(b.titreBrevet || ''),
      filterSearch: true,
      render: (titre: string) => (
        <Tooltip title={titre}>
          <span style={{ maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {titre || 'Sans titre'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Numéro',
      dataIndex: 'numeroBrevet',
      key: 'numeroBrevet',
      width: 120,
    },
    {
      title: 'Statut',
      dataIndex: 'statutBrevet',
      key: 'statutBrevet',
      render: (statut: string) => {
        console.log('🎯 Statut reçu:', statut); // Debug log
        // Utiliser la fonction getStatutColor existante pour une cohérence visuelle
        return <Tag color={getStatutColor(statut)}>{statut || 'Non défini'}</Tag>;
      },
      filters: statuts.length > 0 ? statuts : [
        { text: 'Actif', value: 'Actif' },
        { text: 'En cours', value: 'En cours' },
        { text: 'Accordé', value: 'Accordé' },
        { text: 'Expiré', value: 'Expiré' },
        { text: 'Rejeté', value: 'Rejeté' },
        { text: 'Suspendu', value: 'Suspendu' },
        { text: 'Abandonné', value: 'Abandonné' },
      ],
      onFilter: (value, record) => {
        console.log('🔍 Filtrage statut:', value, 'Record:', record.statutBrevet); // Debug log
        return record.statutBrevet === value;
      },
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
      onClick={handleAdd}
    >
      Nouveau brevet
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
        title="Brevets"
        description="Gestion des brevets et de leurs statuts"
        breadcrumbs={[
          { title: 'Brevets' }
        ]}
        actions={headerActions}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <SearchInput
          placeholder="Rechercher un brevet..."
          onSearch={handleSearch}
          style={{ maxWidth: 400 }}
        />

        <DataTable
          columns={columns}
          data={brevets}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} sur ${total} brevets`,
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
            <FileProtectOutlined />
            {`Détails du brevet - ${selectedBrevet?.titreBrevet || selectedBrevet?.numeroBrevet}`}
          </Space>
        }
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedBrevet(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Fermer
          </Button>
        ]}
        width={900}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>Chargement des détails...</p>
          </div>
        ) : (
          selectedBrevet && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Informations générales */}
              <div>
                <h3>📋 Informations générales</h3>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div><strong>Référence:</strong> {selectedBrevet.numeroBrevet || 'Non renseigné'}</div>
                  <div><strong>Titre:</strong> {selectedBrevet.titreBrevet || 'Non renseigné'}</div>
                  <div><strong>Description:</strong> {selectedBrevet.descriptionBrevet || 'Non renseignée'}</div>
                  <div><strong>Classes:</strong> {selectedBrevet.classesBrevet || 'Non renseignées'}</div>
                  <div><strong>Date de création:</strong> {new Date(selectedBrevet.createdAt).toLocaleDateString('fr-FR')}</div>
                </Space>
              </div>

              {/* Clients */}
              {selectedBrevet.clients && selectedBrevet.clients.length > 0 && (
                <div>
                  <h3>🏢 Clients ({selectedBrevet.clients.length})</h3>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {selectedBrevet.clients.map((client: any, index: number) => (
                      <div key={index} style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <div><strong>{client.NomClient}</strong> ({client.ReferenceClient})</div>
                        <div>📧 {client.EmailClient}</div>
                        <div>📞 {client.TelephoneClient}</div>
                        <div>📍 {client.AdresseClient}, {client.PaysClient}</div>
                      </div>
                    ))}
                  </Space>
                </div>
              )}

              {/* Inventeurs */}
              {selectedBrevet.inventeurs && selectedBrevet.inventeurs.length > 0 && (
                <div>
                  <h3>👨‍🔬 Inventeurs ({selectedBrevet.inventeurs.length})</h3>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {selectedBrevet.inventeurs.map((inventeur: any, index: number) => (
                      <div key={index} style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <div><strong>{inventeur.Prenom} {inventeur.Nom}</strong></div>
                        <div>📧 {inventeur.Email}</div>
                        {inventeur.Pays && inventeur.Pays.length > 0 && (
                          <div>🌍 {inventeur.Pays.map((pays: any) => pays.NomPays || pays.nom).join(', ')}</div>
                        )}
                      </div>
                    ))}
                  </Space>
                </div>
              )}

              {/* Déposants */}
              {selectedBrevet.deposants && selectedBrevet.deposants.length > 0 && (
                <div>
                  <h3>📝 Déposants ({selectedBrevet.deposants.length})</h3>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {selectedBrevet.deposants.map((deposant: any, index: number) => (
                      <div key={deposant.Id || index} style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <div><strong>{deposant.Nom}</strong></div>
                        <div>📧 {deposant.Email || 'Non renseigné'}</div>
                        {deposant.Pays && deposant.Pays.length > 0 && (
                          <div>🌍 {deposant.Pays.map((pays: any) => pays.NomPays || pays.NomFrFr).join(', ')}</div>
                        )}
                      </div>
                    ))}
                  </Space>
                </div>
              )}

              {/* Titulaires */}
              {selectedBrevet.titulaires && selectedBrevet.titulaires.length > 0 && (
                <div>
                  <h3>👑 Titulaires ({selectedBrevet.titulaires.length})</h3>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {selectedBrevet.titulaires.map((titulaire: any, index: number) => (
                      <div key={titulaire.Id || index} style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <div><strong>{titulaire.Nom}</strong></div>
                        <div>📧 {titulaire.Email || 'Non renseigné'}</div>
                        {titulaire.Pays && titulaire.Pays.length > 0 && (
                          <div>🌍 {titulaire.Pays.map((pays: any) => pays.NomPays || pays.NomFrFr).join(', ')}</div>
                        )}
                      </div>
                    ))}
                  </Space>
                </div>
              )}

              {/* Cabinets */}
              {selectedBrevet.cabinets && selectedBrevet.cabinets.length > 0 && (
                <div>
                  <h3>🏛️ Cabinets ({selectedBrevet.cabinets.length})</h3>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {selectedBrevet.cabinets.map((cabinet: any, index: number) => (
                      <div key={cabinet.Id || index} style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <div><strong>{cabinet.NomCabinet}</strong></div>
                        <div>📧 {cabinet.EmailCabinet}</div>
                        <div>📞 {cabinet.TelephoneCabinet}</div>
                        <div>📍 {cabinet.AdresseCabinet}</div>
                        {cabinet.PaysCabinet && (
                          <div>🌍 {cabinet.PaysCabinet}</div>
                        )}
                        <div>
                          <Tag color={cabinet.Type === 'Annuite' ? 'blue' : 'orange'}>
                            {cabinet.Type === 'Annuite' ? 'Annuités' : 'Procédures'}
                          </Tag>
                        </div>
                      </div>
                    ))}
                  </Space>
                </div>
              )}

              {/* Informations de dépôt */}
              {selectedBrevet.informationsDepot && selectedBrevet.informationsDepot.length > 0 && (
                <div>
                  <h3>🗂️ Informations de dépôt ({selectedBrevet.informationsDepot.length})</h3>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {selectedBrevet.informationsDepot.map((info: any, index: number) => (
                      <div key={index} style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                        {/* En-tête avec drapeau et pays */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '24px', marginRight: '8px' }}>
                            {(() => {
                              const codeIso = info.Pays?.CodeIso || info.Pays?.CodePays;
                              console.log('🏳️ Pays info:', info.Pays);
                              console.log('🎯 Code ISO utilisé:', codeIso);
                              return getFlagEmoji(codeIso);
                            })()}
                          </span>
                          <strong style={{ fontSize: '16px' }}>
                            {info.Pays?.NomPays || info.Pays?.NomFrFr || 'Pays non spécifié'}
                            {(info.Pays?.CodeIso || info.Pays?.CodePays) && (
                              <span style={{ marginLeft: '8px', color: '#666', fontSize: '14px' }}>
                                ({info.Pays?.CodeIso || info.Pays?.CodePays})
                              </span>
                            )}
                          </strong>
                        </div>
                        
                        {/* Statut avec couleur */}
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Statut: </strong>
                          <Tag 
                            color={getStatutColor(info.Statuts?.NomStatut)} 
                            style={{ marginLeft: '8px', fontWeight: 'bold' }}
                          >
                            {info.Statuts?.NomStatut || 'Statut non défini'}
                          </Tag>
                        </div>
                        
                        {/* Informations de dépôt */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                          <div><strong>N° Dépôt:</strong> {info.NumeroDepot || 'Non renseigné'}</div>
                          {info.NumeroPublication && (
                            <div><strong>N° Publication:</strong> {info.NumeroPublication}</div>
                          )}
                          {info.NumeroDelivrance && (
                            <div><strong>N° Délivrance:</strong> {info.NumeroDelivrance}</div>
                          )}
                          <div>
                            <strong>Date de dépôt:</strong> {
                              info.DateDepot 
                                ? new Date(info.DateDepot).toLocaleDateString('fr-FR') 
                                : 'Non renseignée'
                            }
                          </div>
                          {info.DatePublication && (
                            <div>
                              <strong>Date de publication:</strong> {
                                new Date(info.DatePublication).toLocaleDateString('fr-FR')
                              }
                            </div>
                          )}
                          {info.DateDelivrance && (
                            <div>
                              <strong>Date de délivrance:</strong> {
                                new Date(info.DateDelivrance).toLocaleDateString('fr-FR')
                              }
                            </div>
                          )}
                          <div>
                            <strong>Licence:</strong> 
                            <Tag 
                              color={info.Licence ? 'green' : 'default'} 
                              style={{ marginLeft: '8px' }}
                            >
                              {info.Licence ? '✅ Oui' : '❌ Non'}
                            </Tag>
                          </div>
                        </div>
                        
                        {/* Commentaire si présent */}
                        {info.Commentaire && (
                          <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#666' }}>
                            <strong>Commentaire:</strong> {info.Commentaire}
                          </div>
                        )}
                      </div>
                    ))}
                  </Space>
                </div>
              )}
            </Space>
          )
        )}
      </Modal>

      {/* Modal d'ajout */}
      <AddBrevetModal
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSubmit={async (values) => {
          try {
            await brevetService.create(values);
            handleAddSuccess();
          } catch (error) {
            addNotification({
              type: 'error',
              message: 'Erreur lors de la création du brevet'
            });
          }
        }}
      />

      {/* Modal d'édition */}
      <EditBrevetModal
        visible={isEditModalVisible}
        brevet={brevetToEdit}
        onCancel={() => {
          setIsEditModalVisible(false);
          setBrevetToEdit(null);
        }}
        onSubmit={async (id, values) => {
          try {
            await brevetService.update(id, values);
            handleEditSuccess();
          } catch (error) {
            addNotification({
              type: 'error',
              message: 'Erreur lors de la modification du brevet'
            });
          }
        }}
      />
    </motion.div>
  );
};

export default BrevetsPage;
