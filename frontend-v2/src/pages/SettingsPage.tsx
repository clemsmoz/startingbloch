import React, { useEffect, useState } from 'react';
import { Card, Tabs, Switch, List, Space, Button, message } from 'antd';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { notificationService } from '../services/notificationService';
import { clientService } from '../services/clientService';

const TYPES: { key: string | null; label: string }[] = [
  { key: null, label: 't:settings.types.all' },
  { key: 'Brevet', label: 't:settings.types.brevet' },
  { key: 'Cabinet', label: 't:settings.types.cabinet' },
  { key: 'Client', label: 't:settings.types.client' },
  { key: 'Contact', label: 't:settings.types.contact' },
];

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card title={t('settings.title')}>
      <Tabs defaultActiveKey="account">
        <Tabs.TabPane tab={t('settings.tabs.account')} key="account">
          <div>
            <p>{t('settings.account.description')} <a href="/profile">{t('settings.account.myProfile')}</a>.</p>
            <div style={{ marginTop: 16 }}>
              <h3>{t('settings.account.language')}</h3>
              <div style={{ maxWidth: 240 }}>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('settings.tabs.notifications')} key="notifications">
          <Card title={t('settings.notifications.title')}>
            <NotificationsPanel />
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
};

const NotificationsPanel: React.FC = () => {
  const { t: tr } = useTranslation();
  const [prefsMap, setPrefsMap] = useState<Record<string, { id: number | null; enabled: boolean }>>({});
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Array<{ id: number; nomClient: string }>>([]);

  const makeKey = (clientId: number, type: string | null) => `${clientId}|${type ?? 'all'}`;

  const load = async () => {
    setLoading(true);
    try {
      const clientsRes = await clientService.getAll(1, 500);
  const clientRows = clientsRes.data.map((c: any) => ({ id: c.id, nomClient: c.nomClient ?? c.nom ?? `#${c.id}` }));

      const prefs = await notificationService.getPreferences(); // returns all prefs for current user
      const map: Record<string, { id: number | null; enabled: boolean }> = {};
      if (Array.isArray(prefs)) {
        prefs.forEach((p: any) => {
          // skip global prefs in this UI (user asked to ignore global)
          if (p.clientId == null) return;

          // Normalize notificationType: DB may store empty string for "all" or null
          const rawType = p.notificationType;
          const type = (rawType === null || rawType === undefined || String(rawType).trim() === '') ? null : String(rawType);

          // Enabled is stored as integer 0/1 in DB. Normalize to boolean.
          let enabled = false;
          if (p.enabled === 1 || p.enabled === '1' || p.enabled === true) enabled = true;

          const k = makeKey(p.clientId, type);
          map[k] = { id: p.id ?? null, enabled };
        });
      }

      setClients(clientRows);
      setPrefsMap(map);
    } catch (err) {
      console.error(err);
  message.error(tr('settings.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (clientId: number, type: string | null, enabled: boolean) => {
    try {
      // If toggling the "Tous" switch (notificationType == null), apply to all specific types visually
      if (type === null) {
        // persist the client-level "all" preference AND explicit per-type preferences
        // This ensures the server has explicit rows for each type and the UI displays consistent state.
        try {
          await Promise.all(TYPES.map(typeItem => notificationService.upsertPreference(clientId, typeItem.key, enabled)));
        } catch (e) {
          // If any upsert fails, still attempt to update UI optimistically and show an error
          console.error('Failed to persist all-type preferences', e);
        }

        // optimistic update: set all types for this client to the new value
        setPrefsMap(prev => {
          const next: Record<string, { id: number | null; enabled: boolean }> = { ...prev };
          TYPES.forEach(typeItem => {
            const k = makeKey(clientId, typeItem.key);
            next[k] = { id: prev[k]?.id ?? null, enabled };
          });
          return next;
        });
      } else {
        await notificationService.upsertPreference(clientId, type, enabled);
        // optimistic update: update local state immediately so the UI reflects the change
        const k = makeKey(clientId, type);
        setPrefsMap(prev => ({ ...prev, [k]: { id: prev[k]?.id ?? null, enabled } }));
      }
  message.success(tr('settings.updated'));
      // refresh in background to sync with server
      load().catch(() => { /* ignore refresh errors here */ });
    } catch (err) {
      console.error(err);
      message.error(tr('settings.updateFailed'));
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button onClick={load}>{tr('settings.refresh')}</Button>
      </Space>

      <List
        dataSource={clients}
        loading={loading}
        renderItem={(c) => (
          <List.Item key={c.id} style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <div style={{ flex: '0 0 300px', fontWeight: 500 }}>{c.nomClient}</div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {TYPES.map((typeItem) => {
                  const k = makeKey(c.id, typeItem.key);
                  const entry = prefsMap[k];
                  // if there's a specific entry, use it. Otherwise fall back to the client-level 'all' preference
                  const allKey = makeKey(c.id, null);
                  const allEntry = prefsMap[allKey];
                  let checked: boolean;
                  if (entry) checked = entry.enabled;
                  else if (allEntry) checked = allEntry.enabled;
                  else checked = true;
                  return (
                    <div key={String(typeItem.key ?? 'all')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                        {typeItem.label && String(typeItem.label).startsWith('t:') ? tr(String(typeItem.label).replace(/^t:/, '')) : typeItem.label}
                      </div>
                      <Switch checked={checked} onChange={(val) => handleToggle(c.id, typeItem.key, val)} />
                    </div>
                  );
                })}
              </div>
            </div>
          </List.Item>
        )}
      />

      <div style={{ marginTop: 12, color: '#666' }}>
        <strong>{tr('settings.note_prefix')} </strong>{tr('settings.note')}
      </div>
    </div>
  );
};

export default SettingsPage;
