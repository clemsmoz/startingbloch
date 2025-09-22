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
import { Modal, Form, Input, Select, Row, Col, Tabs, Button, DatePicker, Switch, Card, Descriptions, Tag, Typography, Spin, message } from 'antd';
import { FileProtectOutlined, PlusOutlined, DeleteOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { CreateBrevetDto, Client, Contact, Pays, Statuts, Cabinet, CreateInformationDepotDto, Inventeur, Deposant, Titulaire } from '../../types';
import { clientService, contactService, cabinetService, paysService, statutsService, inventeurService, deposantService, titulaireService, brevetService } from '../../services';
import CreateInventeurModal from './CreateInventeurModal';
import CreateTitulaireModal from './CreateTitulaireModal';
import CreateDeposantModal from './CreateDeposantModal';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import AddClientModal from './AddClientModal';
import AddCabinetModal from './AddCabinetModal';

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
  const { t } = useTranslation();
  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 12, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h4 style={{ margin: 0 }}>{title}</h4>
        <Button size="small" type="dashed" onClick={() => onAdd(tempId, category)} icon={<PlusOutlined />}>{t('actions.add')}</Button>
      </div>
  {((rows ?? []).length === 0) && (
        <Text type="secondary">{t('brevets.cabinet.noneForCategory')}</Text>
      )}
  {(rows ?? []).map((row: CabinetRow, idx: number) => {
        const usedIds = getUsedCabinetIds(info, category, idx);
        const filteredCabinets = cabinets.filter(c => c.type === cabinetType && !usedIds.includes(c.id));
  const contacts = row.cabinetId ? (cabinetContacts[row.cabinetId] ?? []) : [];
        const currentCabinet = row.cabinetId ? cabinets.find(c => c.id === row.cabinetId) : undefined;
        const cabinetOptions = currentCabinet ? [currentCabinet, ...filteredCabinets.filter(c => c.id !== currentCabinet.id)] : filteredCabinets;

        return (
          <div key={`${category}-${tempId}-${idx}`} style={{ borderTop: '1px dashed #eee', paddingTop: 8, marginTop: 8 }}>
            <Row gutter={8}>
              <Col span={8}>
                <div style={{ marginBottom: 8 }}>{t('brevets.labels.cabinet')}</div>
                <Select
                  placeholder={t('brevets.placeholders.chooseCabinet')}
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
                <div style={{ marginBottom: 8 }}>{t('brevets.labels.roles')}</div>
                <Select
                        showSearch
                        // Permettre la recherche par texte sur le libellé (children/label)
                        optionFilterProp="children"
                        filterOption={(input, option) => {
                          // option peut être typé différemment selon la version d'antd — utiliser any de manière localisée
                          const opt: any = option as any;
                          const text = String(opt.label ?? opt.children ?? '');
                          return text.toLowerCase().includes(String(input).toLowerCase());
                        }}
                  placeholder={t('brevets.placeholders.selectRoles')}
                  mode="multiple"
                  value={row.roles ?? []}
                  onChange={(vals) => onChangeRow(tempId, category, idx, 'roles', vals)}
                  style={{ width: '100%' }}
                  options={roleOptions}
                />
              </Col>
              <Col span={7}>
                <div style={{ marginBottom: 8 }}>{t('brevets.labels.contacts')}</div>
                <Select
                  mode="multiple"
                  placeholder={t('brevets.placeholders.selectContacts')}
                  value={row.contactIds ?? []}
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

// Component used in the recap view to list cabinets per information de dépôt
const RecapCabinetList: React.FC<{ title: string; rows: any[]; cabinets: Cabinet[]; cabinetContacts: { [cabinetId: number]: Contact[] } }> = ({ title, rows, cabinets, cabinetContacts }) => {
  const { t } = useTranslation();
  return (
    <div>
        {((rows ?? []).length === 0) ? (
        <Text type="secondary">{t('brevets.recap.noCabinet')}</Text>
      ) : (
        <ul>
          {rows.map((row: any, i: number) => {
            const cab = cabinets.find(c => c.id === row.cabinetId);
            const labels = (row.contactIds ?? []).map((cid: number) => {
              const ct = (row.cabinetId ? (cabinetContacts[row.cabinetId] ?? []) : []).find((c: Contact) => c.id === cid);
              return ct ? `${ct.prenom ?? ''} ${ct.nom ?? ''}`.trim() : t('contacts.fallbackId', { id: cid });
            }).filter((v: any): v is string => Boolean(v));
            const rawRoles = (row as any).roles;
            const rolesArr = Array.isArray(rawRoles) ? rawRoles : (rawRoles ? [rawRoles] : []);
            const roles = rolesArr.map((r: any) => String(r)).join(', ');
            return (
              <li key={`rec-${title}-${i}`}>
                <Text strong>{cab?.nomCabinet ?? t('brevets.labels.unknownCabinet')}</Text>
                {roles ? <span> — {t('brevets.labels.roles')}: {roles}</span> : null}
                {labels.length ? <span> — {t('brevets.labels.contacts')}: {labels.join(', ')}</span> : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const AddBrevetModal: React.FC<AddBrevetModalProps & { editing?: boolean; initialValues?: any; title?: string; submitText?: string }> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
  preselectedClientIds,
  editing = false,
  initialValues = undefined,
  title,
  submitText
}) => {
  const { t } = useTranslation();
  // Resolve default title and submit text using i18n so hooks can be used
  const modalTitleDefault = editing ? t('brevets.modals.edit.title') : t('brevets.modals.add.title');
  const submitTextDefault = editing ? t('brevets.modals.edit.submit') : t('brevets.modals.add.submit');
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
  const [selectedClientIds, setSelectedClientIds] = useState<number[]>(preselectedClientIds ?? []);

  // Pays par entité (sélection dédiée par inventeur / déposant / titulaire)
  const [inventeurPaysById, setInventeurPaysById] = useState<{ [id: number]: number[] }>({});
  const [titulairePaysById, setTitulairePaysById] = useState<{ [id: number]: number[] }>({});
  const [deposantPaysById, setDeposantPaysById] = useState<{ [id: number]: number[] }>({});

  // Options de rôles pour les cabinets par information de dépôt
  const roleOptions = [
  { label: t('brevets.roles.first'), value: 'premier' },
  { label: t('brevets.roles.second'), value: 'deuxieme' },
  { label: t('brevets.roles.third'), value: 'troisieme' },
  ];

  // États pour les modales de création
  const [createInventeurModalVisible, setCreateInventeurModalVisible] = useState(false);
  const [createTitulaireModalVisible, setCreateTitulaireModalVisible] = useState(false);
  const [createDeposantModalVisible, setCreateDeposantModalVisible] = useState(false);

  const [informationsDepot, setInformationsDepot] = useState<(CreateInformationDepotDto & { _tempId?: string })[]>([]);
  const [addClientModalVisible, setAddClientModalVisible] = useState(false);
  const [addCabinetModalVisibleForInfo, setAddCabinetModalVisibleForInfo] = useState<string | null>(null);

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
      setCurrentStep('form');

      // Charger les données de référence puis appliquer d'éventuelles valeurs initiales
      (async () => {
        await loadReferenceData();

        // Pré-sélectionner le(s) client(s) si fourni via prop
        if (Array.isArray(preselectedClientIds) && preselectedClientIds.length > 0) {
          form.setFieldsValue({ clientIds: preselectedClientIds });
          setSelectedClientIds(preselectedClientIds);
          loadSuggestionsFromClients(preselectedClientIds).catch(() => {});
        }

        // Si édition, préremplir le formulaire
        if (editing && initialValues) {
          try {
            const iv = { ...initialValues };
            // Convertir les dates si nécessaire
            if (iv.dateDepot) iv.dateDepot = dayjs(iv.dateDepot);
            if (iv.datePublication) iv.datePublication = dayjs(iv.datePublication);
            if (iv.dateDelivrance) iv.dateDelivrance = dayjs(iv.dateDelivrance);
            // set form fields
            form.setFieldsValue(iv);

            // informationsDepot -> respecter structure interne
            if (Array.isArray(iv.informationsDepot)) {
              const infos = iv.informationsDepot.map((i: any) => ({ ...i, _tempId: i._tempId ?? `temp_init_${Date.now()}_${Math.floor(Math.random()*10000)}` }));
              setInformationsDepot(infos);
            }

            if (Array.isArray(iv.clientIds)) {
              setSelectedClientIds(iv.clientIds);
              loadSuggestionsFromClients(iv.clientIds).catch(() => {});
            }

            // Pays par entité
            if (Array.isArray(iv.inventeursPays)) {
              const map: { [id:number]: number[] } = {};
              iv.inventeursPays.forEach((p: any) => { if (p && typeof p.inventeurId !== 'undefined') map[p.inventeurId] = p.paysIds ?? []; });
              setInventeurPaysById(map);
            }
            if (Array.isArray(iv.deposantsPays)) {
              const map: { [id:number]: number[] } = {};
              iv.deposantsPays.forEach((p: any) => { if (p && typeof p.deposantId !== 'undefined') map[p.deposantId] = p.paysIds ?? []; });
              setDeposantPaysById(map);
            }
            if (Array.isArray(iv.titulairesPays)) {
              const map: { [id:number]: number[] } = {};
              iv.titulairesPays.forEach((p: any) => { if (p && typeof p.titulaireId !== 'undefined') map[p.titulaireId] = p.paysIds ?? []; });
              setTitulairePaysById(map);
            }
          } catch (e) {
            console.error('Erreur lors du préremplissage:', e);
          }
        }
      })();
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
  const normalize = (s?: string) => (s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
  const role = storedUser ? ((JSON.parse(storedUser).role ?? '') as string).toLowerCase() : '';

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
          const data = resp.data ?? [];
          const filtered = data.filter((b: any) => {
            const cids = [b.clientId, ...((b.clients ?? []).map((c: any) => c?.Id ?? c?.id).filter(Boolean))].filter(Boolean);
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
  (b.inventeurs ?? b.Inventeurs ?? []).forEach((x: any) => { const m = mapInventeurFromAny(x); if (m) invs.push(m); });
  (b.deposants ?? b.Deposants ?? []).forEach((x: any) => { const m = mapDeposantFromAny(x); if (m) deps.push(m); });
  (b.titulaires ?? b.Titulaires ?? []).forEach((x: any) => { const m = mapTitulaireFromAny(x); if (m) tits.push(m); });
      });

      const uniqueInvs = dedupeById(invs);
      const uniqueDeps = dedupeById(deps);
      const uniqueTits = dedupeById(tits);

      setSuggestedInventeurs(uniqueInvs);
      setSuggestedDeposants(uniqueDeps);
      setSuggestedTitulaires(uniqueTits);

      // Assure que ces suggestions existent aussi dans les listes pour affichage
  setInventeurs((prev) => dedupeById([...(prev ?? []), ...uniqueInvs] as any));
  setDeposants((prev) => dedupeById([...(prev ?? []), ...uniqueDeps] as any));
  setTitulaires((prev) => dedupeById([...(prev ?? []), ...uniqueTits] as any));
    } catch (e) {
      console.error('Erreur chargement des suggestions clients:', e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Ajout rapide depuis une suggestion
  const addInventeurSuggested = (id: number) => {
  const current: number[] = form.getFieldValue('inventeurIds') ?? [];
    if (!current.includes(id)) {
      onChangeInventeurIds([...current, id]);
    }
  };
  const addDeposantSuggested = (id: number) => {
  const current: number[] = form.getFieldValue('deposantIds') ?? [];
    if (!current.includes(id)) {
      onChangeDeposantIds([...current, id]);
    }
  };
  const addTitulaireSuggested = (id: number) => {
  const current: number[] = form.getFieldValue('titulaireIds') ?? [];
    if (!current.includes(id)) {
      onChangeTitulaireIds([...current, id]);
    }
  };

  const loadReferenceData = async () => {
    setLoadingData(true);
    try {
      const clientsResponse = await clientService.getAll();

      if (clientsResponse.success) {
        setClients(clientsResponse.data ?? []);
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

  // Handlers pour création de client/cabinet depuis la modal AddBrevet
  const handleClientCreated = async (createdClient: any) => {
    const client = createdClient?.Data ?? createdClient?.data ?? createdClient;
    const id = client?.Id ?? client?.id;
    if (id) {
      // ajouter à la liste de clients et sélectionner
      setClients(prev => {
        const exists = prev.some(c => c.id === id);
  // Normaliser le nom en tenant compte des variantes PascalCase/CamelCase
  const name = client?.nomClient ?? client?.NomClient ?? client?.nom ?? client?.Nom ?? `Client ${id}`;
  const next = exists ? prev : [...prev, { id, nomClient: name } as any];
        return next;
      });
      // mettre à jour le formulaire pour sélectionner ce client
  const current: number[] = form.getFieldValue('clientIds') ?? [];
      const newVals = Array.from(new Set([...current, id]));
      form.setFieldsValue({ clientIds: newVals });
      setSelectedClientIds(newVals);
      // rafraîchir suggestions
      loadSuggestionsFromClients(newVals).catch(() => {});
      // Récupérer l'objet complet côté serveur pour obtenir le nom exact (évite le label temporaire "Client {id}")
      try {
        const fullResp = await clientService.getById(Number(id));
  const full: any = (fullResp as any)?.data ?? fullResp;
        const realName = full?.nomClient ?? full?.NomClient ?? full?.nom ?? full?.Nom;
        if (realName) {
          setClients(prev => prev.map(c => c.id === id ? { ...c, nomClient: realName } : c));
        }
      } catch (e) {
        // ignore - on a déjà un fallback name
      }
    }
    setAddClientModalVisible(false);
  };

  const handleCabinetCreated = async (createdCabinet: any, tempId: string | null) => {
    const cab = createdCabinet?.Data ?? createdCabinet?.data ?? createdCabinet;
    const id = cab?.Id ?? cab?.id;
    if (id) {
      // Normaliser le nom pour s'assurer que l'UI affiche correctement le label (nomCabinet)
      const nom = cab?.NomCabinet ?? cab?.nomCabinet ?? cab?.nom ?? cab?.Nom ?? cab?.name ?? `Cabinet ${id}`;
      const normalized = { id, nomCabinet: nom, ...cab } as any;
      // ajouter au state cabinets
      setCabinets(prev => {
        const exists = prev.some(c => c.id === id);
        return exists ? prev : [...prev, normalized];
      });
      // si modal ouverte pour une informationDepot précise, ajouter une ligne cabinet à cette info et sélectionner
      if (tempId) {
        // Déterminer la catégorie à partir du type du cabinet (Type=1 => annuites, Type=2 => procedures)
        const createdType = (cab as any)?.Type ?? (cab as any)?.type ?? (normalized as any)?.Type ?? (normalized as any)?.type ?? 1;
        const key = createdType === 2 ? 'cabinetsProcedures' : 'cabinetsAnnuites';
        setInformationsDepot(prev => prev.map(info => {
          if (info._tempId !== tempId) return info;
          const arr = Array.isArray((info as any)[key]) ? (info as any)[key] : [];
          return { ...info, [key]: [...arr, { cabinetId: id, roles: [], contactIds: [] }] };
        }));
      }
      // Tenter de récupérer l'objet complet côté serveur pour garantir les champs et charger les contacts
      try {
        const fullResp = await cabinetService.getById(Number(id));
        const full: any = (fullResp as any)?.data ?? fullResp;
        if (full && (full.id ?? full.Id)) {
          const realId = full.id ?? full.Id;
          const realName = full.nomCabinet ?? full.NomCabinet ?? full.nom ?? full.Nom ?? nom;
          setCabinets(prev => prev.map(c => c.id === realId ? { ...c, ...{ id: realId, nomCabinet: realName, ...full } } : c));
          // Charger les contacts du cabinet fraîchement créé
          try {
            const contactsResp = await contactService.getByCabinet(Number(realId), 1, 500);
            if (contactsResp && contactsResp.success) {
              setCabinetContacts(prev => ({ ...prev, [realId]: contactsResp.data ?? [] }));
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        // fallback: recharger la liste complète des cabinets
        try { await loadCabinetsAndContacts(); } catch (_) { /* ignore */ }
      }
    }
    setAddCabinetModalVisibleForInfo(null);
  };

  // Fonction pour charger les cabinets et leurs contacts associés
  const loadCabinetsAndContacts = async () => {
    try {
      // Charger les cabinets (client = seulement ses cabinets)
      const storedUser = sessionStorage.getItem('startingbloch_user');
  const role = storedUser ? ((JSON.parse(storedUser).role ?? '') as string).toLowerCase() : '';

      // Helper: charger tous les cabinets (toutes pages)
      const fetchAllCabinets = async (): Promise<Cabinet[]> => {
        if (role === 'client') {
          const r = await cabinetService.getMine();
          return r.success ? (r.data ?? []) : [];
        }
        const all: Cabinet[] = [];
        let page = 1;
        const pageSize = 200;
        // Boucle sur les pages jusqu'à ce qu'il n'y ait plus de résultats
        while (true) {
          const resp = await cabinetService.getAll(page, pageSize);
          if (!resp.success) break;
          const data = resp.data ?? [];
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
          const data = resp.data ?? [];
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
         clientIds: values.clientIds ?? [],
         inventeurIds: values.inventeurIds ?? [],
         titulaireIds: values.titulaireIds ?? [],
         deposantIds: values.deposantIds ?? [],
         // Informations de dépôt
     informationsDepot: cleanedInformationsDepot.length > 0 ? cleanedInformationsDepot : undefined,
     // Mappings pays par entité (optionnels)
  inventeursPays: (values.inventeurIds ?? []).map((id: number) => ({ inventeurId: id, paysIds: inventeurPaysById[id] ?? [] })),
  deposantsPays: (values.deposantIds ?? []).map((id: number) => ({ deposantId: id, paysIds: deposantPaysById[id] ?? [] })),
  titulairesPays: (values.titulaireIds ?? []).map((id: number) => ({ titulaireId: id, paysIds: titulairePaysById[id] ?? [] })),
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
  // Préfixer pour que la nouvelle information apparaisse au-dessus des précédentes
  setInformationsDepot((prev) => {
    // Toujours ajouter en tête (nouvelle information au-dessus)
    return [newInfo, ...prev];
  });
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
  const filtered = (arr ?? []).filter(pid => allowed.has(pid));
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
  const row = { ...(arr[index] ?? { cabinetId: undefined, roles: [], contactIds: [] }) };
      // Si on change de cabinet, réinitialiser les contacts
      if (field === 'cabinetId') {
        row.cabinetId = value;
        row.contactIds = [];
      } else if (field === 'roles') {
  row.roles = value ?? [];
      } else if (field === 'contactIds') {
  row.contactIds = value ?? [];
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
            setCabinetContacts(prev => ({ ...prev, [value]: resp.data ?? [] }));
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
  const current: number[] = form.getFieldValue('inventeurIds') ?? [];
      form.setFieldsValue({ inventeurIds: Array.from(new Set([...current, id])) });

      // Ajoute un item minimal dans la liste pour l'affichage instantané
      setInventeurs(prev => {
        const exists = prev.some(i => i.id === id);
  return exists ? prev : [...prev, { id, nomInventeur: nom ?? `Inventeur ${id}`, prenomInventeur: prenom, createdAt: '', updatedAt: '' } as any];
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
  const current: number[] = form.getFieldValue('titulaireIds') ?? [];
      form.setFieldsValue({ titulaireIds: Array.from(new Set([...current, id])) });

      setTitulaires(prev => {
        const exists = prev.some(t => t.id === id);
  return exists ? prev : [...prev, { id, nomTitulaire: nom ?? `Titulaire ${id}`, createdAt: '', updatedAt: '' } as any];
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
  const current: number[] = form.getFieldValue('deposantIds') ?? [];
      form.setFieldsValue({ deposantIds: Array.from(new Set([...current, id])) });

      setDeposants(prev => {
        const exists = prev.some(d => d.id === id);
  return exists ? prev : [...prev, { id, nomDeposant: nom ?? `Déposant ${id}`, prenomDeposant: prenom, createdAt: '', updatedAt: '' } as any];
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
  ids.forEach(id => { next[id] = prev[id] ?? []; });
      return next;
    });
    form.setFieldsValue({ inventeurIds: ids });
  };

  const onChangeTitulaireIds = (ids: number[]) => {
    setTitulairePaysById(prev => {
      const next: { [id: number]: number[] } = {};
  ids.forEach(id => { next[id] = prev[id] ?? []; });
      return next;
    });
    form.setFieldsValue({ titulaireIds: ids });
  };

  const onChangeDeposantIds = (ids: number[]) => {
    setDeposantPaysById(prev => {
      const next: { [id: number]: number[] } = {};
  ids.forEach(id => { next[id] = prev[id] ?? []; });
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
          <Tabs.TabPane tab={t('brevets.tabs.general')} key="1">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="titre"
                  label={t('brevets.form.title')}
                  rules={[
                    { max: 500, message: t('brevets.form.titleMax') }
                  ]}
                >
                  <Input
                    prefix={<FileProtectOutlined />}
                    placeholder={t('brevets.placeholders.title')}
                    maxLength={500}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="referenceFamille"
                  label={t('brevets.form.familyReference')}
                  rules={[
                    { max: 255, message: t('brevets.form.familyReferenceMax') }
                  ]}
                >
                  <Input
                    placeholder={t('brevets.placeholders.familyReference')}
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="commentaire"
                  label={t('brevets.form.internalComment')}
                >
                  <TextArea
                    placeholder={t('brevets.placeholders.internalComment')}
                    rows={4}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane tab={t('brevets.tabs.clients')} key="2">
            <Form.Item
              name="clientIds"
              label={t('brevets.labels.clients')}
              tooltip={t('brevets.tooltips.selectClients')}
            >
              <Select
                mode="multiple"
                placeholder={t('brevets.placeholders.selectClients')}
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
            <div style={{ marginTop: 8 }}>
              <Button
                type="dashed"
                onClick={() => setAddClientModalVisible(true)}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                {t('brevets.actions.createClient')}
              </Button>
            </div>
          </Tabs.TabPane>

          {/* Déplacer Informations de dépôt ici (après Clients) */}
          <Tabs.TabPane tab={t('brevets.tabs.depositInfos')} key="3">
            <div style={{ marginBottom: 16 }}>
              <Button 
                  type="dashed" 
                  onClick={addInformationDepot}
                  icon={<PlusOutlined />}
                  style={{ width: '100%' }}
                >
                  {t('brevets.actions.addDepositInfo')}
                </Button>
            </div>

            {informationsDepot.map((info, idx) => (
              <div key={info._tempId}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}>
                  <Button size="small" onClick={() => setAddCabinetModalVisibleForInfo(info._tempId ?? null)} icon={<PlusOutlined />}>{`${t('actions.create')} ${t('menu.cabinets')}`}</Button>
                </div>
              <div style={{ 
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
                  <h4 style={{ margin: 0 }}>{t('deposit.titleWithIndex', { index: informationsDepot.length - idx })}</h4>
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
            <div style={{ display: 'block', marginBottom: 4 }}>{t('deposit.labels.country')}</div>
                <Select
            placeholder={t('deposit.placeholders.selectCountry')}
                        value={info.idPays}
                        onChange={(value) => updateInformationDepot(info._tempId!, 'idPays', value)}
                        style={{ width: '100%' }}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => {
                          const opt: any = option as any;
                          const text = String(opt.label ?? opt.children ?? '');
                          // utiliser la même normalisation que le reste du composant (accents-insensible)
                          const normalizeLocal = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[\u0300-\u036f]/g, '');
                          try {
                            return normalizeLocal(text).includes(normalizeLocal(String(input ?? '')));
                          } catch {
                            return text.toLowerCase().includes(String(input ?? '').toLowerCase());
                          }
                        }}
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
                      <div style={{ display: 'block', marginBottom: 4 }}>{t('deposit.labels.status')}</div>
                      <Select
                        placeholder={t('deposit.placeholders.selectStatus')}
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
                      <div style={{ display: 'block', marginBottom: 4 }}>{t('deposit.labels.depositNumber')}</div>
                      <Input
                        placeholder={t('deposit.placeholders.depositExample')}
                        value={info.numeroDepot}
                        onChange={(e) => updateInformationDepot(info._tempId!, 'numeroDepot', e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'block', marginBottom: 4 }}>{t('deposit.labels.publicationNumber')}</div>
                      <Input
                        placeholder={t('deposit.placeholders.publicationNumber')}
                        value={info.numeroPublication}
                        onChange={(e) => updateInformationDepot(info._tempId!, 'numeroPublication', e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'block', marginBottom: 4 }}>{t('deposit.labels.deliveryNumber')}</div>
                      <Input
                        placeholder={t('deposit.placeholders.deliveryNumber')}
                        value={info.numeroDelivrance}
                        onChange={(e) => updateInformationDepot(info._tempId!, 'numeroDelivrance', e.target.value)}
                      />
                    </div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'block', marginBottom: 4 }}>{t('deposit.labels.depositDate')}</div>
                      <DatePicker
                        placeholder={t('deposit.placeholders.depositDate')}
                        value={info.dateDepot ? dayjs(info.dateDepot) : null}
                        onChange={(date) => updateInformationDepot(info._tempId!, 'dateDepot', date?.toISOString())}
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'block', marginBottom: 4 }}>{t('deposit.labels.publicationDate')}</div>
                      <DatePicker
                        placeholder={t('deposit.placeholders.publicationDate')}
                        value={info.datePublication ? dayjs(info.datePublication) : null}
                        onChange={(date) => updateInformationDepot(info._tempId!, 'datePublication', date?.toISOString())}
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'block', marginBottom: 4 }}>{t('deposit.labels.deliveryDate')}</div>
                      <DatePicker
                        placeholder={t('deposit.placeholders.deliveryDate')}
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
                      <div style={{ display: 'block', marginBottom: 4 }}>{t('deposit.labels.licence')}</div>
                      <Switch
                        checked={info.licence}
                        onChange={(checked) => updateInformationDepot(info._tempId!, 'licence', checked)}
                        checkedChildren={t('common.yes')}
                        unCheckedChildren={t('common.no')}
                      />
                    </div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'block', marginBottom: 4 }}>{t('deposit.labels.comment')}</div>
                      <TextArea
                        placeholder={t('deposit.placeholders.comment')}
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
                    title={t('brevets.sections.annuities')}
                    category="annuites"
                    tempId={info._tempId!}
                    rows={(info as any).cabinetsAnnuites ?? []}
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
                    title={t('brevets.sections.procedures')}
                    category="procedures"
                    tempId={info._tempId!}
                    rows={(info as any).cabinetsProcedures ?? []}
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
                {t('deposit.noneAdded')}
                <br />
                {t('deposit.clickAddInstructions')}
              </div>
            )}
          </Tabs.TabPane>

          <Tabs.TabPane tab={t('brevets.tabs.inventors')} key="4">
            {/* Sélecteurs de pays par inventeur sélectionné */}
      <div style={{ marginBottom: 16 }}>
              {/* Suggestions basées sur le(s) client(s) sélectionné(s) */}
                {loadingSuggestions ? (
                <div style={{ marginBottom: 8 }}>
                  <Spin size="small" /> <Text type="secondary">{t('common.loadingSuggestions')}</Text>
                </div>
              ) : suggestedInventeurs.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">{t('brevets.suggested.alreadyUsed')}&nbsp;</Text>
                  {(suggestedInventeurs ?? [])
                    .filter(inv => !(form.getFieldValue('inventeurIds') ?? []).includes(inv.id))
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
                label={t('brevets.labels.inventorsAssociated')}
                tooltip={t('brevets.tooltips.selectInventors')}
              >
                  <Select
                    mode="multiple"
                    placeholder={t('brevets.placeholders.selectInventors')}
                  loading={loadingData}
                  showSearch
                  optionFilterProp="children"
                  onChange={onChangeInventeurIds}
                >
                  {uniqueBy(dedupeById(inventeurs), (inv) => normalize(`${(inv as any)?.prenomInventeur ?? ''} ${(inv as any)?.nomInventeur ?? ''}`.trim()))
                    .filter(inv => {
                      const q = normalize('');
                      const label = normalize(`${inv?.prenomInventeur ?? ''} ${inv?.nomInventeur ?? ''}`.trim());
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
                    {t('brevets.actions.createInventor')}
                </Button>
            </div>

            {/* Rendu des sélecteurs de pays pour chaque inventeur sélectionné */}
            {(form.getFieldValue('inventeurIds') ?? []).map((id: number) => {
              const inv = inventeurs.find(i => i.id === id);
              const selectedPaysIds = Array.from(new Set(informationsDepot.map(i => i.idPays).filter(Boolean) as number[]));
              return (
                <div key={`inv-${id}`} style={{ border: '1px solid #eee', borderRadius: 6, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                    Pays pour {inv?.prenomInventeur ? `${inv?.prenomInventeur} ${inv?.nomInventeur}` : inv?.nomInventeur}
                  </div>
                    <Select
                    mode="multiple"
                    placeholder={t('brevets.placeholders.selectCountries')}
                    style={{ width: '100%' }}
                    value={inventeurPaysById[id] ?? []}
                    onChange={(vals: number[]) => onChangeInventeurPays(id, vals)}
                  >
                    {buildCountryOptions(selectedPaysIds, 'inv', id)}
                  </Select>
                </div>
              );
            })}
          </Tabs.TabPane>

          <Tabs.TabPane tab={t('brevets.tabs.titulaires')} key="5">
            <div style={{ marginBottom: 16 }}>
              {loadingSuggestions ? (
                <div style={{ marginBottom: 8 }}>
                  <Spin size="small" /> <Text type="secondary">{t('common.loadingSuggestions')}</Text>
                </div>
              ) : suggestedTitulaires.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">{t('brevets.suggested.alreadyUsed')}&nbsp;</Text>
                  {(suggestedTitulaires ?? [])
                    .filter(t => !(form.getFieldValue('titulaireIds') ?? []).includes(t.id))
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
                label={t('brevets.labels.holdersAssociated')}
                tooltip={t('brevets.tooltips.selectTitulaires')}
              >
                <Select
                  mode="multiple"
                  placeholder={t('brevets.placeholders.selectTitulaires')}
                  loading={loadingData}
                  showSearch
                  optionFilterProp="children"
                  onChange={onChangeTitulaireIds}
                >
                  {uniqueBy(dedupeById(titulaires), (t) => normalize((t as any)?.nomTitulaire ?? ''))
                    .filter(t => {
                      const q = normalize('');
                      const label = normalize(`${t?.nomTitulaire ?? ''}`.trim());
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
                {t('brevets.actions.createTitulaire')}
              </Button>
            </div>

            {(form.getFieldValue('titulaireIds') ?? []).map((id: number) => {
              const titulaire = titulaires.find(tt => tt.id === id);
              const selectedPaysIds = Array.from(new Set(informationsDepot.map(i => i.idPays).filter(Boolean) as number[]));
              return (
                <div key={`tit-${id}`} style={{ border: '1px solid #eee', borderRadius: 6, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                    Pays pour {titulaire?.nomTitulaire}
                  </div>
                  <Select
                    mode="multiple"
                    placeholder={t('brevets.placeholders.selectCountries')}
                    style={{ width: '100%' }}
                    value={titulairePaysById[id] ?? []}
                    onChange={(vals: number[]) => onChangeTitulairePays(id, vals)}
                  >
                    {buildCountryOptions(selectedPaysIds, 'tit', id)}
                  </Select>
                </div>
              );
            })}
          </Tabs.TabPane>

          <Tabs.TabPane tab={t('brevets.tabs.depositants')} key="6">
            <div style={{ marginBottom: 16 }}>
              {loadingSuggestions ? (
                <div style={{ marginBottom: 8 }}>
                  <Spin size="small" /> <Text type="secondary">{t('common.loadingSuggestions')}</Text>
                </div>
              ) : suggestedDeposants.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">{t('brevets.suggested.alreadyUsed')}&nbsp;</Text>
                  {(suggestedDeposants ?? [])
                    .filter(d => !(form.getFieldValue('deposantIds') ?? []).includes(d.id))
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
                label={t('brevets.labels.depositorsAssociated')}
                tooltip={t('brevets.tooltips.selectDeposants')}
              >
                <Select
                  mode="multiple"
                  placeholder={t('brevets.placeholders.selectDeposants')}
                  loading={loadingData}
                  showSearch
                  optionFilterProp="children"
                  onChange={onChangeDeposantIds}
                >
                  {uniqueBy(dedupeById(deposants), (d) => normalize(`${(d as any)?.prenomDeposant ?? ''} ${(d as any)?.nomDeposant ?? ''}`.trim()))
                    .filter(d => {
                      const q = normalize('');
                      const label = normalize(`${d?.prenomDeposant ?? ''} ${d?.nomDeposant ?? ''}`.trim());
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
                {t('brevets.actions.createDeposant')}
              </Button>
            </div>

            {(form.getFieldValue('deposantIds') ?? []).map((id: number) => {
              const d = deposants.find(dd => dd.id === id);
              const selectedPaysIds = Array.from(new Set(informationsDepot.map(i => i.idPays).filter(Boolean) as number[]));
              return (
                <div key={`dep-${id}`} style={{ border: '1px solid #eee', borderRadius: 6, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                    Pays pour {d?.prenomDeposant ? `${d?.prenomDeposant} ${d?.nomDeposant}` : d?.nomDeposant}
                  </div>
                  <Select
                    mode="multiple"
                    placeholder={t('brevets.placeholders.selectCountries')}
                    style={{ width: '100%' }}
                    value={deposantPaysById[id] ?? []}
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
  const values = formData ?? {};
  const selectedClientNames = (values.clientIds ?? []).map((id: number) => clients.find(c => c.id === id)?.nomClient).filter(Boolean);
  const selectedInvs = (values.inventeurIds ?? []).map((id: number) => inventeurs.find(i => i.id === id)).filter(Boolean) as any[];
  const selectedDeps = (values.deposantIds ?? []).map((id: number) => deposants.find(d => d.id === id)).filter(Boolean) as any[];
  const selectedTits = (values.titulaireIds ?? []).map((id: number) => titulaires.find(t => t.id === id)).filter(Boolean) as any[];
    const paysById = new Map(pays.map(p => [p.id, p]));
    const statById = new Map(statuts.map(s => [s.id, s]));
  // Cabinets affichés par information de dépôt dans la section dédiée ci-dessous

    return (
      <div>
        <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
          {t('brevets.recap.title')}
        </Title>

  <Card title={t('brevets.recap.general')} style={{ marginBottom: 16 }}>
          <Descriptions bordered size="small">
            <Descriptions.Item label={t('brevets.labels.title')} span={3}>{values.titre ?? t('common.none')}</Descriptions.Item>
            {values.referenceFamille && (
              <Descriptions.Item label={t('brevets.labels.reference')} span={3}>{values.referenceFamille}</Descriptions.Item>
            )}
            {values.commentaire && (
              <Descriptions.Item label={t('brevets.labels.comment')} span={3}>{values.commentaire}</Descriptions.Item>
            )}
            {selectedClientNames.length > 0 && (
              <Descriptions.Item label={t('brevets.labels.clients')} span={3}>{selectedClientNames.join(', ')}</Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Card title={t('deposit.cardTitle', { count: informationsDepot.length })} style={{ marginBottom: 16 }}>
          {informationsDepot.length === 0 ? (
            <Text type="secondary">{t('deposit.none')}</Text>
          ) : (
            informationsDepot.map((info, idx) => {
              const p = info.idPays ? paysById.get(info.idPays) : null;
              const s = info.idStatuts ? statById.get(info.idStatuts) : null;
              return (
                <Descriptions key={info._tempId ?? idx} bordered size="small" column={3} style={{ marginBottom: 12 }}>
                  <Descriptions.Item label={t('deposit.labels.country')} span={1}>{p ? `${p.code} - ${p.nom}` : t('common.none')}</Descriptions.Item>
                  <Descriptions.Item label={t('deposit.labels.status')} span={1}><Tag>{s?.description ?? t('common.none')}</Tag></Descriptions.Item>
                  <Descriptions.Item label={t('deposit.labels.licence')} span={1}><Tag color={info.licence ? 'green' : 'red'}>{info.licence ? t('common.yes') : t('common.no')}</Tag></Descriptions.Item>
                  {info.numeroDepot && <Descriptions.Item label={t('deposit.labels.depositNumber')} span={1}>{info.numeroDepot}</Descriptions.Item>}
                  {info.numeroPublication && <Descriptions.Item label={t('deposit.labels.publicationNumber')} span={1}>{info.numeroPublication}</Descriptions.Item>}
                  {info.numeroDelivrance && <Descriptions.Item label={t('deposit.labels.deliveryNumber')} span={1}>{info.numeroDelivrance}</Descriptions.Item>}
                  {info.dateDepot && <Descriptions.Item label={t('deposit.labels.depositDate')} span={1}>{dayjs(info.dateDepot).format('DD/MM/YYYY')}</Descriptions.Item>}
                  {info.datePublication && <Descriptions.Item label={t('deposit.labels.publicationDate')} span={1}>{dayjs(info.datePublication).format('DD/MM/YYYY')}</Descriptions.Item>}
                  {info.dateDelivrance && <Descriptions.Item label={t('deposit.labels.deliveryDate')} span={1}>{dayjs(info.dateDelivrance).format('DD/MM/YYYY')}</Descriptions.Item>}
                  {info.commentaire && <Descriptions.Item label={t('deposit.labels.comment')} span={3}>{info.commentaire}</Descriptions.Item>}
                </Descriptions>
              );
            })
          )}
        </Card>

        <Card title={t('brevets.card.inventors', { count: selectedInvs.length })} style={{ marginBottom: 16 }}>
          {selectedInvs.length === 0 ? <Text type="secondary">{t('common.none')}</Text> : (
            <Descriptions bordered size="small">
              {selectedInvs.map((inv) => (
                <Descriptions.Item key={inv.id} label={inv.prenomInventeur ? `${inv.prenomInventeur} ${inv.nomInventeur}` : inv.nomInventeur} span={3}>
                  {(inventeurPaysById[inv.id] ?? []).map((pid) => {
                    const p = paysById.get(pid); return p ? <Tag key={`inv-${inv.id}-p-${p.id}`}>{p.code} - {p.nom}</Tag> : null;
                  })}
                </Descriptions.Item>
              ))}
            </Descriptions>
          )}
        </Card>

        <Card title={t('brevets.card.titulaires', { count: selectedTits.length })} style={{ marginBottom: 16 }}>
          {selectedTits.length === 0 ? <Text type="secondary">{t('common.none')}</Text> : (
            <Descriptions bordered size="small">
              {selectedTits.map((t) => (
                <Descriptions.Item key={t.id} label={t.nomTitulaire} span={3}>
                  {(titulairePaysById[t.id] ?? []).map((pid) => {
                    const p = paysById.get(pid); return p ? <Tag key={`tit-${t.id}-p-${p.id}`}>{p.code} - {p.nom}</Tag> : null;
                  })}
                </Descriptions.Item>
              ))}
            </Descriptions>
          )}
        </Card>

        <Card title={t('brevets.card.depositants', { count: selectedDeps.length })} style={{ marginBottom: 16 }}>
          {selectedDeps.length === 0 ? <Text type="secondary">{t('common.none')}</Text> : (
            <Descriptions bordered size="small">
              {selectedDeps.map((d) => (
                <Descriptions.Item key={d.id} label={d.prenomDeposant ? `${d.prenomDeposant} ${d.nomDeposant}` : d.nomDeposant} span={3}>
                  {(deposantPaysById[d.id] ?? []).map((pid) => {
                    const p = paysById.get(pid); return p ? <Tag key={`dep-${d.id}-p-${p.id}`}>{p.code} - {p.nom}</Tag> : null;
                  })}
                </Descriptions.Item>
              ))}
            </Descriptions>
          )}
        </Card>

        <Card title={t('brevets.card.cabinetsByDeposit')} style={{ marginBottom: 8 }}>
          {informationsDepot.length === 0 ? (
            <Text type="secondary">{t('deposit.none')}</Text>
          ) : (
            informationsDepot.map((info, idx) => {
              const p = info.idPays ? paysById.get(info.idPays) : null;
              // idx is visual index (0 = newest). Compute chronological number where 1 = oldest
              const chronologicalIndex = informationsDepot.length - idx;
              const title = p ? `${p.code} - ${p.nom}` : t('deposit.titleWithIndex', { index: chronologicalIndex });
              return (
                <div key={info._tempId ?? idx} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed #eee' }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
                  <RecapCabinetList title={t('brevets.recap.annuites')} rows={(info as any).cabinetsAnnuites ?? []} cabinets={cabinets} cabinetContacts={cabinetContacts} />
                  <RecapCabinetList title={t('brevets.recap.procedures')} rows={(info as any).cabinetsProcedures ?? []} cabinets={cabinets} cabinetContacts={cabinetContacts} />
                </div>
              );
            })
          )}
        </Card>

          <div style={{ textAlign: 'center', color: '#666' }}>
          <Text>
            {t('brevets.recap.verifyBeforeCreate')}
          </Text>
        </div>
      </div>
    );
  };

  return (
    <Modal
  title={currentStep === 'form' ? (title ?? modalTitleDefault) : t('brevets.recap.confirmTitle')}
      open={visible}
      onCancel={handleCancel}
  maskClosable={false}
  keyboard={false}
      width={900}
      footer={
        currentStep === 'form' ? [
          <Button key="cancel" onClick={handleCancel}>{t('common.cancel')}</Button>,
          <Button key="next" type="primary" onClick={() => form.submit()}>{t('common.next')}</Button>
        ] : [
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => setCurrentStep('form')}>{t('common.back')}</Button>,
          <Button key="cancel" onClick={handleCancel}>{t('common.cancel')}</Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleFinalSubmit} icon={<CheckCircleOutlined />}>{submitText ?? submitTextDefault}</Button>
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
      
      {/* Modale création client depuis AddBrevet */}
      <AddClientModal
        visible={addClientModalVisible}
        onCancel={() => setAddClientModalVisible(false)}
        onSubmit={async (values: any) => {
          try {
            const resp = await clientService.create(values);
            // Accepte plusieurs formes de réponse : { success, data }, { Data }, ou l'objet créé directement
            const anyResp: any = resp;
            const created: any = anyResp?.data ?? anyResp?.Data ?? anyResp;
            const id = created?.id ?? created?.Id;
            if (id) {
              await handleClientCreated(created);
            } else if (resp && resp.success && resp.data) {
              // fallback (ancien format)
              await handleClientCreated(resp.data);
            } else {
              console.error('Réponse inattendue lors de la création du client:', resp);
            }
          } catch (e) {
            console.error('Erreur création client depuis AddBrevetModal', e);
          }
        }}
      />

      {/* Modale création cabinet depuis AddBrevet (pour une informationDepot spécifique) */}
      <AddCabinetModal
        visible={Boolean(addCabinetModalVisibleForInfo)}
        onCancel={() => setAddCabinetModalVisibleForInfo(null)}
        onSubmit={async (values: any) => {
          try {
            const resp = await cabinetService.create(values);
            // Si le service indique un succès, essayer d'extraire l'objet créé quelle que soit la forme
                  if (resp && resp.success) {
                    const anyResp: any = resp;
                    // resp.data peut être : ApiResponse (avec Data), ou l'objet créé, ou undefined
                    let created: any = anyResp?.data ?? anyResp;
                    // si encore wrapper (ex: { Success, Data }) descendre
                    if (created && (created.Data ?? created.data)) {
                      created = created.Data ?? created.data;
                    }
                    const id = created?.id ?? created?.Id;
                    if (id) {
                      await handleCabinetCreated(created, addCabinetModalVisibleForInfo);
                        message.success(t('brevets.notifications.cabinetCreated'));
                      return;
                    }
                  }

                  // Cas d'erreur: afficher et logger le détail renvoyé par le backend (Message / Errors / Data)
                  const anyResp: any = resp;
                  // Tenter d'extraire un message lisible à plusieurs niveaux
                  const candidateMsg = anyResp?.message ?? anyResp?.Message
                    ?? anyResp?.errors ?? anyResp?.Errors
                    ?? (anyResp?.data && (anyResp.data.Message ?? anyResp.data.message ?? anyResp.data.Errors ?? anyResp.data.Errors))
                    ?? JSON.stringify(anyResp?.data ?? anyResp);
                  console.error('Création cabinet échouée - réponse du service:', anyResp);
                  // Afficher l'erreur la plus lisible possible à l'utilisateur
                      try {
                      const short = typeof candidateMsg === 'string' ? candidateMsg : JSON.stringify(candidateMsg);
                      message.error(short.length > 300 ? short.slice(0, 300) + '...' : short);
                    } catch (e) {
                      message.error(t('brevets.notifications.cabinetCreateError'));
                    }
          } catch (e: any) {
            console.error('Erreur création cabinet depuis AddBrevetModal', e);
            const server = e?.response?.data;
            const err = server?.Message ?? server?.message ?? e?.message ?? t('brevets.notifications.unknownError');
            message.error(err);
          }
        }}
      />
    </Modal>
  );
};

export default AddBrevetModal;
