import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, List, Button, message, Pagination, Tabs, Avatar, Tag, Space, Empty, Select, Row, Col } from 'antd';
import { CheckCircleOutlined, FileTextOutlined, UserOutlined, ApartmentOutlined, FolderOpenOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { notificationService } from '../services/notificationService';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<'unread'|'read'>('unread');
  const [clientId, setClientId] = useState<number | undefined>(undefined);
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [typesFilter, setTypesFilter] = useState<string[]>([]);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const json = await notificationService.getNotifications(clientId, p, pageSize, typesFilter);
  if (json?.Success) {
        const data = (json.Data || []).map((item: any) => {
          let isReadVal = false;
          if (typeof item.IsRead !== 'undefined') isReadVal = item.IsRead;
          else if (typeof item.isRead !== 'undefined') isReadVal = item.isRead;
          return ({
          Id: item.Id ?? item.id,
          Message: item.Message ?? item.message,
          Type: item.Type ?? item.type,
          Action: item.Action ?? item.action,
          CreatedAt: item.CreatedAt ?? item.createdAt,
          IsRead: isReadVal,
          Metadata: item.Metadata ?? item.metadata ?? null,
          ReferenceId: item.ReferenceId ?? item.referenceId ?? null,
          ...item,
        });
        });
        setItems(data);
        setTotal(json.TotalCount ?? data.length);
  } else {
  message.error(t('notifications.loadError'));
      }
      } catch (err) {
      console.error(err);
  message.error(t('notifications.networkError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); /* eslint-disable-next-line */ }, [page]);

  // Load clients for the client filter
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await import('../services/clientService').then(m => m.clientService.getAll(1, 500));
        if (!mounted) return;
        const list = (c?.data || []).map((x: any) => ({ id: x.id, name: x.nomClient || x.referenceClient || (`Client ${x.id}`) }));
        setAvailableClients(list);
      } catch (err) {
        console.warn('Impossible de charger la liste des clients', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const markRead = async (ids: number[]) => {
    try {
      const json = await notificationService.markAsRead(ids);
      if (json?.Success) {
        message.success(t('notifications.markedRead'));
        load(page);
      } else {
        message.error(t('notifications.failed'));
      }
    } catch (err) {
      console.error(err);
      message.error(t('notifications.genericError'));
    }
  };

  const markAllVisibleAsRead = async () => {
    const ids = items.filter(i => activeTab === 'unread' ? !i.IsRead : i.IsRead).map(i => i.Id);
  if (ids.length === 0) { message.info(t('notifications.noneToMark')); return; }
    await markRead(ids);
  };

  const renderReference = (record: any) => {
    // Keep this function small: try common readable fields, then metadata shortcuts.
    if (!record) return t('common.notProvided');
    if (record.ReferenceFamille) return record.ReferenceFamille;
    if (record.Reference) return record.Reference;
  if (record.Type === 'Brevet' && record.ReferenceId) return `${t('notifications.brevet')} #${record.ReferenceId}`;
    const md = record.Metadata || record.metadata;
    if (md) {
      try {
        const m = typeof md === 'string' ? JSON.parse(md) : md;
        if (m) {
          if (m.referenceFamille) return m.referenceFamille;
          if (m.nomClient || m.nom_client || m.nom) return m.nomClient ?? m.nom_client ?? m.nom;
          if (m.prenom || m.nom) return `${m.prenom ?? ''} ${m.nom ?? ''}`.trim();
        }
      } catch { /* ignore parse errors */ }
    }
    if (record.Message) return record.Message;
    return t('common.notProvided');
  };

  const unreadItems = items.filter(i => !i.IsRead);
  const readItems = items.filter(i => i.IsRead);

  const iconForType = (type: string) => {
    switch ((type || '').toLowerCase()) {
      case 'brevet': return <FolderOpenOutlined />;
      case 'contact': return <UserOutlined />;
      case 'client': return <FileTextOutlined />;
      case 'cabinet': return <ApartmentOutlined />;
      default: return <FileTextOutlined />;
    }
  };

  const renderItem = (item: any) => {
    const prefix = `${item.Action ? item.Action : ''}${item.Action && item.Type ? ' • ' : ''}${item.Type ?? ''}`;
    const subject = renderReference(item);
    return (
      <List.Item
        actions={[
          <Button key="mark" type="link" onClick={() => markRead([item.Id])}>{item.IsRead ? t('notifications.marked') : t('notifications.markAsRead')}</Button>
        ]}
      >
        <List.Item.Meta
          avatar={<Avatar icon={iconForType(item.Type)} />}
          title={<div><Space size={8}><strong>{subject ?? item.Message}</strong>{item.Message ? <span style={{ color: '#666' }}>{item.Message}</span> : null}</Space></div>}
          description={<div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Tag color={item.IsRead ? 'default' : 'processing'} icon={item.IsRead ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>{item.IsRead ? t('notifications.read') : t('notifications.unread')}</Tag>
            {prefix ? <Tag>{prefix}</Tag> : null}
            <div style={{ color: '#999', fontSize: 12 }}>{item.CreatedAt ? `${dayjs(item.CreatedAt).fromNow()} — ${dayjs(item.CreatedAt).format('DD/MM/YYYY HH:mm')}` : ''}</div>
          </div>}
        />
      </List.Item>
    );
  };

  return (
  <Card title={t('notifications.pageTitle')}>
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            allowClear
            style={{ width: '100%' }}
            placeholder={t('notifications.filterByClient')}
            value={clientId}
            onChange={(v) => { setClientId(v); setPage(1); }}
          >
            {availableClients.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={16} lg={18}>
          <Select
            mode="multiple"
            allowClear
            placeholder={t('notifications.filterByType')}
            style={{ width: '100%' }}
            value={typesFilter}
            onChange={(v) => { setTypesFilter(v); setPage(1); }}
          >
            <Select.Option value="Brevet">{t('notifications.type.brevet')}</Select.Option>
            <Select.Option value="Cabinet">{t('notifications.type.cabinet')}</Select.Option>
            <Select.Option value="Contact">{t('notifications.type.contact')}</Select.Option>
            <Select.Option value="Client">{t('notifications.type.client')}</Select.Option>
          </Select>
        </Col>
      </Row>
      <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k as 'unread'|'read')}>
        <Tabs.TabPane tab={<span>{t('notifications.tab.unread')} <Tag>{unreadItems.length}</Tag></span>} key="unread">
          {unreadItems.length === 0 ? <Empty description={t('notifications.empty.unread')} /> : (
            <List
              itemLayout="vertical"
              dataSource={unreadItems}
              renderItem={renderItem}
              loading={loading}
              pagination={false}
            />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab={<span>{t('notifications.tab.read')} <Tag>{readItems.length}</Tag></span>} key="read">
          {readItems.length === 0 ? <Empty description={t('notifications.empty.read')} /> : (
            <List
              itemLayout="vertical"
              dataSource={readItems}
              renderItem={renderItem}
              loading={loading}
              pagination={false}
            />
          )}
        </Tabs.TabPane>
      </Tabs>

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pagination current={page} pageSize={pageSize} total={total} onChange={(p, ps) => { setPage(p); setPageSize(ps); }} />
        <div>
          <Button onClick={() => markAllVisibleAsRead()} type="primary">{t('notifications.markVisibleRead')}</Button>
        </div>
      </div>
    </Card>
  );
};

export default NotificationsPage;
