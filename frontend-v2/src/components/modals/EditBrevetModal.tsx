/*
 * ================================================================================================
 * MODAL ÉDITION BREVET - STARTINGBLOCH
 * ================================================================================================
 */

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Row, Col } from 'antd';
import { FileProtectOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Brevet, UpdateBrevetDto } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

interface EditBrevetModalProps {
  visible: boolean;
  brevet: Brevet | null;
  onCancel: () => void;
  onSubmit: (id: number, values: UpdateBrevetDto) => Promise<void>;
  loading?: boolean;
}

const EditBrevetModal: React.FC<EditBrevetModalProps> = ({
  visible,
  brevet,
  onCancel,
  onSubmit,
  loading = false
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && brevet) {
      form.setFieldsValue({
        ...brevet,
        dateDepot: brevet.dateDepot ? dayjs(brevet.dateDepot) : null,
        dateExpiration: brevet.dateExpiration ? dayjs(brevet.dateExpiration) : null
      });
    }
  }, [visible, brevet, form]);

  const handleSubmit = async () => {
    if (!brevet) return;
    
    try {
      const values = await form.validateFields();
      const formattedValues: UpdateBrevetDto = {
        ...values,
        dateDepot: values.dateDepot?.toISOString(),
        dateExpiration: values.dateExpiration?.toISOString()
      };
      
      await onSubmit(brevet.id, formattedValues);
      form.resetFields();
    } catch (error) {
      console.error('Erreur de validation:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={`Modifier le brevet - ${brevet?.numero || brevet?.referenceFamille}`}
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      okText="Modifier"
      cancelText="Annuler"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          statut: 'En cours'
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="numero"
              label="Numéro de brevet"
              rules={[{ required: true, message: 'Le numéro de brevet est requis' }]}
            >
              <Input
                prefix={<FileProtectOutlined />}
                placeholder="Ex: FR123456789"
                maxLength={50}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="referenceFamille"
              label="Référence famille"
            >
              <Input
                placeholder="Référence de la famille"
                maxLength={50}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="titre"
          label="Titre du brevet"
          rules={[
            { required: true, message: 'Le titre est requis' },
            { min: 10, message: 'Le titre doit contenir au moins 10 caractères' }
          ]}
        >
          <Input
            placeholder="Titre complet du brevet"
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ min: 20, message: 'La description doit contenir au moins 20 caractères' }]}
        >
          <TextArea
            rows={4}
            placeholder="Description détaillée du brevet"
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="commentaire"
          label="Commentaire"
        >
          <TextArea
            rows={3}
            placeholder="Commentaires additionnels"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dateDepot"
              label="Date de dépôt"
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Sélectionner la date"
                format="DD/MM/YYYY"
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dateExpiration"
              label="Date d'expiration"
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Sélectionner la date"
                format="DD/MM/YYYY"
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="statut"
          label="Statut"
          rules={[{ required: true, message: 'Le statut est requis' }]}
        >
          <Select placeholder="Sélectionner un statut">
            <Option value="En cours">En cours</Option>
            <Option value="Accordé">Accordé</Option>
            <Option value="Rejeté">Rejeté</Option>
            <Option value="Expiré">Expiré</Option>
            <Option value="Abandonné">Abandonné</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditBrevetModal;
