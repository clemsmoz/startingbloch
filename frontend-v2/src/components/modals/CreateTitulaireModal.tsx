/*
 * ================================================================================================
 * MODAL CRÉATION TITULAIRE
 * ================================================================================================
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Row, Col, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { titulaireService } from '../../services';
import type { CreateTitulaireDto, Titulaire } from '../../types';

interface CreateTitulaireModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (titulaire: any) => void;
  existing?: Titulaire[];
  onDuplicate?: (titulaire: any) => void;
}

const CreateTitulaireModal: React.FC<CreateTitulaireModalProps> = ({
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
      // Détection doublon: par email si fourni, sinon par nom
  const norm = (s?: string) => (s ?? '').toString().trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
      const email = norm(values.emailTitulaire);
      const nom = norm(values.nomTitulaire);
      const duplicate = existing.find(t => {
        const tEmail = norm(t.emailTitulaire);
        const tNom = norm(t.nomTitulaire);
        if (email) return tEmail && tEmail === email;
        return tNom === nom;
      });

      if (duplicate) {
        message.info(t('titulaires.messages.duplicate'));
        onDuplicate?.(duplicate);
        form.resetFields();
        onCancel();
        return;
      }

      // Mapper les valeurs vers le format attendu par l'API
      const titulaireData: CreateTitulaireDto = {
        nomTitulaire: values.nomTitulaire,
        adresseTitulaire: values.adresseTitulaire,
        emailTitulaire: values.emailTitulaire,
        telephoneTitulaire: values.telephoneTitulaire
      };

      const response = await titulaireService.create(titulaireData);
      if (response.success) {
        onSuccess(response.data);
        form.resetFields();
        onCancel();
      }
    } catch (error) {
      console.error('Erreur lors de la création du titulaire:', error);
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
      title={t('titulaires.modals.create.title')}
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
          <Col span={24}>
            <Form.Item
              name="nomTitulaire"
              label={t('titulaires.fields.lastName')}
              rules={[
                { max: 100, message: t('titulaires.validation.nameMax') }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder={t('titulaires.placeholders.lastName')}
                maxLength={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="adresseTitulaire"
              label={t('titulaires.fields.address')}
              rules={[
                { max: 500, message: t('titulaires.validation.addressMax') }
              ]}
            >
              <Input
                prefix={<HomeOutlined />}
                placeholder={t('titulaires.placeholders.address')}
                maxLength={500}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="emailTitulaire"
              label={t('titulaires.fields.email')}
              rules={[
                { type: 'email', message: t('titulaires.validation.emailInvalid') },
                { max: 255, message: t('titulaires.validation.emailMax') }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder={t('titulaires.placeholders.email')}
                maxLength={255}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="telephoneTitulaire"
              label={t('titulaires.fields.phone')}
              rules={[
                { max: 20, message: t('titulaires.validation.phoneMax') }
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder={t('titulaires.placeholders.phone')}
                maxLength={20}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateTitulaireModal;
