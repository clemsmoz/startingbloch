import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, List, Typography, Alert, Empty, Divider, Tag, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const ImportResultPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const rawState = location.state as unknown as Record<string, any> | undefined;
  const created: { familyRef?: string; id?: number }[] = Array.isArray(rawState?.created) ? rawState.created : [];
  const fileName: string | null = rawState?.fileName ?? null;
  const processing: boolean = rawState?.processing === true;

  return (
    <div style={{ padding: 24 }}>
  <Card style={{ borderRadius: 8, padding: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={3} style={{ margin: 0 }}>{t('brevets.import.resultTitle') ?? "Récapitulatif de l'import"}</Title>
            {fileName && <Text type="secondary">{t('brevets.import.file') ?? 'Fichier'}: <Text strong>{fileName}</Text></Text>}
          </Col>
          <Col>
            <Tag color="green">{t('brevets.import.addedCount', { count: created.length }) ?? `${created.length} références ajoutées`}</Tag>
          </Col>
        </Row>

        <Divider />

        {processing && (
          <Alert type="info" showIcon message={t('brevets.import.processing') ?? 'Import en cours...'} style={{ marginBottom: 12 }} />
        )}

        {created.length === 0 ? (
          <Empty description={t('brevets.import.noneAdded') ?? 'Aucune référence ajoutée'} />
        ) : (
          <List
            bordered
            dataSource={created}
            renderItem={(it) => (
              <List.Item style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong style={{ fontSize: 14 }}>{it.familyRef ?? t('common.notProvided')}</Text>
                </div>
                <div>
                  {it.id ? <Text type="secondary">{t('common.idPrefix') ?? 'ID'}: <Text code>#{it.id}</Text></Text> : <Text type="secondary">{t('common.notProvided')}</Text>}
                </div>
              </List.Item>
            )}
          />
        )}

        <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
          <Button onClick={() => navigate('/brevets')}>{t('actions.backToList') ?? 'Retour aux brevets'}</Button>
        </div>
      </Card>
    </div>
  );
};

export default ImportResultPage;
