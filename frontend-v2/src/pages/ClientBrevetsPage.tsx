/*
 * ================================================================================================
 * PAGE BREVETS D'UN CLIENT - STARTINGBLOCH (COMPLÈTE)
 * ================================================================================================
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Space, message, Modal, Dropdown, Tooltip, Card, Descriptions, Tag } from 'antd';
import { ArrowLeftOutlined, ExportOutlined, PlusOutlined, MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined, FileProtectOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { motion } from 'framer-motion';

import { PageHeader, DataTable, SearchInput } from '../components/common';
import { AddBrevetModal, EditBrevetModal } from '../components/modals';
import { brevetService } from '../services';
import type { Brevet } from '../types';
import { useNotificationStore } from '../store/notificationStore';

const ClientBrevetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const clientName = searchParams.get('clientName') || 'Client';

  const [brevets, setBrevets] = useState<Brevet[]>([]);
  const [allBrevets, setAllBrevets] = useState<Brevet[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBrevet, setSelectedBrevet] = useState<Brevet | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [brevetToEdit, setBrevetToEdit] = useState<Brevet | null>(null);

  // Pagination locale
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { addNotification } = useNotificationStore();

  // Utils d'affichage identiques à BrevetsPage
  const getFlagImage = (codeIso?: string): React.ReactNode => {
    if (!codeIso || codeIso.length !== 2) {
      return <span style={{ fontSize: 24, lineHeight: '32px' }}>🏳️</span>;
    }
    try {
      const flagSrc = `/src/assets/png40px/${codeIso.toLowerCase()}.png`;
      return (
        <img
          src={flagSrc}
          alt={`Drapeau ${codeIso}`}
          style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4, boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      );
    } catch {
      return <span style={{ fontSize: 24, lineHeight: '32px' }}>🏳️</span>;
    }
  };
  const capitalizeRole = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
  const roleColor = (r: string) => {
    const rl = (r || '').toLowerCase();
    if (rl === 'premier') return 'gold';
    if (rl === 'deuxieme' || rl === 'deuxième') return 'geekblue';
    if (rl === 'troisieme' || rl === 'troisième') return 'purple';
    return 'default';
  };
  const getStatutColor = (statut?: string): string => {
    if (!statut) return 'default';
    const statutLower = statut.toLowerCase();
    if (statutLower.includes('accordé') || statutLower.includes('délivré') || statutLower.includes('actif') || statutLower.includes('validé') || statutLower.includes('maintenu') || statutLower.includes('en vigueur')) return 'green';
    if (statutLower.includes('en cours') || statutLower.includes('déposé') || statutLower.includes('examen') || statutLower.includes('instruction') || statutLower.includes('publié') || statutLower.includes('publication')) return 'blue';
    if (statutLower.includes('préparation') || statutLower.includes('attente') || statutLower.includes('soumis') || statutLower.includes('enregistré')) return 'cyan';
    if (statutLower.includes('suspendu') || statutLower.includes('opposition') || statutLower.includes('recours') || statutLower.includes('limitation') || statutLower.includes('annuité due') || statutLower.includes('échéance proche')) return 'orange';
    if (statutLower.includes('rejeté') || statutLower.includes('refusé') || statutLower.includes('abandonné') || statutLower.includes('expiré') || statutLower.includes('annulé') || statutLower.includes('révoqué') || statutLower.includes('caduc') || statutLower.includes('déchu')) return 'red';
    if (statutLower.includes('retiré') || statutLower.includes('non applicable') || statutLower.includes('en attente') || statutLower.includes('reporté')) return 'default';
    if (statutLower.includes('licence') || statutLower.includes('cession') || statutLower.includes('transfert') || statutLower.includes('modification')) return 'purple';
    return 'default';
  };

  // Chargement des brevets du client avec fallback si vide
  const loadBrevets = async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const cid = Number(clientId);
      const resp = await brevetService.getByClientId(cid);
      if (resp.success && resp.data && resp.data.length > 0) {
        setBrevets(resp.data);
        setAllBrevets(resp.data);
        return;
      }
      // Fallback: agréger tous les brevets et filtrer par client
      const aggregated: Brevet[] = [];
      let page = 1;
      const size = 200;
      // 5 pages max de sécurité pour éviter des boucles infinies
      for (let i = 0; i < 5; i++) {
        const r = await brevetService.getAll(page, size);
        if (!r.success) break;
        const batch = r.data || [];
        aggregated.push(...batch);
        if (!r.hasNextPage || batch.length < size) break;
        page += 1;
      }
      const filtered = aggregated.filter(b => {
        if ((b as any).clientId && (b as any).clientId === cid) return true;
        const list = (b as any).clients || [];
        return Array.isArray(list) && list.some((c: any) => (c?.Id ?? c?.id) === cid);
      });
      setBrevets(filtered);
      setAllBrevets(filtered);
      if (filtered.length === 0) {
        addNotification({ type: 'warning', message: "Aucun brevet trouvé pour ce client" });
      }
    } catch (e) {
      console.error('Erreur loadBrevets client:', e);
      addNotification({ type: 'error', message: "Erreur lors du chargement des brevets" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBrevets(); }, [clientId]);

  // Recherche locale
  const handleSearch = (value: string) => {
    const term = (value || '').toLowerCase().trim();
    if (!term) {
      setBrevets(allBrevets);
      setCurrentPage(1);
      return;
    }
    const next = allBrevets.filter(b =>
      (b.titreBrevet || '').toLowerCase().includes(term) ||
      (b.numeroBrevet || '').toLowerCase().includes(term) ||
      (b.descriptionBrevet || '').toLowerCase().includes(term) ||
      (b.classesBrevet || '').toLowerCase().includes(term)
    );
    setBrevets(next);
    setCurrentPage(1);
  };

  // Handlers modales/actions
  const handleAdd = () => setIsAddModalVisible(true);
  const handleAddSuccess = () => {
    setIsAddModalVisible(false);
    loadBrevets();
    addNotification({ type: 'success', message: 'Brevet ajouté avec succès' });
  };
  const handleEdit = (brevet: Brevet) => { setBrevetToEdit(brevet); setIsEditModalVisible(true); };
  const handleEditSuccess = () => {
    setIsEditModalVisible(false);
    setBrevetToEdit(null);
    loadBrevets();
    addNotification({ type: 'success', message: 'Brevet modifié avec succès' });
  };
  const handleView = async (brevet: Brevet) => {
    try {
      setLoading(true);
      setIsDetailModalVisible(true);
      const response = await brevetService.getById(brevet.id);
      if (response.success && response.data) setSelectedBrevet(response.data); else setSelectedBrevet(brevet);
    } catch (e) {
      console.error('Erreur lors de la récupération des détails:', e);
      setSelectedBrevet(brevet);
      addNotification({ type: 'warning', message: 'Impossible de récupérer tous les détails du brevet' });
    } finally { setLoading(false); }
  };
  const handleDelete = async (id: number) => {
    try {
      await brevetService.delete(id);
      addNotification({ type: 'success', message: 'Brevet supprimé avec succès' });
      loadBrevets();
    } catch (e) {
      console.error('Erreur suppression brevet:', e);
      addNotification({ type: 'error', message: 'Erreur lors de la suppression du brevet' });
    }
  };
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

  // Colonnes et actions
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
    { title: 'référence famille', dataIndex: 'numeroBrevet', key: 'numeroBrevet', width: 120 },
    {
      title: 'Actions', key: 'actions', width: 120,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'Voir les détails', icon: <EyeOutlined />, onClick: () => handleView(record) },
              { key: 'edit', label: 'Modifier', icon: <EditOutlined />, onClick: () => handleEdit(record) },
              { type: 'divider' as const },
              { key: 'delete', label: 'Supprimer', icon: <DeleteOutlined />, danger: true, onClick: () => confirmDelete(record) },
            ]
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
        </Dropdown>
      )
    }
  ];

  // Actions entête
  const headerActions = [
    <Button key="export" icon={<ExportOutlined />} onClick={() => message.info("Fonctionnalité d'export en cours de développement")}>Exporter</Button>,
    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Nouveau brevet</Button>,
    <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => navigate('/clients')}>Retour aux clients</Button>,
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title={`Brevets — ${clientName}`}
        description="Liste des brevets associés à ce client"
        breadcrumbs={[{ title: 'Clients', href: '/clients' }, { title: clientName }, { title: 'Brevets' }]}
        actions={headerActions}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <SearchInput placeholder="Rechercher un brevet de ce client..." onSearch={handleSearch} style={{ maxWidth: 420 }} />
        <DataTable
          columns={columns}
          data={brevets}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize,
            total: brevets.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: number[]) => `${range[0]}-${range[1]} sur ${total} brevets`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (page: number, size?: number) => { setCurrentPage(page); setPageSize(size || pageSize); },
            onShowSizeChange: (page: number, size: number) => { setCurrentPage(page); setPageSize(size); },
          }}
        />
      </Space>

      {/* Modal de détails */}
      <Modal
        title={<Space><FileProtectOutlined />{`Détails du brevet - ${selectedBrevet?.titreBrevet || selectedBrevet?.numeroBrevet}`}</Space>}
        open={isDetailModalVisible}
        onCancel={() => { setIsDetailModalVisible(false); setSelectedBrevet(null); }}
        footer={[<Button key="close" onClick={() => setIsDetailModalVisible(false)}>Fermer</Button>]}
        width={900}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}><p>Chargement des détails...</p></div>
        ) : (
          selectedBrevet && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card title="📋 Informations générales" size="small">
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="Référence famille">{selectedBrevet.numeroBrevet || 'Non renseigné'}</Descriptions.Item>
                  <Descriptions.Item label="Titre">{selectedBrevet.titreBrevet || 'Non renseigné'}</Descriptions.Item>
                  {selectedBrevet.descriptionBrevet && (<Descriptions.Item label="Description">{selectedBrevet.descriptionBrevet}</Descriptions.Item>)}
                  <Descriptions.Item label="Date d'ajout au portefeuille">{new Date(selectedBrevet.createdAt).toLocaleDateString('fr-FR')}</Descriptions.Item>
                </Descriptions>
              </Card>

              {selectedBrevet.clients && selectedBrevet.clients.length > 0 && (
                <div>
                  <h3>🏢 Clients ({selectedBrevet.clients.length})</h3>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {selectedBrevet.clients.map((client: any) => (
                      <div key={client.Id || client.ReferenceClient || `${client.NomClient}-${client.EmailClient}`} style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <div><strong>{client.NomClient}</strong> ({client.ReferenceClient})</div>
                        <div>📧 {client.EmailClient}</div>
                        <div>📞 {client.TelephoneClient}</div>
                        <div>📍 {client.AdresseClient}, {client.PaysClient}</div>
                      </div>
                    ))}
                  </Space>
                </div>
              )}

              {selectedBrevet.inventeurs && selectedBrevet.inventeurs.length > 0 && (
                <div>
                  <h3>👨‍🔬 Inventeurs ({selectedBrevet.inventeurs.length})</h3>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {selectedBrevet.inventeurs.map((inventeur: any) => (
                      <div key={inventeur.Id || `${inventeur.Nom}-${inventeur.Prenom}-${inventeur.Email || ''}`} style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <div><strong>{inventeur.Prenom} {inventeur.Nom}</strong></div>
                        <div>📧 {inventeur.Email}</div>
                        {inventeur.Pays && inventeur.Pays.length > 0 && (
                          <div style={{ marginTop: 4 }}>
                            {inventeur.Pays.map((pays: any) => (
                              <Tag key={pays.Id || pays.CodeIso || pays.CodePays || pays.NomPays || pays.NomFrFr} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <span>{getFlagImage(pays.CodeIso || pays.CodePays)}</span>
                                <span>{pays.NomPays || pays.NomFrFr || 'Pays'}</span>
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </Space>
                </div>
              )}

              {selectedBrevet.deposants && selectedBrevet.deposants.length > 0 && (
                <div>
                  <h3>📝 Déposants ({selectedBrevet.deposants.length})</h3>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {selectedBrevet.deposants.map((deposant: any) => (
                      <div key={deposant.Id || `${deposant.Nom}-${deposant.Email || ''}`} style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <div><strong>{deposant.Nom}</strong></div>
                        <div>📧 {deposant.Email || 'Non renseigné'}</div>
                        {deposant.Pays && deposant.Pays.length > 0 && (
                          <div style={{ marginTop: 4 }}>
                            {deposant.Pays.map((pays: any) => (
                              <Tag key={pays.Id || pays.CodeIso || pays.CodePays || pays.NomPays || pays.NomFrFr} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <span>{getFlagImage(pays.CodeIso || pays.CodePays)}</span>
                                <span>{pays.NomPays || pays.NomFrFr || 'Pays'}</span>
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </Space>
                </div>
              )}

              {selectedBrevet.titulaires && selectedBrevet.titulaires.length > 0 && (
                <div>
                  <h3>👑 Titulaires ({selectedBrevet.titulaires.length})</h3>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {selectedBrevet.titulaires.map((titulaire: any) => (
                      <div key={titulaire.Id || `${titulaire.Nom}-${titulaire.Email || ''}`} style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <div><strong>{titulaire.Nom}</strong></div>
                        <div>📧 {titulaire.Email || 'Non renseigné'}</div>
                        {titulaire.Pays && titulaire.Pays.length > 0 && (
                          <div style={{ marginTop: 4 }}>
                            {titulaire.Pays.map((pays: any) => (
                              <Tag key={pays.Id || pays.CodeIso || pays.CodePays || pays.NomPays || pays.NomFrFr} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <span>{getFlagImage(pays.CodeIso || pays.CodePays)}</span>
                                <span>{pays.NomPays || pays.NomFrFr || 'Pays'}</span>
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </Space>
                </div>
              )}

              {selectedBrevet.informationsDepot && selectedBrevet.informationsDepot.length > 0 && (
                <div>
                  <h3>🗂️ Informations de dépôt ({selectedBrevet.informationsDepot.length})</h3>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {selectedBrevet.informationsDepot.map((info: any, idx: number) => (
                      <Card key={info.Id || info.NumeroDepot || `${info.Pays?.CodeIso || info.Pays?.CodePays}-${info.DateDepot || ''}-${idx}`}
                        size="small" bodyStyle={{ backgroundColor: '#fafafa' }} headStyle={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 54, height: 36, marginRight: 12, background: '#fff', borderRadius: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.05)' }}>
                            {getFlagImage(info.Pays?.CodeIso || info.Pays?.CodePays)}
                          </span>
                          <strong style={{ fontSize: 18 }}>
                            {info.Pays?.NomPays || info.Pays?.NomFrFr || 'Pays non spécifié'}
                            {(info.Pays?.CodeIso || info.Pays?.CodePays) && (
                              <span style={{ marginLeft: 8, color: '#666', fontSize: 14 }}>
                                ({info.Pays?.CodeIso || info.Pays?.CodePays})
                              </span>
                            )}
                          </strong>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Statut: </strong>
                          <Tag color={getStatutColor(info.Statuts?.NomStatut)} style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                            {info.Statuts?.NomStatut || 'Statut non défini'}
                          </Tag>
                        </div>
                        <Descriptions bordered size="small" column={2} style={{ marginBottom: 8 }}>
                          <Descriptions.Item label="N° Dépôt">{info.NumeroDepot || 'Non renseigné'}</Descriptions.Item>
                          {info.NumeroPublication && (<Descriptions.Item label="N° Publication">{info.NumeroPublication}</Descriptions.Item>)}
                          {info.NumeroDelivrance && (<Descriptions.Item label="N° Délivrance">{info.NumeroDelivrance}</Descriptions.Item>)}
                          <Descriptions.Item label="Date de dépôt">{info.DateDepot ? new Date(info.DateDepot).toLocaleDateString('fr-FR') : 'Non renseignée'}</Descriptions.Item>
                          {info.DatePublication && (<Descriptions.Item label="Date de publication">{new Date(info.DatePublication).toLocaleDateString('fr-FR')}</Descriptions.Item>)}
                          {info.DateDelivrance && (<Descriptions.Item label="Date de délivrance">{new Date(info.DateDelivrance).toLocaleDateString('fr-FR')}</Descriptions.Item>)}
                          <Descriptions.Item label="Licence"><Tag color={info.Licence ? 'green' : 'default'}>{info.Licence ? '✅ Oui' : '❌ Non'}</Tag></Descriptions.Item>
                        </Descriptions>
                        <div style={{ marginTop: '12px' }}>
                          <h4 style={{ marginBottom: 8 }}>🏛️ Cabinets liés</h4>
                          <div style={{ marginBottom: 6 }}>
                            <div style={{ color: '#1890ff', marginBottom: 4 }}>Annuités</div>
                            {(!info.CabinetsAnnuites || info.CabinetsAnnuites.length === 0) ? (
                              <span style={{ color: '#999' }}>Aucun</span>
                            ) : (
                              <ul style={{ margin: 0, paddingLeft: 18 }}>
                                {info.CabinetsAnnuites.map((row: any) => {
                                  const annKey = row.CabinetId || row.CabinetNom || `${(row.Contacts || []).map((c: any) => c?.Id || c?.Email).join('-')}-${(row.Roles || []).join('-')}`;
                                  return (
                                  <li key={`ann-${annKey}`} style={{ marginBottom: 4 }}>
                                    <strong>{row.CabinetNom || 'Cabinet'}</strong>
                                    {row.Roles && row.Roles.length > 0 && (
                                      <span style={{ marginLeft: 8 }}>
                                        {row.Roles.map((r: string) => (
                                          <Tag key={`role-${row.CabinetId || row.CabinetNom || 'cab'}-${r}`} color={roleColor(r)}>{capitalizeRole(r)}</Tag>
                                        ))}
                                      </span>
                                    )}
                                    {row.Contacts && row.Contacts.length > 0 && (
                                      <span style={{ marginLeft: 8 }}>
                                        {row.Contacts.map((c: any) => {
                                          const fallbackName = ((c.Nom || c.nom || '').toString() + '-' + (c.Prenom || c.prenom || '').toString());
                                          const contactKey = 'contact-' + (c.Id || c.Email || fallbackName);
                                          const label = `${c.Prenom || c.prenom || ''} ${c.Nom || c.nom || ''}`.trim();
                                          return (
                                            <Tooltip key={contactKey} title={c.Email || c.email || ''}>
                                              <Tag>{label}</Tag>
                                            </Tooltip>
                                          );
                                        })}
                                      </span>
                                    )}
                                  </li>
                                );})}
                              </ul>
                            )}
                          </div>
                          <div>
                            <div style={{ color: '#fa8c16', marginBottom: 4 }}>Procédures</div>
                            {(!info.CabinetsProcedures || info.CabinetsProcedures.length === 0) ? (
                              <span style={{ color: '#999' }}>Aucun</span>
                            ) : (
                              <ul style={{ margin: 0, paddingLeft: 18 }}>
                                {info.CabinetsProcedures.map((row: any) => {
                                  const procKey = row.CabinetId || row.CabinetNom || `${(row.Contacts || []).map((c: any) => c?.Id || c?.Email).join('-')}-${(row.Roles || []).join('-')}`;
                                  return (
                                  <li key={`proc-${procKey}`} style={{ marginBottom: 4 }}>
                                    <strong>{row.CabinetNom || 'Cabinet'}</strong>
                                    {row.Roles && row.Roles.length > 0 && (
                                      <span style={{ marginLeft: 8 }}>
                                        {row.Roles.map((r: string) => (
                                          <Tag key={`proc-role-${row.CabinetId || row.CabinetNom || 'cab'}-${r}`} color={roleColor(r)}>{capitalizeRole(r)}</Tag>
                                        ))}
                                      </span>
                                    )}
                                    {row.Contacts && row.Contacts.length > 0 && (
                                      <span style={{ marginLeft: 8 }}>
                                        {row.Contacts.map((c: any) => {
                                          const procFallbackName = ((c.Nom || c.nom || '').toString() + '-' + (c.Prenom || c.prenom || '').toString());
                                          const contactKey = 'proc-contact-' + (c.Id || c.Email || procFallbackName);
                                          const label = `${c.Prenom || c.prenom || ''} ${c.Nom || c.nom || ''}`.trim();
                                          return (
                                            <Tooltip key={contactKey} title={c.Email || c.email || ''}>
                                              <Tag>{label}</Tag>
                                            </Tooltip>
                                          );
                                        })}
                                      </span>
                                    )}
                                  </li>
                                );})}
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
  preselectedClientIds={clientId ? [Number(clientId)] : undefined}
        onSubmit={async (values) => {
          try { await brevetService.create(values); handleAddSuccess(); }
          catch (error) {
            console.error('Erreur création brevet:', error);
            addNotification({ type: 'error', message: 'Erreur lors de la création du brevet' });
          }
        }}
      />

      {/* Modal d'édition */}
      <EditBrevetModal
        visible={isEditModalVisible}
        brevet={brevetToEdit}
        onCancel={() => { setIsEditModalVisible(false); setBrevetToEdit(null); }}
        onSubmit={async (id, values) => {
          try { await brevetService.update(id, values); handleEditSuccess(); }
          catch (error) {
            console.error('Erreur modification brevet:', error);
            addNotification({ type: 'error', message: 'Erreur lors de la modification du brevet' });
          }
        }}
      />
    </motion.div>
  );
};

export default ClientBrevetsPage;
