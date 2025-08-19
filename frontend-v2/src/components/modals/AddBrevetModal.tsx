/*
 * ================================================================================================
 * MODAL AJOUT BREVET - STARTINGBLOCH
 * ================================================================================================
 * 
 * Modal complet pour ajouter un nouveau brevet avec toutes ses informations et relations.
 * 
 * ================================================================================================
 */

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Tabs, Button, DatePicker, Switch, Card, Descriptions, Tag, Typography, Spin } from 'antd';
import { FileProtectOutlined, PlusOutlined, DeleteOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { CreateBrevetDto, Client, Contact, Pays, Statuts, Cabinet, CreateInformationDepotDto, Inventeur, Deposant, Titulaire } from '../../types';
import { clientService, contactService, cabinetService, paysService, statutsService, inventeurService, deposantService, titulaireService, brevetService } from '../../services';
import CreateInventeurModal from './CreateInventeurModal';
import CreateTitulaireModal from './CreateTitulaireModal';
import CreateDeposantModal from './CreateDeposantModal';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface AddBrevetModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateBrevetDto) => Promise<void>;
  loading?: boolean;
  preselectedClientIds?: number[];
}

type CabinetRow = { cabinetId?: number; roles: string[]; contactIds: number[] };

interface CabinetSectionProps {
  title: string;
  category: 'annuites' | 'procedures';
  tempId: string;
  rows: CabinetRow[];
  cabinets: Cabinet[];
  cabinetContacts: { [cabinetId: number]: Contact[] };
  roleOptions: { label: string; value: string }[];
  onAdd: (tempId: string, category: 'annuites' | 'procedures') => void;
  onRemove: (tempId: string, category: 'annuites' | 'procedures', index: number) => void;
  onChangeRow: (tempId: string, category: 'annuites' | 'procedures', index: number, field: 'cabinetId' | 'roles' | 'contactIds', value: any) => void;
  getUsedCabinetIds: (info: any, category: 'annuites' | 'procedures', excludeIndex?: number) => number[];
  info: any;
  cabinetType: 1 | 2;
}

const CabinetSection: React.FC<CabinetSectionProps> = ({
  title,
  category,
  tempId,
  rows,
  cabinets,
  cabinetContacts,
  roleOptions,
  onAdd,
  onRemove,
  onChangeRow,
  getUsedCabinetIds,
  info,
  cabinetType,
}) => {
  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 12, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h4 style={{ margin: 0 }}>{title}</h4>
        <Button size="small" type="dashed" onClick={() => onAdd(tempId, category)} icon={<PlusOutlined />}>Ajouter</Button>
      </div>
      {(!rows || rows.length === 0) && (
        <Text type="secondary">Aucun cabinet pour cette catégorie.</Text>
      )}
      {(rows || []).map((row: CabinetRow, idx: number) => {
        const usedIds = getUsedCabinetIds(info, category, idx);
        const filteredCabinets = cabinets.filter(c => c.type === cabinetType && !usedIds.includes(c.id));
        const contacts = row.cabinetId ? (cabinetContacts[row.cabinetId] || []) : [];
        const currentCabinet = row.cabinetId ? cabinets.find(c => c.id === row.cabinetId) : undefined;
        const cabinetOptions = currentCabinet ? [currentCabinet, ...filteredCabinets.filter(c => c.id !== currentCabinet.id)] : filteredCabinets;

        return (
          <div key={`${category}-${tempId}-${idx}`} style={{ borderTop: '1px dashed #eee', paddingTop: 8, marginTop: 8 }}>
            <Row gutter={8}>
              <Col span={8}>
                <div style={{ marginBottom: 8 }}>Cabinet</div>
                <Select
                  placeholder="Choisir un cabinet"
                  value={row.cabinetId}
                  onChange={(val) => onChangeRow(tempId, category, idx, 'cabinetId', val)}
                  style={{ width: '100%' }}
                >
                  {cabinetOptions.map((c) => (
                    <Option key={c.id} value={c.id}>{c.nomCabinet}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 8 }}>Rôles</div>
                <Select
                  mode="multiple"
                  placeholder="Sélectionner les rôles"
                  value={row.roles || []}
                  onChange={(vals) => onChangeRow(tempId, category, idx, 'roles', vals)}
                  style={{ width: '100%' }}
                  options={roleOptions}
                />
              </Col>
              <Col span={7}>
                <div style={{ marginBottom: 8 }}>Contacts</div>
                <Select
                  mode="multiple"
                  placeholder="Sélectionner les contacts"
                  value={row.contactIds || []}
                  onChange={(vals) => onChangeRow(tempId, category, idx, 'contactIds', vals)}
                  style={{ width: '100%' }}
                  disabled={!row.cabinetId}
                >
                  {contacts.map((ct: Contact) => (
                    <Option key={ct.id} value={ct.id}>{ct.prenom} {ct.nom} {ct.email ? `- ${ct.email}` : ''}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={1}>
                <Button danger type="text" icon={<DeleteOutlined />} onClick={() => onRemove(tempId, category, idx)} />
              </Col>
            </Row>
          </div>
        );
      })}
    </div>
  );
};

interface RecapCabinetListProps {
  title: string;
  rows: CabinetRow[];
  cabinets: Cabinet[];
  cabinetContacts: { [cabinetId: number]: Contact[] };
}

const RecapCabinetList: React.FC<RecapCabinetListProps> = ({ title, rows, cabinets, cabinetContacts }) => {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontWeight: 500, marginBottom: 4 }}>{title}</div>
      {!rows || rows.length === 0 ? (
        <Text type="secondary">Aucun</Text>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {rows.map((row, i) => {
            const cab = cabinets.find(c => c.id === row.cabinetId);
            const labels = (row.contactIds || []).map((cid) => {
              const ct = (row.cabinetId ? (cabinetContacts[row.cabinetId] || []) : []).find(c => c.id === cid);
              return ct ? `${ct.prenom || ''} ${ct.nom || ''}`.trim() : `Contact #${cid}`;
            }).filter((v): v is string => Boolean(v));
            const roles = (row.roles || []).join(', ');
            return (
              <li key={`rec-${title}-${i}`}>
                <Text strong>{cab?.nomCabinet || 'Cabinet inconnu'}</Text>
                {roles ? <span> — Rôles: {roles}</span> : null}
                {labels.length ? <span> — Contacts: {labels.join(', ')}</span> : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const AddBrevetModal: React.FC<AddBrevetModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
  preselectedClientIds,
}) => {
  const [form] = Form.useForm();
  const [clients, setClients] = useState<Client[]>([]);
  const [pays, setPays] = useState<Pays[]>([]);
  const [statuts, setStatuts] = useState<Statuts[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [cabinetContacts, setCabinetContacts] = useState<{[cabinetId: number]: Contact[]}>({});
  const [loadingData, setLoadingData] = useState(false);
  // Listes relationnelles
  const [inventeurs, setInventeurs] = useState<Inventeur[]>([]);
  const [deposants, setDeposants] = useState<Deposant[]>([]);
  const [titulaires, setTitulaires] = useState<Titulaire[]>([]);
  // Suggestions "déjà utilisés" pour les clients sélectionnés
  const [suggestedInventeurs, setSuggestedInventeurs] = useState<Inventeur[]>([]);
  const [suggestedDeposants, setSuggestedDeposants] = useState<Deposant[]>([]);
  const [suggestedTitulaires, setSuggestedTitulaires] = useState<Titulaire[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<number[]>(preselectedClientIds || []);
  // Recherches locales (barres de recherche)
  const [searchInventeur, setSearchInventeur] = useState('');
  const [searchDeposant, setSearchDeposant] = useState('');
  const [searchTitulaire, setSearchTitulaire] = useState('');
  // Pays par entité (sélection dédiée par inventeur / déposant / titulaire)
  const [inventeurPaysById, setInventeurPaysById] = useState<{ [id: number]: number[] }>({});
  const [titulairePaysById, setTitulairePaysById] = useState<{ [id: number]: number[] }>({});
  const [deposantPaysById, setDeposantPaysById] = useState<{ [id: number]: number[] }>({});

  // Options de rôles pour les cabinets par information de dépôt
  const roleOptions = [
    { label: 'Premier', value: 'premier' },
    { label: 'Deuxième', value: 'deuxieme' },
    { label: 'Troisième', value: 'troisieme' },
  ];

  // États pour les modales de création
  const [createInventeurModalVisible, setCreateInventeurModalVisible] = useState(false);
  const [createTitulaireModalVisible, setCreateTitulaireModalVisible] = useState(false);
  const [createDeposantModalVisible, setCreateDeposantModalVisible] = useState(false);

  const [informationsDepot, setInformationsDepot] = useState<(CreateInformationDepotDto & { _tempId?: string })[]>([]);

  // Etapes formulaire → récap
  const [currentStep, setCurrentStep] = useState<'form' | 'recap'>('form');
  const [formData, setFormData] = useState<any>({});

  // Charger les données de référence
  useEffect(() => {
    if (visible) {
  // Réinitialiser les sélections de pays par entité à chaque ouverture de la modal
  setInventeurPaysById({});
  setTitulairePaysById({});
  setDeposantPaysById({});
      loadReferenceData();
  setCurrentStep('form');
      // Pré-sélectionner le(s) client(s) si fourni
      if (Array.isArray(preselectedClientIds) && preselectedClientIds.length > 0) {
        form.setFieldsValue({ clientIds: preselectedClientIds });
  setSelectedClientIds(preselectedClientIds);
  // Charger les suggestions basées sur ces clients
  loadSuggestionsFromClients(preselectedClientIds).catch(() => {});
      }
    }
  }, [visible]);

  // Helpers: déduplication par id et normalisation de texte (accents-insensible)
  const dedupeById = <T extends { id: number }>(arr: T[] = []): T[] => {
    const seen = new Set<number>();
    return arr.filter((x) => {
      if (x && typeof x.id === 'number' && !seen.has(x.id)) { seen.add(x.id); return true; }
      return false;
    });
  };
  const normalize = (s?: string) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const uniqueBy = <T,>(arr: T[], keyFn: (t: T) => string): T[] => {
    const seen = new Set<string>();
    return arr.filter((x) => {
      const k = keyFn(x);
      if (!k) return true;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  // Normalisation d'entités depuis des brevets pour suggestions
  const mapInventeurFromAny = (x: any): Inventeur | null => {
    const id = x?.id ?? x?.Id;
    if (!id) return null;
    return {
      id,
      nomInventeur: x?.nomInventeur ?? x?.NomInventeur ?? x?.Nom ?? '',
      prenomInventeur: x?.prenomInventeur ?? x?.PrenomInventeur ?? x?.Prenom ?? '',
      createdAt: x?.createdAt ?? x?.CreatedAt ?? '',
      updatedAt: x?.updatedAt ?? x?.UpdatedAt ?? ''
    } as any;
  };
  const mapDeposantFromAny = (x: any): Deposant | null => {
    const id = x?.id ?? x?.Id;
    if (!id) return null;
    return {
      id,
      nomDeposant: x?.nomDeposant ?? x?.NomDeposant ?? x?.Nom ?? '',
      prenomDeposant: x?.prenomDeposant ?? x?.PrenomDeposant ?? x?.Prenom ?? '',
      createdAt: x?.createdAt ?? x?.CreatedAt ?? '',
      updatedAt: x?.updatedAt ?? x?.UpdatedAt ?? ''
    } as any;
  };
  const mapTitulaireFromAny = (x: any): Titulaire | null => {
    const id = x?.id ?? x?.Id;
    if (!id) return null;
    return {
      id,
      nomTitulaire: x?.nomTitulaire ?? x?.NomTitulaire ?? x?.Nom ?? '',
      createdAt: x?.createdAt ?? x?.CreatedAt ?? '',
      updatedAt: x?.updatedAt ?? x?.UpdatedAt ?? ''
    } as any;
  };

  const loadSuggestionsFromClients = async (clientIds: number[] | undefined | null) => {
    try {
      setLoadingSuggestions(true);
      if (!clientIds || clientIds.length === 0) {
        setSuggestedInventeurs([]);
        setSuggestedDeposants([]);
        setSuggestedTitulaires([]);
        return;
      }

      // Rôle courant pour déterminer la stratégie d'appel
      const storedUser = sessionStorage.getItem('startingbloch_user');
      const role = storedUser ? (JSON.parse(storedUser).role || '').toLowerCase() : '';

      // Récupère les brevets pour ces clients
      const brevets: any[] = [];
      if (role !== 'client') {
        // Appels parallèles par client
        const results = await Promise.allSettled(clientIds.map((cid) => brevetService.getByClientId(cid)));
        results.forEach((r) => {
          if (r.status === 'fulfilled' && r.value?.success && Array.isArray(r.value.data)) {
            brevets.push(...r.value.data);
          }
        });
      }

      // Fallback si pas de données ou si rôle client
      if (brevets.length === 0) {
        let page = 1; const pageSize = 50; let loops = 0; const maxLoops = 5;
        // Agrège quelques pages et filtre par client
        while (loops < maxLoops) {
          const resp = await brevetService.getAll(page, pageSize);
          if (!resp.success) break;
          const data = resp.data || [];
          const filtered = data.filter((b: any) => {
            const cids = [b.clientId, ...((b.clients || []).map((c: any) => c?.Id ?? c?.id).filter(Boolean))].filter(Boolean);
            return cids.some((x: any) => clientIds.includes(Number(x)));
          });
          brevets.push(...filtered);
          if (!resp.hasNextPage || data.length < pageSize) break;
          page += 1; loops += 1;
        }
      }

      // Extraire les entités
      const invs: Inventeur[] = [];
      const deps: Deposant[] = [];
      const tits: Titulaire[] = [];
      brevets.forEach((b: any) => {
        (b.inventeurs || b.Inventeurs || []).forEach((x: any) => { const m = mapInventeurFromAny(x); if (m) invs.push(m); });
        (b.deposants || b.Deposants || []).forEach((x: any) => { const m = mapDeposantFromAny(x); if (m) deps.push(m); });
        (b.titulaires || b.Titulaires || []).forEach((x: any) => { const m = mapTitulaireFromAny(x); if (m) tits.push(m); });
      });

      const uniqueInvs = dedupeById(invs);
      const uniqueDeps = dedupeById(deps);
      const uniqueTits = dedupeById(tits);

      setSuggestedInventeurs(uniqueInvs);
      setSuggestedDeposants(uniqueDeps);
      setSuggestedTitulaires(uniqueTits);

      // Assure que ces suggestions existent aussi dans les listes pour affichage
      setInventeurs((prev) => dedupeById([...(prev || []), ...uniqueInvs] as any));
      setDeposants((prev) => dedupeById([...(prev || []), ...uniqueDeps] as any));
      setTitulaires((prev) => dedupeById([...(prev || []), ...uniqueTits] as any));
    } catch (e) {
      console.error('Erreur chargement des suggestions clients:', e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Ajout rapide depuis une suggestion
  const addInventeurSuggested = (id: number) => {
    const current: number[] = form.getFieldValue('inventeurIds') || [];
    if (!current.includes(id)) {
      onChangeInventeurIds([...current, id]);
    }
  };
  const addDeposantSuggested = (id: number) => {
    const current: number[] = form.getFieldValue('deposantIds') || [];
    if (!current.includes(id)) {
      onChangeDeposantIds([...current, id]);
    }
  };
  const addTitulaireSuggested = (id: number) => {
    const current: number[] = form.getFieldValue('titulaireIds') || [];
    if (!current.includes(id)) {
      onChangeTitulaireIds([...current, id]);
    }
  };

  const loadReferenceData = async () => {
    setLoadingData(true);
    try {
      const clientsResponse = await clientService.getAll();

      if (clientsResponse.success) {
        setClients(clientsResponse.data || []);
      }
      
      // Pays depuis API
      const paysResp = await paysService.getAll();
      if (paysResp.success && paysResp.data) {
        const mappedPays: Pays[] = (paysResp.data as any[]).map((p: any) => ({
          id: p.id ?? p.Id,
          nom: p.nomPays ?? p.NomPays ?? p.nom ?? '',
          code: p.codePays ?? p.CodePays ?? p.code ?? '',
        }));
        setPays(mappedPays);
      }
      // Statuts depuis API
      const statResp = await statutsService.getAll();
      if (statResp.success && statResp.data) {
        const mappedStatuts: Statuts[] = (statResp.data as any[]).map((s: any) => ({
          id: s.id ?? s.Id,
          description: s.nomStatut ?? s.descriptionStatut ?? s.description ?? '',
        }));
        setStatuts(mappedStatuts);
      }
      // Relations: Inventeurs / Déposants / Titulaires
      // Charger de larges pages pour remplir les sélecteurs
      const [invResp, depResp, titResp] = await Promise.all([
        inventeurService.getAll(1, 500),
        deposantService.getAll(1, 500),
        titulaireService.getAll(1, 500),
      ]);
  if (invResp.success && invResp.data) { setInventeurs(dedupeById(invResp.data as any)); }
  if (depResp.success && depResp.data) { setDeposants(dedupeById(depResp.data as any)); }
  if (titResp.success && titResp.data) { setTitulaires(dedupeById(titResp.data as any)); }
      
      // Charger les cabinets et leurs contacts
      await loadCabinetsAndContacts();
    } catch (error) {
      console.error('Erreur lors du chargement des données de référence:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Fonction pour charger les cabinets et leurs contacts associés
  const loadCabinetsAndContacts = async () => {
    try {
      // Charger les cabinets (client = seulement ses cabinets)
      const storedUser = sessionStorage.getItem('startingbloch_user');
      const role = storedUser ? (JSON.parse(storedUser).role || '').toLowerCase() : '';

      // Helper: charger tous les cabinets (toutes pages)
      const fetchAllCabinets = async (): Promise<Cabinet[]> => {
        if (role === 'client') {
          const r = await cabinetService.getMine();
          return r.success ? (r.data || []) : [];
        }
        const all: Cabinet[] = [];
        let page = 1;
        const pageSize = 200;
        // Boucle sur les pages jusqu'à ce qu'il n'y ait plus de résultats
        while (true) {
          const resp = await cabinetService.getAll(page, pageSize);
          if (!resp.success) break;
          const data = resp.data || [];
          all.push(...data);
          if (!resp.hasNextPage || data.length < pageSize) break;
          page += 1;
        }
        return all;
      };

      // Helper: charger tous les contacts (toutes pages)
      const fetchAllContacts = async (): Promise<Contact[]> => {
        const all: Contact[] = [];
        let page = 1;
        const pageSize = 500;
        while (true) {
          const resp = await contactService.getAll(page, pageSize);
          if (!resp.success) break;
          const data = resp.data || [];
          all.push(...data);
          if (!resp.hasNextPage || data.length < pageSize) break;
          page += 1;
        }
        return all;
      };

      const [allCabinets, allContacts] = await Promise.all([
        fetchAllCabinets(),
        fetchAllContacts()
      ]);

      setCabinets(allCabinets);

      // Grouper tous les contacts par cabinet
      const contactsMap: { [cabinetId: number]: Contact[] } = {};
      allContacts.forEach(contact => {
        if (contact.idCabinet) {
          if (!contactsMap[contact.idCabinet]) contactsMap[contact.idCabinet] = [];
          contactsMap[contact.idCabinet].push(contact);
        }
      });
      setCabinetContacts(contactsMap);
    } catch (error) {
      console.error('Erreur lors du chargement des cabinets:', error);
      setCabinets([]);
      setCabinetContacts({});
    }
  };

  const handleFinish = async (values: any) => {
    try {
      // Nettoyer les informations de dépôt en retirant les _tempId
      const cleanedInformationsDepot = informationsDepot.map(info => {
        const { _tempId, ...cleanInfo } = info;
        return cleanInfo;
      });

      const brevetData: CreateBrevetDto & { inventeursPays?: { inventeurId: number, paysIds: number[] }[], deposantsPays?: { deposantId: number, paysIds: number[] }[], titulairesPays?: { titulaireId: number, paysIds: number[] }[] } = {
         referenceFamille: values.referenceFamille,
         titre: values.titre,
         commentaire: values.commentaire,
         // Relations
         clientIds: values.clientIds || [],
         inventeurIds: values.inventeurIds || [],
         titulaireIds: values.titulaireIds || [],
         deposantIds: values.deposantIds || [],
         // Informations de dépôt
     informationsDepot: cleanedInformationsDepot.length > 0 ? cleanedInformationsDepot : undefined,
     // Mappings pays par entité (optionnels)
     inventeursPays: (values.inventeurIds || []).map((id: number) => ({ inventeurId: id, paysIds: inventeurPaysById[id] || [] })),
     deposantsPays: (values.deposantIds || []).map((id: number) => ({ deposantId: id, paysIds: deposantPaysById[id] || [] })),
     titulairesPays: (values.titulaireIds || []).map((id: number) => ({ titulaireId: id, paysIds: titulairePaysById[id] || [] })),
       };

      await onSubmit(brevetData);
      form.resetFields();
      setInformationsDepot([]);
      setFormData({});
      setCurrentStep('form');
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  // Soumission finale depuis l'écran récapitulatif
  const handleFinalSubmit = async () => {
    await handleFinish(formData);
  };

  // Passage du formulaire vers l'étape récap (validation + stockage)
  const handleFormSubmit = async (values: any) => {
    setFormData(values);
    setCurrentStep('recap');
  };

  const handleCancel = () => {
    form.resetFields();
    setInformationsDepot([]);
  // Réinitialisation spécifique aux cabinets devient inutile, tout est dans informationsDepot
  setInventeurPaysById({});
  setTitulairePaysById({});
  setDeposantPaysById({});
  setFormData({});
  setCurrentStep('form');
    onCancel();
  };

  // Fonctions pour gérer les informations de dépôt
  const addInformationDepot = () => {
    const tempId = `temp_${Date.now()}_${Math.floor(Math.random()*100000)}`;
    const newInfo: any = {
      idPays: undefined,
      idStatuts: undefined,
      numeroDepot: '',
      numeroPublication: '',
      numeroDelivrance: '',
      dateDepot: undefined,
      datePublication: undefined,
      dateDelivrance: undefined,
      licence: false,
      commentaire: '',
  cabinetsAnnuites: [],
  cabinetsProcedures: [],
      _tempId: tempId,
    };
    setInformationsDepot((prev) => [...prev, newInfo]);
  };

  const removeInformationDepot = (tempId: string) => {
    setInformationsDepot((prev) => prev.filter(info => info._tempId !== tempId));
  };

  const updateInformationDepot = (tempId: string, field: string, value: any) => {
    setInformationsDepot((prev) => prev.map(info => 
      info._tempId === tempId ? { ...info, [field]: value } : info
    ));
  };

  // Synchronise les sélections de pays des entités avec les pays autorisés (ceux des informations de dépôt)
  useEffect(() => {
    const allowed = new Set<number>(
      informationsDepot
        .map(i => i.idPays)
        .filter((v): v is number => typeof v === 'number')
    );
    if (allowed.size === 0) {
      // Aucun pays défini pour le brevet en cours → on ne garde aucune sélection par entité
      if (Object.keys(inventeurPaysById).length)
        setInventeurPaysById({});
      if (Object.keys(titulairePaysById).length)
        setTitulairePaysById({});
      if (Object.keys(deposantPaysById).length)
        setDeposantPaysById({});
      return;
    }
    const filterMap = (m: { [id: number]: number[] }) => {
      const next: { [id: number]: number[] } = {};
      for (const [k, arr] of Object.entries(m)) {
        const id = Number(k);
        const filtered = (arr || []).filter(pid => allowed.has(pid));
        if (filtered.length > 0) next[id] = filtered;
      }
      return next;
    };
    setInventeurPaysById(prev => filterMap(prev));
    setTitulairePaysById(prev => filterMap(prev));
    setDeposantPaysById(prev => filterMap(prev));
  }, [informationsDepot]);

  // Helpers cabinets par information de dépôt
  const addCabinetToInfo = (tempId: string, category: 'annuites' | 'procedures') => {
    setInformationsDepot(prev => prev.map(info => {
      if (info._tempId !== tempId) return info;
      const key = category === 'annuites' ? 'cabinetsAnnuites' : 'cabinetsProcedures';
      const arr = Array.isArray((info as any)[key]) ? (info as any)[key] : [];
      return { ...info, [key]: [...arr, { cabinetId: undefined, roles: [], contactIds: [] }] };
    }));
  };

  const removeCabinetFromInfo = (tempId: string, category: 'annuites' | 'procedures', index: number) => {
    setInformationsDepot(prev => {
      const next = prev.map(info => {
        if (info._tempId !== tempId) return info;
        const key = category === 'annuites' ? 'cabinetsAnnuites' : 'cabinetsProcedures';
        const arr = Array.isArray((info as any)[key]) ? (info as any)[key] : [];
        const filtered = [...arr.slice(0, index), ...arr.slice(index + 1)];
        return { ...info, [key]: filtered };
      });
      return next;
    });
  };

  const updateCabinetRow = (
    tempId: string,
    category: 'annuites' | 'procedures',
    index: number,
    field: 'cabinetId' | 'roles' | 'contactIds',
    value: any
  ) => {
    setInformationsDepot(prev => prev.map(info => {
      if (info._tempId !== tempId) return info;
      const key = category === 'annuites' ? 'cabinetsAnnuites' : 'cabinetsProcedures';
      const arr = Array.isArray((info as any)[key]) ? [...(info as any)[key]] : [];
      const row = { ...(arr[index] || { cabinetId: undefined, roles: [], contactIds: [] }) };
      // Si on change de cabinet, réinitialiser les contacts
      if (field === 'cabinetId') {
        row.cabinetId = value;
        row.contactIds = [];
      } else if (field === 'roles') {
        row.roles = value || [];
      } else if (field === 'contactIds') {
        row.contactIds = value || [];
      }
      arr[index] = row;
      return { ...info, [key]: arr };
    }));

    // Chargement lazy: si on sélectionne un cabinet sans contacts en cache, aller les chercher
    if (field === 'cabinetId' && typeof value === 'number' && value && !cabinetContacts[value]) {
      (async () => {
        try {
          const resp = await contactService.getByCabinet(value, 1, 5000);
          if (resp.success) {
            setCabinetContacts(prev => ({ ...prev, [value]: resp.data || [] }));
          }
        } catch (e) {
          console.error('Erreur chargement contacts du cabinet', value, e);
        }
      })();
    }
  };

  const getUsedCabinetIds = (info: any, category: 'annuites' | 'procedures', excludeIndex?: number): number[] => {
    const key = category === 'annuites' ? 'cabinetsAnnuites' : 'cabinetsProcedures';
    const arr = Array.isArray(info[key]) ? info[key] : [];
    return arr
      .map((r: any, i: number) => (excludeIndex !== undefined && i === excludeIndex) ? undefined : r.cabinetId)
      .filter((id: any) => typeof id === 'number');
  };

  // Fonctions pour gérer la création d'entités
  const handleInventeurCreated = async (inventeur: any) => {
    // Supporte différents wrappers: ApiResponse.Data, data, ou l'objet direct
    const created = inventeur?.Data ?? inventeur?.data ?? inventeur;
    const id = created?.Id ?? created?.id;
    const nom = created?.Nom ?? created?.nom ?? created?.nomInventeur;
    const prenom = created?.Prenom ?? created?.prenom ?? created?.prenomInventeur;

    if (id) {
      // Ajoute immédiatement l'ID dans la sélection du formulaire
      const current: number[] = form.getFieldValue('inventeurIds') || [];
      form.setFieldsValue({ inventeurIds: Array.from(new Set([...current, id])) });

      // Ajoute un item minimal dans la liste pour l'affichage instantané
      setInventeurs(prev => {
        const exists = prev.some(i => i.id === id);
        return exists ? prev : [...prev, { id, nomInventeur: nom || `Inventeur ${id}`, prenomInventeur: prenom, createdAt: '', updatedAt: '' } as any];
      });
    }

    // Rafraîchit ensuite les données de référence en arrière-plan
    await loadReferenceData();
  };

  const handleTitulaireCreated = async (titulaire: any) => {
    const created = titulaire?.Data ?? titulaire?.data ?? titulaire;
    const id = created?.Id ?? created?.id;
    const nom = created?.Nom ?? created?.nom ?? created?.nomTitulaire;

    if (id) {
      const current: number[] = form.getFieldValue('titulaireIds') || [];
      form.setFieldsValue({ titulaireIds: Array.from(new Set([...current, id])) });

      setTitulaires(prev => {
        const exists = prev.some(t => t.id === id);
        return exists ? prev : [...prev, { id, nomTitulaire: nom || `Titulaire ${id}`, createdAt: '', updatedAt: '' } as any];
      });
    }

    await loadReferenceData();
  };

  const handleDeposantCreated = async (deposant: any) => {
    const created = deposant?.Data ?? deposant?.data ?? deposant;
    const id = created?.Id ?? created?.id;
    const nom = created?.Nom ?? created?.nom ?? created?.nomDeposant;
    const prenom = created?.Prenom ?? created?.prenom ?? created?.prenomDeposant;

    if (id) {
      const current: number[] = form.getFieldValue('deposantIds') || [];
      form.setFieldsValue({ deposantIds: Array.from(new Set([...current, id])) });

      setDeposants(prev => {
        const exists = prev.some(d => d.id === id);
        return exists ? prev : [...prev, { id, nomDeposant: nom || `Déposant ${id}`, prenomDeposant: prenom, createdAt: '', updatedAt: '' } as any];
      });
    }

    await loadReferenceData();
  };

  // Construit les options d'un Select de pays pour une liste d'ids
  const buildCountryOptions = (ids: number[], keyPrefix: string, entityId: number) => {
    const nodes: React.ReactNode[] = [];
    const paysMap = new Map(pays.map(p => [p.id, p]));
    for (const pid of ids) {
      const p = paysMap.get(pid);
      if (p) {
        nodes.push(
          <Option key={`${keyPrefix}-${entityId}-p-${p.id}`} value={p.id}>
            {p.code} - {p.nom}
          </Option>
        );
      }
    }
    return nodes;
  };

  // Handlers séparés pour réduire la profondeur d'imbrication
  const onChangeInventeurIds = (ids: number[]) => {
    setInventeurPaysById(prev => {
      const next: { [id: number]: number[] } = {};
      ids.forEach(id => { next[id] = prev[id] || []; });
      return next;
    });
    form.setFieldsValue({ inventeurIds: ids });
  };

  const onChangeTitulaireIds = (ids: number[]) => {
    setTitulairePaysById(prev => {
      const next: { [id: number]: number[] } = {};
      ids.forEach(id => { next[id] = prev[id] || []; });
      return next;
    });
    form.setFieldsValue({ titulaireIds: ids });
  };

  const onChangeDeposantIds = (ids: number[]) => {
    setDeposantPaysById(prev => {
      const next: { [id: number]: number[] } = {};
      ids.forEach(id => { next[id] = prev[id] || []; });
      return next;
    });
    form.setFieldsValue({ deposantIds: ids });
  };

  const onChangeInventeurPays = (id: number, vals: number[]) => {
    setInventeurPaysById(prev => ({ ...prev, [id]: vals }));
  };
  const onChangeTitulairePays = (id: number, vals: number[]) => {
    setTitulairePaysById(prev => ({ ...prev, [id]: vals }));
  };
  const onChangeDeposantPays = (id: number, vals: number[]) => {
    setDeposantPaysById(prev => ({ ...prev, [id]: vals }));
  };

  // Rendu étape FORMULAIRE
  const renderFormStep = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormSubmit}
      autoComplete="off"
      initialValues={formData}
    >
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Informations générales" key="1">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="titre"
                  label="Titre du brevet"
                  rules={[
                    { required: true, message: 'Le titre du brevet est obligatoire' },
                    { max: 500, message: 'Le titre ne peut pas dépasser 500 caractères' }
                  ]}
                >
                  <Input
                    prefix={<FileProtectOutlined />}
                    placeholder="Titre descriptif du brevet"
                    maxLength={500}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="referenceFamille"
                  label="Référence famille"
                  rules={[
                    { max: 255, message: 'La référence ne peut pas dépasser 255 caractères' }
                  ]}
                >
                  <Input
                    placeholder="Référence de la famille de brevets"
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="commentaire"
                  label="Commentaire interne"
                >
                  <TextArea
                    placeholder="Commentaires internes sur le brevet"
                    rows={4}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Clients" key="2">
            <Form.Item
              name="clientIds"
              label="Clients associés"
              tooltip="Sélectionnez les clients propriétaires de ce brevet"
            >
              <Select
                mode="multiple"
                placeholder="Sélectionner les clients"
                loading={loadingData}
                showSearch
                value={selectedClientIds}
                onChange={(vals: number[]) => {
                  setSelectedClientIds(vals);
                  form.setFieldsValue({ clientIds: vals });
                  loadSuggestionsFromClients(vals);
                }}
              >
                {clients.map(client => (
                  <Option key={client.id} value={client.id}>
                    {client.nomClient}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Tabs.TabPane>

          {/* Déplacer Informations de dépôt ici (après Clients) */}
          <Tabs.TabPane tab="Informations de dépôt" key="3">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="dashed" 
                onClick={addInformationDepot}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                Ajouter une information de dépôt
              </Button>
            </div>

            {informationsDepot.map((info) => (
              <div key={info._tempId} style={{ 
                border: '1px solid #d9d9d9', 
                borderRadius: 6, 
                padding: 16, 
                marginBottom: 16,
                backgroundColor: '#fafafa'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 16 
                }}>
                  <h4 style={{ margin: 0 }}>Dépôt #{informationsDepot.findIndex(i => i._tempId === info._tempId) + 1}</h4>
                  <Button 
                    type="text" 
                    danger 
                    onClick={() => removeInformationDepot(info._tempId!)}
                    icon={<DeleteOutlined />}
                  />
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'block', marginBottom: 4 }}>Pays de dépôt</div>
                      <Select
                        placeholder="Sélectionner un pays"
                        value={info.idPays}
                        onChange={(value) => updateInformationDepot(info._tempId!, 'idPays', value)}
                        style={{ width: '100%' }}
                        showSearch
                      >
                        {pays.map(p => (
                          <Option key={p.id} value={p.id}>
                            {p.code} - {p.nom}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'block', marginBottom: 4 }}>Statut</div>
                      <Select
                        placeholder="Sélectionner un statut"
                        value={info.idStatuts}
                        onChange={(value) => updateInformationDepot(info._tempId!, 'idStatuts', value)}
                        style={{ width: '100%' }}
                      >
                        {statuts.map(s => (
                          <Option key={s.id} value={s.id}>
                            {s.description}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'block', marginBottom: 4 }}>Numéro de dépôt</div>
                      <Input
                        placeholder="Ex: FR2313456"
                        value={info.numeroDepot}
                        onChange={(e) => updateInformationDepot(info._tempId!, 'numeroDepot', e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'block', marginBottom: 4 }}>Numéro de publication</div>
                      <Input
                        placeholder="Numéro de publication"
                        value={info.numeroPublication}
                        onChange={(e) => updateInformationDepot(info._tempId!, 'numeroPublication', e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'block', marginBottom: 4 }}>Numéro de délivrance</div>
                      <Input
                        placeholder="Numéro de délivrance"
                        value={info.numeroDelivrance}
                        onChange={(e) => updateInformationDepot(info._tempId!, 'numeroDelivrance', e.target.value)}
                      />
                    </div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'block', marginBottom: 4 }}>Date de dépôt</div>
                      <DatePicker
                        placeholder="Date de dépôt"
                        value={info.dateDepot ? dayjs(info.dateDepot) : null}
                        onChange={(date) => updateInformationDepot(info._tempId!, 'dateDepot', date?.toISOString())}
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'block', marginBottom: 4 }}>Date de publication</div>
                      <DatePicker
                        placeholder="Date de publication"
                        value={info.datePublication ? dayjs(info.datePublication) : null}
                        onChange={(date) => updateInformationDepot(info._tempId!, 'datePublication', date?.toISOString())}
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'block', marginBottom: 4 }}>Date de délivrance</div>
                      <DatePicker
                        placeholder="Date de délivrance"
                        value={info.dateDelivrance ? dayjs(info.dateDelivrance) : null}
                        onChange={(date) => updateInformationDepot(info._tempId!, 'dateDelivrance', date?.toISOString())}
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'block', marginBottom: 4 }}>Licence accordée</div>
                      <Switch
                        checked={info.licence}
                        onChange={(checked) => updateInformationDepot(info._tempId!, 'licence', checked)}
                        checkedChildren="Oui"
                        unCheckedChildren="Non"
                      />
                    </div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'block', marginBottom: 4 }}>Commentaire</div>
                      <TextArea
                        placeholder="Commentaires sur ce dépôt"
                        value={info.commentaire}
                        onChange={(e) => updateInformationDepot(info._tempId!, 'commentaire', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </Col>
                </Row>

                {/* Cabinets par information de dépôt */}
                <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
                  <CabinetSection
                    title="Cabinets - Annuités"
                    category="annuites"
                    tempId={info._tempId!}
                    rows={(info as any).cabinetsAnnuites || []}
                    cabinets={cabinets}
                    cabinetContacts={cabinetContacts}
                    roleOptions={roleOptions}
                    onAdd={addCabinetToInfo}
                    onRemove={removeCabinetFromInfo}
                    onChangeRow={updateCabinetRow}
                    getUsedCabinetIds={getUsedCabinetIds}
                    info={info}
                    cabinetType={1}
                  />
                  <CabinetSection
                    title="Cabinets - Procédures"
                    category="procedures"
                    tempId={info._tempId!}
                    rows={(info as any).cabinetsProcedures || []}
                    cabinets={cabinets}
                    cabinetContacts={cabinetContacts}
                    roleOptions={roleOptions}
                    onAdd={addCabinetToInfo}
                    onRemove={removeCabinetFromInfo}
                    onChangeRow={updateCabinetRow}
                    getUsedCabinetIds={getUsedCabinetIds}
                    info={info}
                    cabinetType={2}
                  />
                </div>
              </div>
            ))}

            {informationsDepot.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: 32, 
                color: '#999',
                border: '1px dashed #d9d9d9',
                borderRadius: 6
              }}>
                Aucune information de dépôt ajoutée.
                <br />
                Cliquez sur le bouton ci-dessus pour ajouter des informations de dépôt par pays.
              </div>
            )}
          </Tabs.TabPane>

          <Tabs.TabPane tab="Inventeurs" key="4">
            {/* Sélecteurs de pays par inventeur sélectionné */}
            <div style={{ marginBottom: 16 }}>
              <Input.Search
                placeholder="Rechercher un inventeur par nom/prénom"
                allowClear
                value={searchInventeur}
                onChange={(e) => setSearchInventeur(e.target.value)}
                style={{ marginBottom: 12 }}
              />
              {/* Suggestions basées sur le(s) client(s) sélectionné(s) */}
              {loadingSuggestions ? (
                <div style={{ marginBottom: 8 }}>
                  <Spin size="small" /> <Text type="secondary">Chargement des suggestions…</Text>
                </div>
              ) : suggestedInventeurs.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">Déjà utilisés:&nbsp;</Text>
                  {(suggestedInventeurs || [])
                    .filter(inv => !(form.getFieldValue('inventeurIds') || []).includes(inv.id))
                    .slice(0, 20)
                    .map(inv => (
                      <Tag key={`sug-inv-${inv.id}`} color="blue" onClick={() => addInventeurSuggested(inv.id)} style={{ cursor: 'pointer', marginBottom: 6 }}>
                        {inv.prenomInventeur ? `${inv.prenomInventeur} ${inv.nomInventeur}` : inv.nomInventeur}
                      </Tag>
                  ))}
                </div>
              )}
              <Form.Item
                name="inventeurIds"
                label="Inventeurs associés"
                tooltip="Sélectionnez un ou plusieurs inventeurs"
              >
                <Select
                  mode="multiple"
                  placeholder="Sélectionner des inventeurs"
                  loading={loadingData}
                  showSearch
                  optionFilterProp="children"
                  onChange={onChangeInventeurIds}
                >
                  {uniqueBy(dedupeById(inventeurs), (inv) => normalize(`${(inv as any)?.prenomInventeur || ''} ${(inv as any)?.nomInventeur || ''}`.trim()))
                    .filter(inv => {
                      const q = normalize(searchInventeur);
                      const label = normalize(`${inv?.prenomInventeur || ''} ${inv?.nomInventeur || ''}`.trim());
                      return q ? label.includes(q) : true;
                    })
                    .map(inv => (
                    <Option key={inv.id} value={inv.id}>
                      {inv.prenomInventeur ? `${inv.prenomInventeur} ${inv.nomInventeur}` : inv.nomInventeur}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Button 
                type="dashed" 
                onClick={() => setCreateInventeurModalVisible(true)}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                Créer un nouvel inventeur
              </Button>
            </div>

            {/* Rendu des sélecteurs de pays pour chaque inventeur sélectionné */}
            {(form.getFieldValue('inventeurIds') || []).map((id: number) => {
              const inv = inventeurs.find(i => i.id === id);
              const selectedPaysIds = Array.from(new Set(informationsDepot.map(i => i.idPays).filter(Boolean) as number[]));
              return (
                <div key={`inv-${id}`} style={{ border: '1px solid #eee', borderRadius: 6, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                    Pays pour {inv?.prenomInventeur ? `${inv?.prenomInventeur} ${inv?.nomInventeur}` : inv?.nomInventeur}
                  </div>
                  <Select
                    mode="multiple"
                    placeholder="Sélectionner des pays"
                    style={{ width: '100%' }}
                    value={inventeurPaysById[id] || []}
                    onChange={(vals: number[]) => onChangeInventeurPays(id, vals)}
                  >
                    {buildCountryOptions(selectedPaysIds, 'inv', id)}
                  </Select>
                </div>
              );
            })}
          </Tabs.TabPane>

          <Tabs.TabPane tab="Titulaires" key="5">
            <div style={{ marginBottom: 16 }}>
              <Input.Search
                placeholder="Rechercher un titulaire"
                allowClear
                value={searchTitulaire}
                onChange={(e) => setSearchTitulaire(e.target.value)}
                style={{ marginBottom: 12 }}
              />
              {loadingSuggestions ? (
                <div style={{ marginBottom: 8 }}>
                  <Spin size="small" /> <Text type="secondary">Chargement des suggestions…</Text>
                </div>
              ) : suggestedTitulaires.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">Déjà utilisés:&nbsp;</Text>
                  {(suggestedTitulaires || [])
                    .filter(t => !(form.getFieldValue('titulaireIds') || []).includes(t.id))
                    .slice(0, 20)
                    .map(t => (
                      <Tag key={`sug-tit-${t.id}`} color="blue" onClick={() => addTitulaireSuggested(t.id)} style={{ cursor: 'pointer', marginBottom: 6 }}>
                        {t.nomTitulaire}
                      </Tag>
                  ))}
                </div>
              )}
              <Form.Item
                name="titulaireIds"
                label="Titulaires associés"
                tooltip="Sélectionnez un ou plusieurs titulaires"
              >
                <Select
                  mode="multiple"
                  placeholder="Sélectionner des titulaires"
                  loading={loadingData}
                  showSearch
                  optionFilterProp="children"
                  onChange={onChangeTitulaireIds}
                >
                  {uniqueBy(dedupeById(titulaires), (t) => normalize((t as any)?.nomTitulaire || ''))
                    .filter(t => {
                      const q = normalize(searchTitulaire);
                      const label = normalize(`${t?.nomTitulaire || ''}`.trim());
                      return q ? label.includes(q) : true;
                    })
                    .map(t => (
                    <Option key={t.id} value={t.id}>
                      {t.nomTitulaire}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Button 
                type="dashed" 
                onClick={() => setCreateTitulaireModalVisible(true)}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                Créer un nouveau titulaire
              </Button>
            </div>

            {(form.getFieldValue('titulaireIds') || []).map((id: number) => {
              const t = titulaires.find(tt => tt.id === id);
              const selectedPaysIds = Array.from(new Set(informationsDepot.map(i => i.idPays).filter(Boolean) as number[]));
              return (
                <div key={`tit-${id}`} style={{ border: '1px solid #eee', borderRadius: 6, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                    Pays pour {t?.nomTitulaire}
                  </div>
                  <Select
                    mode="multiple"
                    placeholder="Sélectionner des pays"
                    style={{ width: '100%' }}
                    value={titulairePaysById[id] || []}
                    onChange={(vals: number[]) => onChangeTitulairePays(id, vals)}
                  >
                    {buildCountryOptions(selectedPaysIds, 'tit', id)}
                  </Select>
                </div>
              );
            })}
          </Tabs.TabPane>

          <Tabs.TabPane tab="Déposants" key="6">
            <div style={{ marginBottom: 16 }}>
              <Input.Search
                placeholder="Rechercher un déposant par nom/prénom"
                allowClear
                value={searchDeposant}
                onChange={(e) => setSearchDeposant(e.target.value)}
                style={{ marginBottom: 12 }}
              />
              {loadingSuggestions ? (
                <div style={{ marginBottom: 8 }}>
                  <Spin size="small" /> <Text type="secondary">Chargement des suggestions…</Text>
                </div>
              ) : suggestedDeposants.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">Déjà utilisés:&nbsp;</Text>
                  {(suggestedDeposants || [])
                    .filter(d => !(form.getFieldValue('deposantIds') || []).includes(d.id))
                    .slice(0, 20)
                    .map(d => (
                      <Tag key={`sug-dep-${d.id}`} color="blue" onClick={() => addDeposantSuggested(d.id)} style={{ cursor: 'pointer', marginBottom: 6 }}>
                        {d.prenomDeposant ? `${d.prenomDeposant} ${d.nomDeposant}` : d.nomDeposant}
                      </Tag>
                  ))}
                </div>
              )}
              <Form.Item
                name="deposantIds"
                label="Déposants associés"
                tooltip="Sélectionnez un ou plusieurs déposants"
              >
                <Select
                  mode="multiple"
                  placeholder="Sélectionner des déposants"
                  loading={loadingData}
                  showSearch
                  optionFilterProp="children"
                  onChange={onChangeDeposantIds}
                >
                  {uniqueBy(dedupeById(deposants), (d) => normalize(`${(d as any)?.prenomDeposant || ''} ${(d as any)?.nomDeposant || ''}`.trim()))
                    .filter(d => {
                      const q = normalize(searchDeposant);
                      const label = normalize(`${d?.prenomDeposant || ''} ${d?.nomDeposant || ''}`.trim());
                      return q ? label.includes(q) : true;
                    })
                    .map(d => (
                    <Option key={d.id} value={d.id}>
                      {d.prenomDeposant ? `${d.prenomDeposant} ${d.nomDeposant}` : d.nomDeposant}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Button 
                type="dashed" 
                onClick={() => setCreateDeposantModalVisible(true)}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                Créer un nouveau déposant
              </Button>
            </div>

            {(form.getFieldValue('deposantIds') || []).map((id: number) => {
              const d = deposants.find(dd => dd.id === id);
              const selectedPaysIds = Array.from(new Set(informationsDepot.map(i => i.idPays).filter(Boolean) as number[]));
              return (
                <div key={`dep-${id}`} style={{ border: '1px solid #eee', borderRadius: 6, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                    Pays pour {d?.prenomDeposant ? `${d?.prenomDeposant} ${d?.nomDeposant}` : d?.nomDeposant}
                  </div>
                  <Select
                    mode="multiple"
                    placeholder="Sélectionner des pays"
                    style={{ width: '100%' }}
                    value={deposantPaysById[id] || []}
                    onChange={(vals: number[]) => onChangeDeposantPays(id, vals)}
                  >
                    {buildCountryOptions(selectedPaysIds, 'dep', id)}
                  </Select>
                </div>
              );
            })}
          </Tabs.TabPane>

          {/* Onglet Cabinets supprimé: la gestion est maintenant par Information de dépôt */}
        </Tabs>
      </Form>
  );

  // Rendu étape RECAPITULATIF
  const renderRecapStep = () => {
    const values = formData || {};
    const selectedClientNames = (values.clientIds || []).map((id: number) => clients.find(c => c.id === id)?.nomClient).filter(Boolean);
    const selectedInvs = (values.inventeurIds || []).map((id: number) => inventeurs.find(i => i.id === id)).filter(Boolean) as any[];
    const selectedDeps = (values.deposantIds || []).map((id: number) => deposants.find(d => d.id === id)).filter(Boolean) as any[];
    const selectedTits = (values.titulaireIds || []).map((id: number) => titulaires.find(t => t.id === id)).filter(Boolean) as any[];
    const paysById = new Map(pays.map(p => [p.id, p]));
    const statById = new Map(statuts.map(s => [s.id, s]));
  // Cabinets affichés par information de dépôt dans la section dédiée ci-dessous

    return (
      <div>
        <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
          Récapitulatif de création du brevet
        </Title>

        <Card title="Informations générales" style={{ marginBottom: 16 }}>
          <Descriptions bordered size="small">
            <Descriptions.Item label="Titre" span={3}>{values.titre || "-"}</Descriptions.Item>
            {values.referenceFamille && (
              <Descriptions.Item label="Référence" span={3}>{values.referenceFamille}</Descriptions.Item>
            )}
            {values.commentaire && (
              <Descriptions.Item label="Commentaire" span={3}>{values.commentaire}</Descriptions.Item>
            )}
            {selectedClientNames.length > 0 && (
              <Descriptions.Item label="Clients" span={3}>{selectedClientNames.join(', ')}</Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Card title={"Informations de dépôt (" + informationsDepot.length + ")"} style={{ marginBottom: 16 }}>
          {informationsDepot.length === 0 ? (
            <Text type="secondary">Aucune information de dépôt.</Text>
          ) : (
            informationsDepot.map((info, idx) => {
              const p = info.idPays ? paysById.get(info.idPays) : null;
              const s = info.idStatuts ? statById.get(info.idStatuts) : null;
              return (
                <Descriptions key={info._tempId || idx} bordered size="small" column={3} style={{ marginBottom: 12 }}>
                  <Descriptions.Item label="Pays" span={1}>{p ? `${p.code} - ${p.nom}` : '-'}</Descriptions.Item>
                  <Descriptions.Item label="Statut" span={1}><Tag>{s?.description || '-'}</Tag></Descriptions.Item>
                  <Descriptions.Item label="Licence" span={1}><Tag color={info.licence ? 'green' : 'red'}>{info.licence ? 'Oui' : 'Non'}</Tag></Descriptions.Item>
                  {info.numeroDepot && <Descriptions.Item label="N° Dépôt" span={1}>{info.numeroDepot}</Descriptions.Item>}
                  {info.numeroPublication && <Descriptions.Item label="N° Publication" span={1}>{info.numeroPublication}</Descriptions.Item>}
                  {info.numeroDelivrance && <Descriptions.Item label="N° Délivrance" span={1}>{info.numeroDelivrance}</Descriptions.Item>}
                  {info.dateDepot && <Descriptions.Item label="Date Dépôt" span={1}>{dayjs(info.dateDepot).format('DD/MM/YYYY')}</Descriptions.Item>}
                  {info.datePublication && <Descriptions.Item label="Date Publication" span={1}>{dayjs(info.datePublication).format('DD/MM/YYYY')}</Descriptions.Item>}
                  {info.dateDelivrance && <Descriptions.Item label="Date Délivrance" span={1}>{dayjs(info.dateDelivrance).format('DD/MM/YYYY')}</Descriptions.Item>}
                  {info.commentaire && <Descriptions.Item label="Commentaire" span={3}>{info.commentaire}</Descriptions.Item>}
                </Descriptions>
              );
            })
          )}
        </Card>

        <Card title={"Inventeurs (" + selectedInvs.length + ")"} style={{ marginBottom: 16 }}>
          {selectedInvs.length === 0 ? <Text type="secondary">Aucun inventeur</Text> : (
            <Descriptions bordered size="small">
              {selectedInvs.map((inv) => (
                <Descriptions.Item key={inv.id} label={inv.prenomInventeur ? `${inv.prenomInventeur} ${inv.nomInventeur}` : inv.nomInventeur} span={3}>
                  {(inventeurPaysById[inv.id] || []).map((pid) => {
                    const p = paysById.get(pid); return p ? <Tag key={`inv-${inv.id}-p-${p.id}`}>{p.code} - {p.nom}</Tag> : null;
                  })}
                </Descriptions.Item>
              ))}
            </Descriptions>
          )}
        </Card>

        <Card title={"Titulaires (" + selectedTits.length + ")"} style={{ marginBottom: 16 }}>
          {selectedTits.length === 0 ? <Text type="secondary">Aucun titulaire</Text> : (
            <Descriptions bordered size="small">
              {selectedTits.map((t) => (
                <Descriptions.Item key={t.id} label={t.nomTitulaire} span={3}>
                  {(titulairePaysById[t.id] || []).map((pid) => {
                    const p = paysById.get(pid); return p ? <Tag key={`tit-${t.id}-p-${p.id}`}>{p.code} - {p.nom}</Tag> : null;
                  })}
                </Descriptions.Item>
              ))}
            </Descriptions>
          )}
        </Card>

        <Card title={"Déposants (" + selectedDeps.length + ")"} style={{ marginBottom: 16 }}>
          {selectedDeps.length === 0 ? <Text type="secondary">Aucun déposant</Text> : (
            <Descriptions bordered size="small">
              {selectedDeps.map((d) => (
                <Descriptions.Item key={d.id} label={d.prenomDeposant ? `${d.prenomDeposant} ${d.nomDeposant}` : d.nomDeposant} span={3}>
                  {(deposantPaysById[d.id] || []).map((pid) => {
                    const p = paysById.get(pid); return p ? <Tag key={`dep-${d.id}-p-${p.id}`}>{p.code} - {p.nom}</Tag> : null;
                  })}
                </Descriptions.Item>
              ))}
            </Descriptions>
          )}
        </Card>

        <Card title="Cabinets par information de dépôt" style={{ marginBottom: 8 }}>
          {informationsDepot.length === 0 ? (
            <Text type="secondary">Aucune information de dépôt.</Text>
          ) : (
            informationsDepot.map((info, idx) => {
              const p = info.idPays ? paysById.get(info.idPays) : null;
              const title = p ? `${p.code} - ${p.nom}` : `Dépôt ${idx + 1}`;
              return (
                <div key={info._tempId || idx} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed #eee' }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
                  <RecapCabinetList title="Annuités" rows={(info as any).cabinetsAnnuites || []} cabinets={cabinets} cabinetContacts={cabinetContacts} />
                  <RecapCabinetList title="Procédures" rows={(info as any).cabinetsProcedures || []} cabinets={cabinets} cabinetContacts={cabinetContacts} />
                </div>
              );
            })
          )}
        </Card>

        <div style={{ textAlign: 'center', color: '#666' }}>
          <Text>
            Vérifiez soigneusement ces informations avant de créer le brevet.
          </Text>
        </div>
      </div>
    );
  };

  return (
    <Modal
      title={currentStep === 'form' ? "Ajouter un nouveau brevet" : "Confirmer la création"}
      open={visible}
      onCancel={handleCancel}
  maskClosable={false}
  keyboard={false}
      width={900}
      footer={
        currentStep === 'form' ? [
          <Button key="cancel" onClick={handleCancel}>Annuler</Button>,
          <Button key="next" type="primary" onClick={() => form.submit()}>Suivant - Récapitulatif</Button>
        ] : [
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => setCurrentStep('form')}>Retour au formulaire</Button>,
          <Button key="cancel" onClick={handleCancel}>Annuler</Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleFinalSubmit} icon={<CheckCircleOutlined />}>Créer le brevet</Button>
        ]
      }
    >
      {currentStep === 'form' ? renderFormStep() : renderRecapStep()}

      {/* Modales de création d'entités */}
      <CreateInventeurModal
        visible={createInventeurModalVisible}
        onCancel={() => setCreateInventeurModalVisible(false)}
  onSuccess={handleInventeurCreated}
  existing={inventeurs}
  onDuplicate={handleInventeurCreated}
      />

      <CreateTitulaireModal
        visible={createTitulaireModalVisible}
        onCancel={() => setCreateTitulaireModalVisible(false)}
  onSuccess={handleTitulaireCreated}
  existing={titulaires}
  onDuplicate={handleTitulaireCreated}
      />

      <CreateDeposantModal
        visible={createDeposantModalVisible}
        onCancel={() => setCreateDeposantModalVisible(false)}
  onSuccess={handleDeposantCreated}
  existing={deposants}
  onDuplicate={handleDeposantCreated}
      />
    </Modal>
  );
};

export default AddBrevetModal;
