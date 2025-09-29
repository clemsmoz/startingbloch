import React from 'react';
import { Modal, Button, Descriptions, Tag, Space } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  client?: any;
  file?: File | null;
}

const ExcelImportRecapModal: React.FC<Props> = ({ visible, onCancel, onConfirm, client, file }) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('brevets.import.recapTitle') ?? 'Récapitulatif import Excel'}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>{t('actions.cancel') ?? 'Annuler'}</Button>,
        <Button key="confirm" type="primary" onClick={onConfirm}>{t('brevets.import.confirmAndCreate') ?? 'Valider et créer'}</Button>
      ]}
      width={800}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label={t('brevets.import.client') ?? 'Client'}>
            {client ? (client.nomClient ?? client.NomClient ?? client.nom ?? client.Nom) : (t('common.notProvided') ?? 'Non renseigné')}
          </Descriptions.Item>
          <Descriptions.Item label={t('brevets.import.file') ?? 'Fichier'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileExcelOutlined style={{ fontSize: 20, color: '#2f9e44' }} />
              <div>
                <div style={{ fontWeight: 600 }}>{file?.name ?? t('common.notProvided')}</div>
                <div style={{ color: '#666' }}>{file ? `${(file.size / 1024).toFixed(1)} KB` : ''}</div>
              </div>
            </div>
          </Descriptions.Item>
        </Descriptions>

        <div style={{ color: '#666' }}>{t('brevets.import.recapHint') ?? 'Vérifiez les informations avant de valider. Après validation, les brevets seront créés côté serveur.'}</div>
        <div>
          <Tag color="blue">{t('brevets.import.actionPreview') ?? 'Aperçu prêt (génération non exécutée)'}</Tag>
        </div>
      </Space>
    </Modal>
  );
};

export default ExcelImportRecapModal;
