/*
 * ================================================================================================
 * MODAL CRÉATION INVENTEUR
 * ================================================================================================
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Row, Col, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { inventeurService } from '../../services';
import type { CreateInventeurDto, Inventeur } from '../../types';

interface CreateInventeurModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (inventeur: any) => void;
  existing?: Inventeur[];
  onDuplicate?: (inventeur: any) => void;
}

const CreateInventeurModal: React.FC<CreateInventeurModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  existing = [],
  onDuplicate
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Détection doublon: par email si fourni, sinon (nom + prénom)
  const norm = (s?: string) => (s ?? '').toString().trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
      const email = norm(values.emailInventeur);
      const nom = norm(values.nomInventeur);
      const prenom = norm(values.prenomInventeur);

      const duplicate = existing.find(i => {
        const iEmail = norm(i.emailInventeur);
        const iNom = norm(i.nomInventeur);
        const iPrenom = norm(i.prenomInventeur);
        if (email) return iEmail && iEmail === email;
        // sinon comparer nom + prénom (si prénom absent, on match que sur nom)
        if (prenom) return iNom === nom && iPrenom === prenom;
        return iNom === nom;
      });

      if (duplicate) {
        message.info(t('inventeurs.messages.duplicate'));
        onDuplicate?.(duplicate);
        form.resetFields();
        onCancel();
        return;
      }

      // Mapper les valeurs vers le format attendu par l'API
      const inventeurData: CreateInventeurDto = {
        nomInventeur: values.nomInventeur,
        prenomInventeur: values.prenomInventeur,
        adresseInventeur: values.adresseInventeur,
        emailInventeur: values.emailInventeur,
        telephoneInventeur: values.telephoneInventeur
      };

      const response = await inventeurService.create(inventeurData);
      if (response.success) {
        onSuccess(response.data);
        form.resetFields();
        onCancel();
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'inventeur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={t('inventeurs.modals.create.title')}
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={12}>
              <Form.Item
              name="nomInventeur"
              label={t('inventeurs.fields.lastName')}
              rules={[
                { max: 100, message: t('inventeurs.validation.nameMax') }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder={t('inventeurs.placeholders.lastName')}
                maxLength={100}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="prenomInventeur"
              label={t('inventeurs.fields.firstName')}
              rules={[
                { max: 100, message: t('inventeurs.validation.firstNameMax') }
              ]}
            >
              <Input
                placeholder={t('inventeurs.placeholders.firstName')}
                maxLength={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="adresseInventeur"
              label={t('inventeurs.fields.address')}
              rules={[
                { max: 500, message: t('inventeurs.validation.addressMax') }
              ]}
            >
              <Input
                prefix={<HomeOutlined />}
                placeholder={t('inventeurs.placeholders.address')}
                maxLength={500}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="emailInventeur"
              label={t('inventeurs.fields.email')}
              rules={[
                { type: 'email', message: t('inventeurs.validation.emailInvalid') },
                { max: 255, message: t('inventeurs.validation.emailMax') }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder={t('inventeurs.placeholders.email')}
                maxLength={255}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="telephoneInventeur"
              label={t('inventeurs.fields.phone')}
              rules={[
                { max: 20, message: t('inventeurs.validation.phoneMax') }
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder={t('inventeurs.placeholders.phone')}
                maxLength={20}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateInventeurModal;
