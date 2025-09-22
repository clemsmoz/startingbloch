import React, { useEffect, useState } from 'react';
import { Badge, Popover, List, Button, Spin, Avatar, Empty } from 'antd'; 
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BellOutlined, FileTextOutlined, UserOutlined, ApartmentOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { startSignalR, stopSignalR } from '../services/signalrService';
import { notificationService } from '../services/notificationService';

dayjs.extend(relativeTime);

const NotificationBell: React.FC<{ clientId?: number }> = ({ clientId }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const normalize = (item: any) => ({
    Id: item.Id ?? item.id,
    Message: item.Message ?? item.message,
    Type: item.Type ?? item.type,
    Action: item.Action ?? item.action,
    CreatedAt: item.CreatedAt ?? item.createdAt,
    IsRead: (() => {
      let v: any = false;
      if (typeof item.IsRead !== 'undefined') v = item.IsRead;
      else if (typeof item.isRead !== 'undefined') v = item.isRead;
      // coerce common representations to boolean
      return v === true || v === 'true' || v === 1 || v === '1';
    })(),
    // keep other metadata if present
    ...item,
  });

  const renderReference = (item: any) => {
    const md = item.Metadata ?? item.metadata;
    const parseMd = (x: any) => {
      if (!x) return null;
      if (typeof x === 'string') {
        try { return JSON.parse(x); } catch { return null; }
      }
      return x;
    };
    const m = parseMd(md) || {};

    // Brevet: prefer referenceFamille
    if (item.Type === 'Brevet') {
      if (m.referenceFamille) return m.referenceFamille;
      if (m.reference) return m.reference;
      if (item.ReferenceFamille) return item.ReferenceFamille;
      if (item.Reference) return item.Reference;
      return null;
    }

    // Contact: prenom + nom
    if (item.Type === 'Contact') {
      const prenom = m.prenom ?? m.firstName ?? item.Prenom ?? item.prenom ?? null;
      const nom = m.nom ?? m.lastName ?? item.Nom ?? item.nom ?? null;
      const full = `${prenom ?? ''} ${nom ?? ''}`.trim();
      if (full) return full;
      // fallback to message or null
      return null;
    }

    // Client: try multiple metadata keys then item properties
    if (item.Type === 'Client') {
      return m.nomClient ?? m.nom_client ?? m.nom ?? item.NomClient ?? item.Nom ?? item.nom ?? null;
    }

    // Cabinet: try multiple metadata keys then item properties
    if (item.Type === 'Cabinet') {
      return m.nomCabinet ?? m.nom_cabinet ?? m.nom ?? item.NomCabinet ?? item.Nom ?? item.nom ?? null;
    }

    // Generic fallback
    return item.Message ?? null;
  };

  // renderPrefix removed - kept UI concise in the bell

  const markRead = async (ids: number[]) => {
    try {
      const json = await notificationService.markAsRead(ids);
      if (json?.Success) {
        // reload small list
        const js = await notificationService.getNotifications(clientId, 1, 10);
        if (js?.Success) setItems((js.Data || []).map(normalize));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const json = await notificationService.getNotifications(clientId, 1, 10);
      if (json?.Success) {
        const data = json.Data || [];
        setItems(data.map(normalize));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    startSignalR(clientId, (data) => {
      setItems((s) => [normalize(data), ...s]);
    }).catch(() => {});
    return () => { stopSignalR().catch(() => {}); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const navigate = useNavigate();

  const iconFor = (type: string) => {
    switch ((type || '').toLowerCase()) {
      case 'brevet': return <FolderOpenOutlined />;
      case 'contact': return <UserOutlined />;
      case 'client': return <FileTextOutlined />;
      case 'cabinet': return <ApartmentOutlined />;
      default: return <FileTextOutlined />;
    }
  };

  const renderItem = (n: any) => (
    <List.Item actions={[<Button key="r" type="link" onClick={() => markRead([n.Id])}>Marquer lu</Button>]}> 
      <List.Item.Meta
        avatar={<Avatar icon={iconFor(n.Type)} />}
        title={<div style={{ fontWeight: 600 }}>{renderReference(n) ?? n.Message}</div>}
        description={<div style={{ color: '#888', fontSize: 12 }}>{n.Message ? n.Message : ''} <div style={{ marginTop: 4 }}>{n.CreatedAt ? dayjs(n.CreatedAt).fromNow() : ''}</div></div>}
      />
    </List.Item>
  );

  const menu = (
    <div style={{ width: 360 }}>
      {loading ? <Spin /> : (
        <>
          <div style={{ padding: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>Notifications récentes</div>
              <div>
                <Button type="link" onClick={() => navigate('/notifications')}>Toutes les notifications</Button>
              </div>
            </div>
          </div>

          {/* Scrollable list container - keeps the button accessible when many items */}
          <div style={{ maxHeight: 400, overflowY: 'auto', padding: '0 8px 8px 8px' }}>
            <List
              dataSource={items.filter((i:any) => !i.IsRead)}
              renderItem={renderItem}
              locale={{ emptyText: <Empty description="Aucune notification" /> }}
            />
          </div>
        </>
      )}
    </div>
  );

  return (
    <Popover content={menu} trigger={['click']} placement="bottomRight">
      <Badge count={items.filter(i => !i.IsRead).length} offset={[0, 8]}>
        <Button shape="circle" icon={<BellOutlined />} />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
