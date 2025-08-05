/*
 * ================================================================================================
 * MODAL AJOUT CLIENT - STARTINGBLOCH
 * ================================================================================================
 */

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Switch, Tabs } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, NumberOutlined } from '@ant-design/icons';
import type { CreateClientDto, Pays } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

interface AddClientModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateClientDto) => Promise<void>;
  loading?: boolean;
}

const AddClientModal: React.FC<AddClientModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [pays, setPays] = useState<Pays[]>([]);
  const [hasUserAccount, setHasUserAccount] = useState(false);

  // Charger les données de référence
  useEffect(() => {
    if (visible) {
      loadReferenceData();
    }
  }, [visible]);

  const loadReferenceData = async () => {
    try {
      // Données mockées temporaires pour pays
      setPays([
        { id: 1, nom: 'France', code: 'FR' },
        { id: 2, nom: 'États-Unis', code: 'US' },
        { id: 3, nom: 'Allemagne', code: 'DE' },
        { id: 4, nom: 'Royaume-Uni', code: 'GB' },
        { id: 5, nom: 'Espagne', code: 'ES' },
        { id: 6, nom: 'Italie', code: 'IT' },
        { id: 7, nom: 'Canada', code: 'CA' },
        { id: 8, nom: 'Belgique', code: 'BE' },
        { id: 9, nom: 'Suisse', code: 'CH' },
        { id: 10, nom: 'Pays-Bas', code: 'NL' },
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données de référence:', error);
    }
  };

  const handleFinish = async (values: any) => {
    try {
      const clientData: CreateClientDto = {
        nomClient: values.nomClient,
        referenceClient: values.referenceClient,
        adresseClient: values.adresseClient,
        codePostal: values.codePostal,
        paysClient: values.paysClient,
        emailClient: values.emailClient,
        telephoneClient: values.telephoneClient,
        // Permissions uniquement si le client aura un compte
        ...(hasUserAccount && {
          canWrite: values.canWrite ?? false,
          canRead: values.canRead ?? true,
          isBlocked: values.isBlocked ?? false,
        })
      };

      await onSubmit(clientData);
      form.resetFields();
      setHasUserAccount(false);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setHasUserAccount(false);
    onCancel();
  };

  return (
    <Modal
      title="Ajouter un nouveau client"
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
        initialValues={{
          canWrite: false,
          canRead: true,
          isBlocked: false
        }}
      >
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Informations générales" key="1">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="nomClient"
                  label="Nom du client"
                  rules={[
                    { required: true, message: 'Le nom du client est obligatoire' },
                    { min: 2, message: 'Le nom doit contenir au moins 2 caractères' },
                    { max: 255, message: 'Le nom ne peut pas dépasser 255 caractères' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nom officiel de l'organisation cliente"
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="referenceClient"
                  label="Référence client"
                  tooltip="Code métier pour identification rapide"
                  rules={[
                    { max: 255, message: 'La référence ne peut pas dépasser 255 caractères' }
                  ]}
                >
                  <Input
                    prefix={<NumberOutlined />}
                    placeholder="Référence interne du client (optionnel)"
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Contact" key="2">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="emailClient"
                  label="Email principal"
                  rules={[
                    { type: 'email', message: 'Format d\'email invalide' },
                    { max: 255, message: 'L\'email ne peut pas dépasser 255 caractères' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="contact@client.com"
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="telephoneClient"
                  label="Téléphone principal"
                  rules={[
                    { pattern: /^[\d\s\-+().]{8,20}$/, message: 'Format de téléphone invalide' }
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="+33 1 23 45 67 89"
                    maxLength={50}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Adresse" key="3">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="adresseClient"
                  label="Adresse postale"
                  rules={[
                    { max: 500, message: 'L\'adresse ne peut pas dépasser 500 caractères' }
                  ]}
                >
                  <TextArea
                    placeholder="Adresse postale complète de l'organisation"
                    maxLength={500}
                    rows={3}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="codePostal"
                  label="Code postal"
                  rules={[
                    { max: 20, message: 'Le code postal ne peut pas dépasser 20 caractères' }
                  ]}
                >
                  <Input
                    placeholder="Code postal"
                    maxLength={20}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="paysClient"
                  label="Pays"
                  tooltip="Pays de domiciliation du client"
                >
                  <Select
                    placeholder="Sélectionner un pays"
                    showSearch
                    optionFilterProp="children"
                  >
                    {pays.map(p => (
                      <Option key={p.id} value={p.nom}>
                        {p.code} - {p.nom}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Compte utilisateur" key="4">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="hasUserAccount"
                  label="Ce client aura-t-il un compte utilisateur ?"
                  tooltip="Détermine si ce client pourra se connecter à l'application"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Oui"
                    unCheckedChildren="Non"
                    onChange={setHasUserAccount}
                  />
                </Form.Item>
              </Col>
            </Row>

            {hasUserAccount && (
              <>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="canRead"
                      label="Permission de lecture"
                      tooltip="Autoriser l'accès en consultation aux données"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Activé"
                        unCheckedChildren="Désactivé"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="canWrite"
                      label="Permission d'écriture"
                      tooltip="Autoriser la création/modification des données"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Activé"
                        unCheckedChildren="Désactivé"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="isBlocked"
                      label="Client bloqué"
                      tooltip="Suspendre l'accès (impayés, violations, etc.)"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Bloqué"
                        unCheckedChildren="Actif"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
          </Tabs.TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default AddClientModal;
