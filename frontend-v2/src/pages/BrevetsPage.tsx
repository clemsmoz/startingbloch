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
  Card,
  Descriptions,
  
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  ExportOutlined,
  FileProtectOutlined,
  
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { motion } from 'framer-motion';

// Components
import { PageHeader, DataTable, SearchInput } from '../components/common';
import { AddBrevetModal, EditBrevetModal } from '../components/modals';
import ImportFromExcelModal from '../components/modals/ImportFromExcelModal';
import { useNavigate } from 'react-router-dom';

// Services
import { brevetService } from '../services';

// Types
import type { Brevet } from '../types';

// Hooks
import { useNotificationStore } from '../store/notificationStore';
import { useTranslation } from 'react-i18next';

const BrevetsPage: React.FC = () => {
  const [brevets, setBrevets] = useState<Brevet[]>([]);
  const [allBrevets, setAllBrevets] = useState<Brevet[]>([]); // Stockage de tous les brevets
  const [loading, setLoading] = useState(false);
  const [selectedBrevet, setSelectedBrevet] = useState<Brevet | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [brevetToEdit, setBrevetToEdit] = useState<Brevet | null>(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  
  const { addNotification } = useNotificationStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Fonction pour obtenir l'image du drapeau du pays (x2)
  const getFlagImage = (codeIso?: string): React.ReactNode => {
    if (!codeIso || codeIso.length !== 2) {
      return <span style={{ fontSize: 24, lineHeight: '32px' }}>🏳️</span>;
    }
    
    try {
      // Utiliser les images png40px depuis le dossier assets
  const flagSrc = `/assets/png40px/${codeIso.toLowerCase()}.png`;
      return (
        <img 
          src={flagSrc} 
          alt={`Drapeau ${codeIso}`}
          style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4, boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }}
          onError={(e) => {
            // Fallback vers l'emoji si l'image n'existe pas
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    } catch (error) {
      return <span style={{ fontSize: 24, lineHeight: '32px' }}>🏳️</span>;
    }
  };

  // Helpers rôles
  const capitalizeRole = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
  const roleColor = (r: string) => {
    const rl = (r || '').toLowerCase();
    if (rl === 'premier') return 'gold';
    if (rl === 'deuxieme' || rl === 'deuxième') return 'geekblue';
    if (rl === 'troisieme' || rl === 'troisième') return 'purple';
    return 'default';
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

  // Charger les brevets avec pagination
  const loadBrevets = async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true);
    try {
      const response = await brevetService.getAll(page, size);
      if (response.success && response.data) {
        setBrevets(response.data);
        setAllBrevets(response.data); // Stocker tous les brevets pour le filtrage local
        setTotalCount(response.totalCount ?? 0);
        setCurrentPage(response.page ?? page);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: t('notifications.error'),
        description: t('brevets.loadError')
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers pour les modales
  const handleAdd = () => {
    setIsAddModalVisible(true);
  };

  const handleImportFromExcel = () => {
    setIsImportModalVisible(true);
  };

  const handleEdit = (brevet: Brevet) => {
    (async () => {
      try {
        const resp = await brevetService.getById(brevet.id);
        if (resp && resp.success && resp.data) {
          setBrevetToEdit(resp.data);
        } else {
          setBrevetToEdit(brevet);
        }
      } catch (e) {
        console.error('Erreur chargement brevet complet pour édition', e);
        setBrevetToEdit(brevet);
      } finally {
        setIsEditModalVisible(true);
      }
    })();
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
          message: t('brevets.partialDetailsWarning')
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      // En cas d'erreur, utiliser les données de base
      setSelectedBrevet(brevet);
      addNotification({
        type: 'warning',
        message: t('brevets.detailFetchError')
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
        message: t('brevets.deleteSuccess') ?? 'Brevet supprimé avec succès'
      });
      loadBrevets();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      addNotification({
        type: 'error',
        message: t('brevets.deleteError') ?? 'Erreur lors de la suppression du brevet'
      });
    }
  };

  const handleAddSuccess = () => {
    setIsAddModalVisible(false);
    loadBrevets();
    addNotification({
      type: 'success',
      message: t('brevets.addSuccess') ?? 'Brevet ajouté avec succès'
    });
  };

  const handleEditSuccess = () => {
    setIsEditModalVisible(false);
    setBrevetToEdit(null);
    loadBrevets();
    addNotification({
      type: 'success',
      message: t('brevets.editSuccess') ?? 'Brevet modifié avec succès'
    });
  };

  useEffect(() => {
    loadBrevets();
  }, []);

  // Gestionnaire de changement de pagination
  const handleTableChange = (page: number, size?: number) => {
    const newPageSize = size ?? pageSize;
    setCurrentPage(page);
    setPageSize(newPageSize);
  loadBrevets(page, newPageSize);
  };

  // Recherche locale en temps réel
  const handleSearch = (value: string) => {
    const term = (value ?? '').trim();
    if (!term) {
      // Si recherche vide, afficher tous les brevets
      setBrevets(allBrevets);
      setTotalCount(allBrevets.length);
      setCurrentPage(1);
      return;
    }
    // Filtrer localement les brevets de façon insensible à la casse
    const searchTerm = term.toLowerCase();
    const filteredBrevets = allBrevets.filter(brevet => 
      (brevet.titreBrevet?.toLowerCase().includes(searchTerm)) ||
      (brevet.numeroBrevet?.toLowerCase().includes(searchTerm)) ||
      (brevet.descriptionBrevet?.toLowerCase().includes(searchTerm)) ||
      (brevet.classesBrevet?.toLowerCase().includes(searchTerm))
    );

    setBrevets(filteredBrevets);
    setTotalCount(filteredBrevets.length);
    setCurrentPage(1);
  };

  // Supprimer un brevet avec confirmation
  const confirmDelete = (brevet: Brevet) => {
    Modal.confirm({
      title: t('brevets.confirmDelete.title'),
      content: t('brevets.confirmDelete.content', { title: brevet.titreBrevet }),
      okText: t('actions.delete'),
      okType: 'danger',
      cancelText: t('actions.cancel'),
      onOk: () => handleDelete(brevet.id)
    });
  };

  // Actions par ligne
  const getRowActions = (record: Brevet): MenuProps['items'] => [
    {
      key: 'view',
      label: t('actions.viewDetails'),
      icon: <EyeOutlined />,
      onClick: () => handleView(record)
    },
    {
      key: 'edit',
      label: t('actions.edit'),
      icon: <EditOutlined />,
      onClick: () => handleEdit(record)
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      label: t('actions.delete'),
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => confirmDelete(record)
    }
  ];

  // Colonnes de la table
  const columns: ColumnsType<Brevet> = [
  {
  title: t('brevets.columns.reference'),
      dataIndex: 'numeroBrevet',
      key: 'numeroBrevet',
      width: 120,
    },
    {
  title: t('brevets.columns.title'),
      dataIndex: 'titreBrevet',
      key: 'titreBrevet',
      sorter: (a, b) => (a.titreBrevet ?? '').localeCompare(b.titreBrevet ?? ''),
      filterSearch: true,
      render: (titre: string) => (
        <Tooltip title={titre}>
          <span style={{ maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {titre ?? t('brevets.noTitle')}
          </span>
        </Tooltip>
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
      onClick={handleAdd}
    >
      {t('brevets.actions.new')}
    </Button>
  ];

  // Ajouter le bouton d'import depuis Excel (à droite du bouton New)
  headerActions.unshift(
    <Button key="import-excel" icon={<FileProtectOutlined />} onClick={handleImportFromExcel}>
      {t('brevets.import.fromExcel') ?? 'Ajouter depuis Excel'}
    </Button>
  );

  // Supprimé le filtrage côté client - la recherche est gérée côté serveur

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
        <PageHeader
        title={t('menu.brevets')}
        description={t('brevets.pageDescription')}
        breadcrumbs={[
          { title: t('menu.brevets') }
        ]}
        actions={headerActions}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <SearchInput
          placeholder={t('brevets.searchPlaceholder')}
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
              showTotal: (total, range) => t('brevets.pagination.showTotal', { from: range[0], to: range[1], total }),
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
            {`${t('brevets.detailTitle')} - ${selectedBrevet?.titreBrevet ?? selectedBrevet?.numeroBrevet}`}
          </Space>
        }
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedBrevet(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            {t('actions.close') ?? 'Fermer'}
          </Button>
        ]}
        width={900}
      >
        {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>{t('brevets.loadingDetails')}</p>
          </div>
        ) : (
          selectedBrevet && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Informations générales */}
              <Card title={t('brevets.generalInfoTitle') ?? '📋 Informations générales'} size="small">
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label={t('brevets.labels.reference')}>{selectedBrevet.numeroBrevet ?? t('common.notProvided')}</Descriptions.Item>
                  <Descriptions.Item label={t('brevets.labels.title')}>{selectedBrevet.titreBrevet ?? t('common.notProvided')}</Descriptions.Item>
                  {selectedBrevet.descriptionBrevet && (
                    <Descriptions.Item label={t('common.description')}>{selectedBrevet.descriptionBrevet}</Descriptions.Item>
                  )}
                  <Descriptions.Item label={t('brevets.labels.addedDate')}>
                    {selectedBrevet.createdAt ? new Date(selectedBrevet.createdAt).toLocaleDateString('fr-FR') : t('common.notProvided')}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Clients */}
              {selectedBrevet.clients && selectedBrevet.clients.length > 0 && (
                <div>
                  <h3>{t('brevets.sections.clients')} ({selectedBrevet.clients.length})</h3>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {selectedBrevet.clients.map((client: any) => (
                      <div key={client.Id ?? client.ReferenceClient ?? `${client.NomClient ?? ''}-${client.EmailClient ?? ''}`} style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <div><strong>{client.NomClient ?? ''}</strong> ({client.ReferenceClient ?? ''})</div>
                        <div>📧 {client.EmailClient ?? ''}</div>
                        <div>📞 {client.TelephoneClient ?? ''}</div>
                        <div>📍 {client.AdresseClient ?? ''}, {client.PaysClient ?? ''}</div>
                      </div>
                    ))}
                  </Space>
                </div>
              )}

              {/* Inventeurs */}
              {selectedBrevet.inventeurs && selectedBrevet.inventeurs.length > 0 && (
                <div>
                  <h3>{t('brevets.sections.inventors')} ({selectedBrevet.inventeurs.length})</h3>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {selectedBrevet.inventeurs.map((inventeur: any) => (
                      <div key={inventeur.Id || `${inventeur.Nom}-${inventeur.Prenom}-${inventeur.Email || ''}`}
                           style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <div><strong>{(inventeur.Prenom ?? '') + ' ' + (inventeur.Nom ?? '')}</strong></div>
                        <div>📧 {inventeur.Email ?? ''}</div>
                        {inventeur.Pays && inventeur.Pays.length > 0 && (
                          <div style={{ marginTop: 4 }}>
                            {inventeur.Pays.map((pays: any) => (
                              <Tag key={pays.Id ?? pays.CodeIso ?? pays.CodePays ?? pays.NomPays ?? pays.NomFrFr}
                                   style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <span>{getFlagImage(pays.CodeIso ?? pays.CodePays)}</span>
                                <span>{pays.NomPays ?? pays.NomFrFr ?? 'Pays'}</span>
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </Space>
                </div>
              )}

              {/* Déposants */}
              {selectedBrevet.deposants && selectedBrevet.deposants.length > 0 && (
                <div>
                  <h3>{t('brevets.sections.filers')} ({selectedBrevet.deposants.length})</h3>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {selectedBrevet.deposants.map((deposant: any) => (
               <div key={deposant.Id ?? `${deposant.Nom ?? ''}-${deposant.Email ?? ''}`}
                  style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                <div><strong>{deposant.Nom ?? ''}</strong></div>
                <div>📧 {deposant.Email ?? t('common.notProvided')}</div>
                        {deposant.Pays && deposant.Pays.length > 0 && (
                          <div style={{ marginTop: 4 }}>
                            {deposant.Pays.map((pays: any) => (
                              <Tag key={pays.Id ?? pays.CodeIso ?? pays.CodePays ?? pays.NomPays ?? pays.NomFrFr}
                                   style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <span>{getFlagImage(pays.CodeIso ?? pays.CodePays)}</span>
                                <span>{pays.NomPays ?? pays.NomFrFr ?? 'Pays'}</span>
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </Space>
                </div>
              )}

              {/* Titulaires */}
              {selectedBrevet.titulaires && selectedBrevet.titulaires.length > 0 && (
                <div>
                  <h3>{t('brevets.sections.holders')} ({selectedBrevet.titulaires.length})</h3>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {selectedBrevet.titulaires.map((titulaire: any) => (
                      <div key={titulaire.Id || `${titulaire.Nom}-${titulaire.Email || ''}`}
                           style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <div><strong>{titulaire.Nom ?? ''}</strong></div>
                        <div>📧 {titulaire.Email ?? t('common.notProvided')}</div>
                        {titulaire.Pays && titulaire.Pays.length > 0 && (
                          <div style={{ marginTop: 4 }}>
                            {titulaire.Pays.map((pays: any) => (
                                <Tag key={pays.Id ?? pays.CodeIso ?? pays.CodePays ?? pays.NomPays ?? pays.NomFrFr}
                                   style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <span>{getFlagImage(pays.CodeIso ?? pays.CodePays)}</span>
                                <span>{pays.NomPays ?? pays.NomFrFr ?? 'Pays'}</span>
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </Space>
                </div>
              )}

              {/* Cabinets (désormais par Information de dépôt, voir plus bas) */}

              {/* Informations de dépôt */}
              {selectedBrevet.informationsDepot && selectedBrevet.informationsDepot.length > 0 && (
                <div>
                  <h3>{t('brevets.sections.filingInfo')} ({selectedBrevet.informationsDepot.length})</h3>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {selectedBrevet.informationsDepot.map((info: any) => (
          <Card key={info.Id ?? info.NumeroDepot ?? `${info.Pays?.CodeIso ?? info.Pays?.CodePays}-${info.DateDepot ?? ''}`}
                           size="small" bodyStyle={{ backgroundColor: '#fafafa' }} headStyle={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
                        {/* En-tête avec drapeau et pays */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 54, height: 36, marginRight: 12, background: '#fff', borderRadius: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.05)' }}>
                            {getFlagImage(info.Pays?.CodeIso ?? info.Pays?.CodePays)}
                          </span>
                          <strong style={{ fontSize: 18 }}>
                            {info.Pays?.NomPays ?? info.Pays?.NomFrFr ?? (t('common.countryNotSpecified') ?? 'Pays non spécifié')}
                            {(info.Pays?.CodeIso ?? info.Pays?.CodePays) && (
                              <span style={{ marginLeft: 8, color: '#666', fontSize: 14 }}>
                                ({info.Pays?.CodeIso ?? info.Pays?.CodePays})
                              </span>
                            )}
                          </strong>
                        </div>
                        
                        {/* Statut avec couleur */}
                        <div style={{ marginBottom: '8px' }}>
                          <strong>{t('brevets.labels.status') ?? 'Statut'}: </strong>
                          <Tag 
                            color={getStatutColor(info.Statuts?.NomStatut)} 
                            style={{ marginLeft: '8px', fontWeight: 'bold' }}
                          >
                            {info.Statuts?.NomStatut ?? (t('brevets.statusNotDefined') ?? 'Statut non défini')}
                          </Tag>
                        </div>
                        
                        {/* Informations de dépôt */}
                        <Descriptions bordered size="small" column={2} style={{ marginBottom: 8 }}>
                          <Descriptions.Item label={t('brevets.labels.filingNumber') ?? 'N° Dépôt'}>{info.NumeroDepot ?? (t('common.notProvided') ?? 'Non renseigné')}</Descriptions.Item>
                          {info.NumeroPublication && (
                            <Descriptions.Item label={t('brevets.labels.publicationNumber') ?? 'N° Publication'}>{info.NumeroPublication}</Descriptions.Item>
                          )}
                          {info.NumeroDelivrance && (
                            <Descriptions.Item label={t('brevets.labels.deliveryNumber') ?? 'N° Délivrance'}>{info.NumeroDelivrance}</Descriptions.Item>
                          )}
                            <Descriptions.Item label={t('brevets.labels.filingDate') ?? 'Date de dépôt'}>
                            {info.DateDepot ? new Date(info.DateDepot).toLocaleDateString('fr-FR') : (t('common.notProvided') ?? 'Non renseigné')}
                          </Descriptions.Item>
                          {info.DatePublication && (
                              <Descriptions.Item label={t('brevets.labels.publicationDate') ?? 'Date de publication'}>
                              {new Date(info.DatePublication).toLocaleDateString('fr-FR')}
                            </Descriptions.Item>
                          )}
                          {info.DateDelivrance && (
                              <Descriptions.Item label={t('brevets.labels.deliveryDate') ?? 'Date de délivrance'}>
                              {new Date(info.DateDelivrance).toLocaleDateString('fr-FR')}
                            </Descriptions.Item>
                          )}
                          <Descriptions.Item label={t('brevets.labels.licence') ?? 'Licence'}>
                            <Tag color={info.Licence ? 'green' : 'default'}>
                              {info.Licence ? (t('common.yes') ?? '✅ Oui') : (t('common.no') ?? '❌ Non')}
                            </Tag>
                          </Descriptions.Item>
                        </Descriptions>
                        
                        {/* Commentaire si présent */}
                        {info.Commentaire && (
                          <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#666' }}>
                            <strong>Commentaire:</strong> {info.Commentaire}
                          </div>
                        )}

                        {/* Cabinets liés à ce dépôt */}
                        <div style={{ marginTop: '12px' }}>
                          <h4 style={{ marginBottom: 8 }}>🏛️ Cabinets liés</h4>
                          {/* Annuités */}
                          <div style={{ marginBottom: 6 }}>
                            <div style={{ color: '#1890ff', marginBottom: 4 }}>{t('brevets.sections.annuities')}</div>
                            {(!info.CabinetsAnnuites || info.CabinetsAnnuites.length === 0) ? (
                              <span style={{ color: '#999' }}>{t('common.none') ?? 'Aucun'}</span>
                            ) : (
                              <ul style={{ margin: 0, paddingLeft: 18 }}>
                                {info.CabinetsAnnuites.map((row: any, idx: number) => (
                                  <li key={`ann-${info.Id ?? info._tempId ?? idx}`} style={{ marginBottom: 4 }}>
                                    <strong>{row.CabinetNom ?? 'Cabinet'}</strong>
                                    {row.Roles && row.Roles.length > 0 && (
                                      <span style={{ marginLeft: 8 }}>
                                        {row.Roles.map((r: string, i: number) => (
                                          <Tag key={`ra-${i}`} color={roleColor(r)}>
                                            {capitalizeRole(r)}
                                          </Tag>
                                        ))}
                                      </span>
                                    )}
                                    {row.Contacts && row.Contacts.length > 0 && (
                                      <span style={{ marginLeft: 8 }}>
                                        {row.Contacts.map((c: any, i: number) => (
                                          <Tooltip key={`ca-${i}`} title={c.Email ?? c.email ?? ''}>
                                            <Tag>{`${c.Prenom ?? c.prenom ?? ''} ${c.Nom ?? c.nom ?? ''}`.trim()}</Tag>
                                          </Tooltip>
                                        ))}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          {/* Procédures */}
                          <div>
                            <div style={{ color: '#fa8c16', marginBottom: 4 }}>{t('brevets.sections.procedures')}</div>
                            {(!info.CabinetsProcedures || info.CabinetsProcedures.length === 0) ? (
                              <span style={{ color: '#999' }}>{t('common.none') ?? 'Aucun'}</span>
                            ) : (
                              <ul style={{ margin: 0, paddingLeft: 18 }}>
                                {info.CabinetsProcedures.map((row: any, idx: number) => (
                                  <li key={`proc-${info.Id ?? info._tempId ?? idx}`} style={{ marginBottom: 4 }}>
                                    <strong>{row.CabinetNom ?? 'Cabinet'}</strong>
                                    {row.Roles && row.Roles.length > 0 && (
                                      <span style={{ marginLeft: 8 }}>
                                        {row.Roles.map((r: string, i: number) => (
                                          <Tag key={`rp-${i}`} color={roleColor(r)}>
                                            {capitalizeRole(r)}
                                          </Tag>
                                        ))}
                                      </span>
                                    )}
                                    {row.Contacts && row.Contacts.length > 0 && (
                                      <span style={{ marginLeft: 8 }}>
                                        {row.Contacts.map((c: any, i: number) => (
                                          <Tooltip key={`cp-${i}`} title={c.Email ?? c.email ?? ''}>
                                            <Tag>{`${c.Prenom ?? c.prenom ?? ''} ${c.Nom ?? c.nom ?? ''}`.trim()}</Tag>
                                          </Tooltip>
                                        ))}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </Card>
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
            console.error('Erreur création brevet:', error);
            addNotification({
              type: 'error',
              message: t('brevets.createError') || 'Erreur lors de la création du brevet'
            });
          }
        }}
      />

      <ImportFromExcelModal
        visible={isImportModalVisible}
        onCancel={() => setIsImportModalVisible(false)}
        onComplete={() => {
          // Refresh the list after import completes
          loadBrevets(1, pageSize).catch(() => {});
        }}
        onPrepare={({ clientId, file }) => {
          // For now, navigate to a recap route or open recap flow. We will not parse file here.
          setIsImportModalVisible(false);
          // Use navigate state to transfer minimal info (filename & clientId). File object isn't serializable.
          try {
            navigate('/brevets/import/recap', { state: { clientId, fileName: file?.name ?? null } });
          } catch (e) {
            console.log('Prepare import:', { clientId, fileName: file?.name });
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
            console.error('Erreur modification brevet:', error);
            addNotification({
              type: 'error',
              message: t('brevets.updateError') || 'Erreur lors de la modification du brevet'
            });
          }
        }}
      />
    </motion.div>
  );
};

export default BrevetsPage;
