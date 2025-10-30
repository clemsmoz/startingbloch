/*
 * ================================================================================================
 * PAGE LOGS SYSTÈME - STARTINGBLOCH
 * ================================================================================================
 * 
 * Page de consultation des logs système.
 * 1. Affichage de tous les logs par défaut (accessible admin uniquement)
 * 2. Possibilité de filtrer par utilisateur
 * 3. Logs filtrés (PUT, DELETE, CREATE uniquement)
 * 
 * ================================================================================================
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Button, 
  Space, 
  message, 
  Modal, 
  Tag,
  Card,
  Avatar,
  Row,
  Col,
  Statistic,
  Badge,
  DatePicker,
  Select,
} from 'antd';
import {
  ReloadOutlined,
  UserOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

// Components
import { PageHeader, DataTable } from '../components/common';

// Services
import { logService, userAdminService } from '../services';

// Types
import type { Log, User } from '../types';

// Configuration dayjs
dayjs.locale('fr');

// Helpers action
const stripDiacritics = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const normalizeAction = (s?: string) => (s ? stripDiacritics(s).toUpperCase() : '');
const isModificationAction = (action?: string) => {
  const a = normalizeAction(action);
  return (
    a.includes('POST ') || a.startsWith('POST') ||
    a.includes('PUT ') || a.startsWith('PUT') || a.includes('UPDATE') ||
    a.includes('DELETE') ||
    a.includes('CREATE') || a.includes('CREATION') ||
    a.includes('MODIFICATION') ||
    a.includes('SUPPRESSION')
  );
};

// Helper: test si un timestamp est dans [start,end] en considérant les jours
const isInRange = (ts: dayjs.Dayjs, start: dayjs.Dayjs | null, end: dayjs.Dayjs | null): boolean => {
  if (!start || !end) return true;
  const t = ts.valueOf();
  const s = start.startOf('day').valueOf();
  const e = end.endOf('day').valueOf();
  return t >= s && t <= e;
};

// Détection d'un événement "Dernière connexion"
const isLastLoginEvent = (log: Log): boolean => {
  const a = normalizeAction(log.action || '');
  if (a.includes('LASTLOGIN') || a.includes('LAST_LOGIN') || a.includes('DERNIERE') || a.includes('DERNIÈRE')) return true;
  const det = (log.details || '').toLowerCase();
  return det.includes('lastlogin') || det.includes('derniere connexion') || det.includes('dernière connexion');
};

// Extraction de la date/heure de dernière connexion depuis newValues/oldValues/détails
const extractLastLoginDate = (log: Log): dayjs.Dayjs | null => {
  const tryParse = (val: any): dayjs.Dayjs | null => {
    if (!val) return null;
    const d = dayjs(val);
    return d.isValid() ? d : null;
  };
  // Essayer dans les valeurs JSON
  const candidates: any[] = [];
  try { if (log.newValues) { const obj = typeof log.newValues === 'string' ? JSON.parse(log.newValues) : (log.newValues as any); candidates.push(obj?.LastLogin, obj?.lastLogin, obj?.LastLoginAt, obj?.lastLoginAt, obj?.LastLoginDate, obj?.lastLoginDate); } } catch {}
  try { if (log.oldValues) { const obj = typeof log.oldValues === 'string' ? JSON.parse(log.oldValues) : (log.oldValues as any); candidates.push(obj?.LastLogin, obj?.lastLogin, obj?.LastLoginAt, obj?.lastLoginAt, obj?.LastLoginDate, obj?.lastLoginDate); } } catch {}
  for (const c of candidates) { const d = tryParse(c); if (d) return d; }
  // Essayer de parser le détail libre
  const parsed = (log.details || '').match(/last\s*login\s*[:=]\s*([^|,]+)|derni[eè]re?\s*connexion\s*[:=]\s*([^|,]+)/i);
  if (parsed) {
    const token = parsed[1] || parsed[2];
    const d = tryParse(token?.trim());
    if (d) return d;
  }
  return null;
};

// Helpers libellé entité (affichage propre)
const singularize = (label?: string) => {
  if (!label) return '';
  const l = label.trim();
  // Très simple: enlever un 's' final pour éviter "clients" → "client", "contacts" → "contact"...
  if (/s$/i.test(l)) return l.replace(/s$/i, '');
  return l;
};

// Helpers format Détails
type KeyValue = { label: string; value: string };

const clean = (s?: string) => (s ?? '').replace(/^[\s:]+|[\s:]+$/g, '').trim();

const parseKeyValueList = (text: string): KeyValue[] => {
  // Ex: "Nom: Mozin, Prénom: Clément, Email: , Rôle:"
  return text
    .split(',')
    .map(p => p.trim())
    .map(part => {
      const idx = part.indexOf(':');
      if (idx === -1) return null;
      const label = clean(part.slice(0, idx));
      const value = clean(part.slice(idx + 1));
      if (!label) return null;
      if (!value) return null; // on masque les valeurs vides
      return { label, value } as KeyValue;
    })
    .filter((x): x is KeyValue => !!x);
};

const parseDetailsString = (raw?: string): { idLabel?: string; idValue?: string; pairs: KeyValue[] } => {
  const result: { idLabel?: string; idValue?: string; pairs: KeyValue[] } = { pairs: [] };
  const s = raw?.trim();
  if (!s) return result;

  // Séparer en segments par "|" si présent
  const segments = s.split('|').map(seg => seg.trim());
  for (const seg of segments) {
    // Cherche pattern "Contact ID: 109" ou "ID: 123"
    const idMatch = seg.match(/^(.*\bID)\s*:\s*(.+)$/i);
    if (idMatch) {
      result.idLabel = clean(idMatch[1]);
      result.idValue = clean(idMatch[2]);
      continue;
    }

    // Si commence par "Détails:" enlever l'entête
    const detailsPrefix = /^d[ée]tails?\s*:/i;
    const content = seg.replace(detailsPrefix, '').trim();

    // Tenter de parser comme liste clé/valeur séparée par ","
    const pairs = parseKeyValueList(content);
    if (pairs.length) {
      result.pairs.push(...pairs);
      continue;
    }

    // Fallback: tenter la forme simple "Label: Value" unique
    const idx = content.indexOf(':');
    if (idx > -1) {
      const label = clean(content.slice(0, idx));
      const value = clean(content.slice(idx + 1));
      if (label && value) result.pairs.push({ label, value });
    }
  }
  return result;
};

// (helper d'affichage inline supprimé car non utilisé)

// Parser tolérant pour objets au format libre "clé: valeur, clé2: valeur2"
const parseLooseObject = (input?: string | Record<string, any>): Record<string, any> => {
  if (!input) return {};
  if (typeof input === 'object') return input as Record<string, any>;
  let s = input.trim();
  if (!s) return {};
  // retirer accolades éventuelles
  s = s.replace(/^\{\s*/, '').replace(/\s*\}$/,'');
  const obj: Record<string, any> = {};
  // séparer naïvement par virgule
  const parts = s.split(',');
  for (const part of parts) {
    const p = part.trim();
    if (!p) continue;
    const idx = p.indexOf(':');
    if (idx === -1) continue;
    const key = clean(p.slice(0, idx));
    let val = clean(p.slice(idx + 1));
    if (!key) continue;
    // normaliser valeurs vides
    if (val === '' || val.toLowerCase() === 'null' || val.toLowerCase() === 'undefined') {
      obj[key] = null;
    } else {
      obj[key] = val;
    }
  }
  return obj;
};

// Déterminer un type d'entité propre à partir du log
const inferEntityType = (log: Log): string | undefined => {
  const t = (log.entityType || '').toString().toLowerCase();
  if (t) return t;
  const a = (log.action || '').toLowerCase();
  if (a.includes('client')) return 'client';
  if (a.includes('contact')) return 'contact';
  if (a.includes('brevet')) return 'brevet';
  if (a.includes('cabinet')) return 'cabinet';
  if (a.includes('user') || a.includes('utilisateur')) return 'utilisateur';
  return undefined;
};

// Extraire un nom d'affichage depuis un objet valeurs en fonction du type
const nameFromValues = (type?: string, obj?: Record<string, any>): string | undefined => {
  if (!type || !obj) return undefined;
  const o = obj;
  switch (type.toLowerCase()) {
    case 'client':
    case 'clients':
      return o.NomClient || o.nomClient || o.ReferenceClient || o.referenceClient;
    case 'contact':
    case 'contacts':
      {
        const nom = o.Nom || o.nom;
        const prenom = o.Prenom || o.prenom;
        if (nom && prenom) return `${prenom} ${nom}`;
        return nom || prenom || o.Email || o.email;
      }
    case 'cabinet':
    case 'cabinets':
      return o.NomCabinet || o.nomCabinet;
    case 'brevet':
    case 'brevets':
      return o.Titre || o.titre || o.NumeroBrevet || o.numeroBrevet || o.ReferenceFamille || o.referenceFamille;
    case 'utilisateur':
    case 'user':
    case 'users':
      return o.Username || o.username || o.Email || o.email;
    default:
      return o.Nom || o.nom || o.Titre || o.titre;
  }
};

// Déterminer le nom d'affichage principal pour une ligne de log
const getEntityDisplayName = (log: Log, parsedPairs?: KeyValue[]): string | undefined => {
  const type = inferEntityType(log);
  // 1) Tenter depuis NewValues/OldValues (JSON)
  let newObj: Record<string, any> | undefined;
  let oldObj: Record<string, any> | undefined;
  try { newObj = log.newValues ? (typeof log.newValues === 'string' ? JSON.parse(log.newValues) : (log.newValues as any)) : undefined; } catch {}
  try { oldObj = log.oldValues ? (typeof log.oldValues === 'string' ? JSON.parse(log.oldValues) : (log.oldValues as any)) : undefined; } catch {}
  if (!newObj && log.newValues) newObj = parseLooseObject(log.newValues as any);
  if (!oldObj && log.oldValues) oldObj = parseLooseObject(log.oldValues as any);
  const fromNew = nameFromValues(type, newObj);
  if (fromNew) return fromNew;
  const fromOld = nameFromValues(type, oldObj);
  if (fromOld) return fromOld;
  // 2) Tenter depuis les paires parsées des détails
  if (parsedPairs && parsedPairs.length) {
    const map: Record<string, string> = {};
    parsedPairs.forEach(kv => { map[kv.label] = kv.value; });
    const fromPairs = nameFromValues(type, map);
    if (fromPairs) return fromPairs;
  }
  return undefined;
};

/**
 * Page des logs système - Liste des utilisateurs avec option de voir leurs logs
 */
const LogsPage: React.FC = () => {
  const { t } = useTranslation();
  // États principaux
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [rawLogs, setRawLogs] = useState<Log[]>([]); // logs bruts avant filtres côté client
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLogsModalVisible, setIsLogsModalVisible] = useState(false);
  
  // États pour la pagination des logs
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  // Filtres
  const [actionFilter, setActionFilter] = useState<string[]>([]); // ['creation','modification','suppression','derniere-connexion']
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [singleDate, setSingleDate] = useState<dayjs.Dayjs | null>(null);
  
  // États pour les statistiques
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalSystemLogs, setTotalSystemLogs] = useState(0);

  // Charger la liste des utilisateurs
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userAdminService.getAll(1, 1000); // Récupérer tous les utilisateurs
      setUsers(response.data);
      setTotalUsers(response.data.length);
      setActiveUsers(response.data.filter((user: User) => user.isActive).length);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      message.error('Impossible de charger la liste des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  // Charger les logs d'un utilisateur spécifique (uniquement PUT, DELETE, CREATE)
  const loadUserLogs = async (userId: number, page: number = 1, size: number = pageSize) => {
    console.log(`🎯 LogsPage - Chargement logs pour utilisateur ${userId}, page ${page}, taille ${size}`);
    setLoading(true);
    try {
  const response = await logService.getByUser(userId, page, size);
      console.log(`🎯 LogsPage - Réponse reçue:`, response);
      console.log(`🎯 LogsPage - Success: ${response.success}, TotalCount: ${response.totalCount}, Data length: ${response.data?.length}`);
      
      // Normalisation des propriétés pour supporter PascalCase et camelCase
      const normalizedLogs = response.data.map((log: any) => ({
        ...log,
        createdAt: log.createdAt || log.CreatedAt,
        oldValues: log.oldValues || log.OldValues,
        newValues: log.newValues || log.NewValues,
        entityType: log.entityType || log.EntityType,
        entityName: log.entityName || log.EntityName,
        entityId: log.entityId || log.EntityId,
        details: log.details || log.Details,
        action: log.action || log.Action,
      }));

  // Ne garder que les actions pertinentes (modifications + dernières connexions)
  const relevantLogs = normalizedLogs.filter((l: any) => isModificationAction(l.action) || isLastLoginEvent(l));

      // Enrichissement: tenter d'inférer les anciennes valeurs si non fournies
      // 1) Compléter entityId depuis les détails si absent
  relevantLogs.forEach((log: any) => {
        if (!log.entityId && log.details) {
          const parsed = parseDetailsString(log.details);
          const idNum = parsed.idValue && !isNaN(Number(parsed.idValue)) ? Number(parsed.idValue) : undefined;
          if (idNum) log.entityId = idNum;
        }
      });

      // 2) Indexer par entityId et remonter dans le temps pour inférer oldValues
  const sorted = [...relevantLogs].sort((a: any, b: any) => {
        const ta = dayjs(a.createdAt || a.timestamp || a.timeStamp).valueOf();
        const tb = dayjs(b.createdAt || b.timestamp || b.timeStamp).valueOf();
        return ta - tb; // ordre croissant
      });
      const lastPairsByEntity = new Map<number, Record<string, any>>();
      const lastPairsByType = new Map<string, Record<string, any>>();
      sorted.forEach((log: any) => {
        const parsed = parseDetailsString(log.details);
        const nowPairsObj: Record<string, any> = {};
        parsed.pairs.forEach(kv => nowPairsObj[kv.label] = kv.value);

        const eid = log.entityId as number | undefined;
        if (eid) {
          const prev = lastPairsByEntity.get(eid);
          if (prev && (!log.oldValues || (typeof log.oldValues === 'string' && log.oldValues.trim() === ''))) {
            // Attacher anciennes valeurs inférées
            (log as any).__inferredOldValues = prev;
          }
          // Mettre à jour l'état courant
          lastPairsByEntity.set(eid, nowPairsObj);
        } else if (log.entityType) {
          const prevByType = lastPairsByType.get(log.entityType) || undefined;
          if (prevByType && (!log.oldValues || (typeof log.oldValues === 'string' && log.oldValues.trim() === ''))) {
            (log as any).__inferredOldValues = prevByType;
          }
          lastPairsByType.set(log.entityType, nowPairsObj);
        }
      });
      
      console.log(`🎯 LogsPage - Logs normalisés:`, normalizedLogs);
      if (normalizedLogs.length > 0) {
        console.log('🟨 Premier log normalisé:', normalizedLogs[0]);
        console.log('🟨 createdAt:', normalizedLogs[0].createdAt, 'Type:', typeof normalizedLogs[0].createdAt);
      }
  setRawLogs(relevantLogs);
  setLogs(relevantLogs);
  setTotalCount(relevantLogs.length);
      setCurrentPage(page);
    } catch (error) {
      console.error('❌ LogsPage - Erreur lors du chargement des logs:', error);
      message.error('Impossible de charger les logs de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques générales
  const loadStats = async () => {
    try {
      const response = await logService.getAll(1, 1000);
      // Compter uniquement les actions de modification
      const normalized = response.data.map((log: any) => ({
        ...log,
        action: log.action || log.Action
      }));
      const relevant = normalized.filter((l: any) => isModificationAction(l.action) || isLastLoginEvent(l));
      setTotalSystemLogs(relevant.length);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  // Initialisation
  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  // Ouvrir la modal des logs pour un utilisateur
  const handleViewUserLogs = (user: User) => {
    setSelectedUser(user);
    setIsLogsModalVisible(true);
    loadUserLogs(user.id);
  };

  // Fermer la modal des logs
  const handleCloseLogsModal = () => {
    setIsLogsModalVisible(false);
    setSelectedUser(null);
    setLogs([]);
    setCurrentPage(1);
    setTotalCount(0);
  };

  // Pagination côté serveur désactivée quand filtres actifs (gérée côté client)

  // Obtenir le nom d'affichage d'un utilisateur
  const getUserDisplayName = (user: User): string => {
    if (user.prenom && user.nom) {
      return `${user.prenom} ${user.nom}`;
    }
    return user.username || user.email;
  };

  

  // Version utilisant t(...) pour les labels
  const formatActionDescriptionLocal = (log: Log): string => {
    const action = log.action || '';
    const upper = normalizeAction(action);

    const actionMap: { [key: string]: string } = {
  'CREATE': t('logs.action.creation'),
  'POST': t('logs.action.creation'),
  'UPDATE': t('logs.action.modification'),
  'PUT': t('logs.action.modification'),
  'DELETE': t('logs.action.suppression')
    };

  if (isLastLoginEvent(log)) return t('logs.action.lastLoginFull');

    const translatedAction = actionMap[upper] || (
  upper.includes('DELETE') || upper.includes('SUPPRESSION') ? t('logs.action.suppression') :
  upper.includes('PUT') || upper.includes('UPDATE') || upper.includes('MODIFICATION') ? t('logs.action.modification') :
  upper.includes('POST') || upper.includes('CREATE') || upper.includes('CREATION') ? t('logs.action.creation') : action
    );

    let type = (log.entityType || '').toString();
    if (!type) {
      const lowerAct = action.toLowerCase();
      if (lowerAct.includes('client')) type = 'client';
      else if (lowerAct.includes('contact')) type = 'contact';
      else if (lowerAct.includes('brevet')) type = 'brevet';
      else if (lowerAct.includes('cabinet')) type = 'cabinet';
      else if (lowerAct.includes('user') || lowerAct.includes('utilisateur')) type = 'utilisateur';
    }
    const typeClean = singularize(type).toLowerCase();

    return typeClean
  ? `${translatedAction} ${t('logs.ofEntityPreposition')} ${typeClean}`
      : translatedAction;
  };

  // Obtenir la couleur de l'action
  const getActionColor = (action: string, log?: Log): string => {
    if (log && isLastLoginEvent(log)) return 'purple';
    const a = normalizeAction(action);
    if (a.includes('DELETE') || a.includes('SUPPRESSION')) return 'red';
    if (a.includes('UPDATE') || a.includes('PUT') || a.includes('MODIFICATION')) return 'blue';
    if (a.includes('CREATE') || a.includes('POST') || a.includes('CREATION')) return 'green';
    return 'default';
  };

  // Obtenir la couleur du rôle
  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'Admin': return 'red';
      case 'Manager': return 'orange';
      default: return 'blue';
    }
  };

  // Colonnes de la table des utilisateurs
  const userColumns: ColumnsType<User> = [
    {
  title: t('users.column.user'),
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{ backgroundColor: record.isActive ? '#52c41a' : '#d9d9d9' }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>
              {getUserDisplayName(record)}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
  title: t('users.column.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>
          {role}
        </Tag>
      ),
    },
    {
  title: t('users.column.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Badge
          status={isActive ? 'success' : 'default'}
          text={isActive ? t('users.status.active') : t('users.status.inactive')}
        />
      ),
    },
    {
  title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<HistoryOutlined />}
          onClick={() => handleViewUserLogs(record)}
        >
          {t('logs.viewLogs')}
        </Button>
      ),
    },
  ];

  // Colonnes de la table des logs
  const logColumns: ColumnsType<Log> = [
    {
  title: t('logs.columns.dateTime'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: true,
      defaultSortOrder: 'descend',
      render: (_: any, record: Log) => {
        const ts = record.createdAt || record.timestamp || record.timeStamp;
  if (!ts) return t('common.notProvided');
        return (
          <div>
            <div>{dayjs(ts).format('DD/MM/YYYY')}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{dayjs(ts).format('HH:mm:ss')}</div>
          </div>
        );
      },
    },
    {
  title: t('logs.columns.action'),
      dataIndex: 'action',
      key: 'action',
      width: 300,
      render: (_: any, record: Log) => (
        <Tag color={getActionColor(record.action, record)}>
          {formatActionDescriptionLocal(record)}
        </Tag>
      ),
    },
    {
  title: t('logs.columns.details'),
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (_: any, record: Log) => {
        // Mise en forme propre des détails
        const blocks: JSX.Element[] = [];

        // 1) Si on a un entityId, afficher un badge compact
        if (record.entityId) {
          blocks.push(
            <div key="entityId" style={{ marginBottom: 6 }}>
              <span style={{ color: '#8c8c8c' }}>{t('common.id')}: </span>
              <span style={{ fontWeight: 600 }}>{record.entityId}</span>
            </div>
          );
        }

        // 2) Parser record.details pour extraire des paires
        const parsed = parseDetailsString(record.details);
        const kvs: KeyValue[] = [];
        if (parsed.idLabel && parsed.idValue && !record.entityId) {
          blocks.push(
            <div key="parsedId" style={{ marginBottom: 6 }}>
              <span style={{ color: '#8c8c8c' }}>{parsed.idLabel}: </span>
              <span style={{ fontWeight: 600 }}>{parsed.idValue}</span>
            </div>
          );
        }
        if (parsed.pairs.length) kvs.push(...parsed.pairs);

        // 2bis) Afficher d'abord le nom (plutôt que l'ID), avec l'ID en secondaire si disponible
        const displayName = getEntityDisplayName(record, kvs);
        if (displayName) {
          const typeLabel = singularize(inferEntityType(record) || '').toLowerCase();
          blocks.unshift(
            <div key="entityName" style={{ marginBottom: 6 }}>
              {typeLabel && <span style={{ color: '#8c8c8c', marginRight: 4 }}>{typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}:</span>}
              <span style={{ fontWeight: 600 }}>{displayName}</span>
              {record.entityId && <span style={{ marginLeft: 8, color: '#bfbfbf' }}>{t('common.id')}: {record.entityId}</span>}
            </div>
          );
        } else if (record.entityId) {
          // Fallback si on n'a pas pu déduire de nom
          blocks.unshift(
              <div key="entityId" style={{ marginBottom: 6 }}>
                <span style={{ color: '#8c8c8c' }}>{t('common.id')}: </span>
                <span style={{ fontWeight: 600 }}>{record.entityId}</span>
              </div>
            );
        }

        // 3) Diffs avant/après (old/new)
        if (record.oldValues || record.newValues) {
          let oldObj: Record<string, any> = {};
          let newObj: Record<string, any> = {};
          try { if (record.oldValues) oldObj = typeof record.oldValues === 'string' ? JSON.parse(record.oldValues) : (record.oldValues as any); } catch {}
          try { if (record.newValues) newObj = typeof record.newValues === 'string' ? JSON.parse(record.newValues) : (record.newValues as any); } catch {}
          // Fallback tolérant si le JSON n'est pas strict (ex: "Nom: X, Prénom: Y")
          if ((!oldObj || Object.keys(oldObj).length === 0) && record.oldValues) {
            oldObj = parseLooseObject(record.oldValues as any);
          }
          if ((!newObj || Object.keys(newObj).length === 0) && record.newValues) {
            newObj = parseLooseObject(record.newValues as any);
          }
          // Fallback supplémentaire: anciennes valeurs inférées depuis le log précédent de la même entité
          if ((!oldObj || Object.keys(oldObj).length === 0) && (record as any).__inferredOldValues) {
            oldObj = (record as any).__inferredOldValues;
          }
          const allKeys = Array.from(new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]));

          let diffPairs: KeyValue[] = [];
          allKeys.forEach(key => {
            const before = oldObj[key];
            const after = newObj[key];
            if (before !== after) {
              diffPairs.push({ label: key, value: `${before ?? '-'} → ${after ?? '-'}` });
            }
          });
          // Fallback: si aucune paire détectée mais on a des paires "kvs"
          if (diffPairs.length === 0 && kvs.length > 0 && isModificationAction(record.action)) {
            diffPairs = kvs.map(kv => ({ label: kv.label, value: `- → ${kv.value}` }));
          }
          if (diffPairs.length) {
            blocks.push(
              <div key="diffTitle" style={{ marginTop: kvs.length ? 8 : 0, marginBottom: 4, fontWeight: 600 }}>{t('logs.changes')}</div>
            );
            blocks.push(
              <div key="diffList" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                {diffPairs.map((p) => (
                  <div key={`diff-${p.label}-${p.value}`} style={{ fontSize: 13 }}>
                    <span style={{ color: '#8c8c8c' }}>{p.label}: </span>
                    <span style={{ color: '#c00' }}>{String(p.value).split(' → ')[0]}</span>
                    <span> → </span>
                    <span style={{ color: '#090' }}>{String(p.value).split(' → ')[1]}</span>
                  </div>
                ))}
              </div>
            );
          }
        }

        // 4) Dernière connexion: afficher la date/heure formatée
        if (isLastLoginEvent(record)) {
          const d = extractLastLoginDate(record) || dayjs(record.createdAt || (record as any).timestamp || (record as any).timeStamp);
          blocks.push(
            <div key="lastlogin" style={{ marginTop: 8, fontSize: 13 }}>
              <span style={{ color: '#8c8c8c' }}>{t('logs.lastLogin')}: </span>
              <span style={{ fontWeight: 600 }}>{d.format('DD/MM/YYYY HH:mm:ss')}</span>
            </div>
          );
        }

  if (!blocks.length) return t('common.notProvided');
        return <div>{blocks}</div>;
      },
    },
  // Colonne IP supprimée selon la demande (pas besoin d’adresse IP)
  ];

  // Actions de l'en-tête
  const headerActions = [
    <Button
      key="refresh"
      type="primary"
      icon={<ReloadOutlined />}
      onClick={() => {
        loadUsers();
        loadStats();
      }}
      loading={loading}
    >
      {t('actions.refresh')}
    </Button>
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
  title={t('menu.logs')}
  description={t('logs.pageDescription')}
        breadcrumbs={[
          { title: t('menu.admin') },
          { title: t('menu.logs') }
        ]}
        actions={headerActions}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Statistiques */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('logs.stats.totalUsers')}
                value={totalUsers}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('logs.stats.activeUsers')}
                value={activeUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('logs.stats.totalLogs')}
                value={totalSystemLogs}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('logs.stats.todayActions')}
                value={logs.filter(log => dayjs(log.createdAt || (log as any).timestamp || (log as any).timeStamp).isSame(dayjs(), 'day')).length}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Table des utilisateurs */}
  <Card title={t('logs.usersListTitle')} style={{ borderRadius: '12px' }}>
          <DataTable
            columns={userColumns}
            data={users}
            loading={loading}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} ${t('logs.ofTotal')} ${total} ${t('logs.labelUsers')}`,
            }}
          />
        </Card>
      </Space>

      {/* Modal des logs utilisateur */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
              {selectedUser && `${t('logs.userLogsTitle')} ${getUserDisplayName(selectedUser)}`}
          </Space>
        }
        open={isLogsModalVisible}
        onCancel={handleCloseLogsModal}
        width={1200}
        footer={[
          <Button key="close" onClick={handleCloseLogsModal}>
            {t('actions.close')}
          </Button>
        ]}
      >
        {/* Filtres actions / dates */}
        <Space wrap style={{ marginBottom: 12 }}>
          <Select
            mode="multiple"
            allowClear
            placeholder={t('logs.filterByAction')}
            style={{ minWidth: 260 }}
            value={actionFilter}
            onChange={(vals) => {
              setActionFilter(vals);
              // Appliquer filtres côté client sur rawLogs
              const next = (rawLogs || []).filter(l => {
                // Filtre action
                const actKey = isLastLoginEvent(l)
                  ? 'derniere-connexion'
                  : (normalizeAction(l.action || '').includes('DELETE') ? 'suppression'
                    : (normalizeAction(l.action || '').includes('UPDATE') || normalizeAction(l.action || '').includes('PUT') ? 'modification'
                      : (normalizeAction(l.action || '').includes('CREATE') || normalizeAction(l.action || '').includes('POST') ? 'creation' : 'autre')));
                const okAction = vals.length === 0 || vals.includes(actKey);
                return okAction;
              }).filter(l => {
                // Filtre dates
                const ts = dayjs(l.createdAt || (l as any).timestamp || (l as any).timeStamp);
                const [start, end] = dateRange;
                let okRange = true;
                if (start && end) okRange = ts.isSame(start, 'day') || isInRange(ts, start, end);
                let okSingle = true;
                if (singleDate) okSingle = ts.isSame(singleDate, 'day');
                return okRange && okSingle;
              });
              setLogs(next);
              setTotalCount(next.length);
            }}
            options={[
          { label: t('logs.action.creation'), value: 'creation' },
          { label: t('logs.action.modification'), value: 'modification' },
          { label: t('logs.action.suppression'), value: 'suppression' },
          { label: t('logs.action.lastLogin'), value: 'derniere-connexion' },
            ]}
          />
          <DatePicker.RangePicker
            placeholder={[t('logs.startDate'), t('logs.endDate')]}
            onChange={(range) => {
              const r: [any, any] = range as any;
              setDateRange(r);
              const next = (rawLogs || []).filter(l => {
                const ts = dayjs(l.createdAt || (l as any).timestamp || (l as any).timeStamp);
                const [start, end] = r;
                let okRange = true;
                if (start && end) okRange = ts.isSame(start, 'day') || isInRange(ts, start, end);
                // Filtre action existant
                const actKey = isLastLoginEvent(l)
                  ? 'derniere-connexion'
                  : (normalizeAction(l.action || '').includes('DELETE') ? 'suppression'
                    : (normalizeAction(l.action || '').includes('UPDATE') || normalizeAction(l.action || '').includes('PUT') ? 'modification'
                      : (normalizeAction(l.action || '').includes('CREATE') || normalizeAction(l.action || '').includes('POST') ? 'creation' : 'autre')));
                const okAction = actionFilter.length === 0 || actionFilter.includes(actKey);
                // Filtre date ponctuelle
                let okSingle = true;
                if (singleDate) okSingle = ts.isSame(singleDate, 'day');
                return okRange && okAction && okSingle;
              });
              setLogs(next);
              setTotalCount(next.length);
            }}
          />
          <DatePicker
            placeholder={t('logs.singleDate')}
            onChange={(d) => {
              setSingleDate(d);
              const next = (rawLogs || []).filter(l => {
                const ts = dayjs(l.createdAt || (l as any).timestamp || (l as any).timeStamp);
                // Single date
                let okSingle = true;
                if (d) okSingle = ts.isSame(d, 'day');
                // Range
                const [start, end] = dateRange;
                let okRange = true;
                if (start && end) okRange = ts.isSame(start, 'day') || isInRange(ts, start, end);
                // Action
                const actKey = isLastLoginEvent(l)
                  ? 'derniere-connexion'
                  : (normalizeAction(l.action || '').includes('DELETE') ? 'suppression'
                    : (normalizeAction(l.action || '').includes('UPDATE') || normalizeAction(l.action || '').includes('PUT') ? 'modification'
                      : (normalizeAction(l.action || '').includes('CREATE') || normalizeAction(l.action || '').includes('POST') ? 'creation' : 'autre')));
                const okAction = actionFilter.length === 0 || actionFilter.includes(actKey);
                return okSingle && okRange && okAction;
              });
              setLogs(next);
              setTotalCount(next.length);
            }}
          />
          <Button onClick={() => {
              setActionFilter([]);
              setDateRange([null, null]);
              setSingleDate(null);
              setLogs(rawLogs);
              setTotalCount(rawLogs.length);
            }}>{t('logs.resetFilters')}</Button>
        </Space>
        <DataTable
          columns={logColumns}
          data={logs}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} ${t('logs.ofTotal')} ${total} ${t('logs.labelLogs')}`,
            pageSizeOptions: ['10', '20', '50'],
            // Lorsqu'on filtre côté client, on évite de recharger côté serveur
            onChange: (_, __) => {},
            onShowSizeChange: (_, __) => {},
          }}
          scroll={{ x: 800 }}
        />

      </Modal>
    </motion.div>
  );
};

export default LogsPage;
