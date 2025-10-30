/*
 * ================================================================================================
 * COMPOSANT MULTIPLE TÉLÉPHONES - STARTINGBLOCH
 * ================================================================================================
 * 
 * Composant pour gérer plusieurs numéros de téléphone avec leurs types.
 * 
 * ================================================================================================
 */

import React from 'react';
import { Input, Select, Button, Space, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, PhoneOutlined } from '@ant-design/icons';

const { Option } = Select;

interface PhoneEntry {
  numero: string;
  type: string;
}

interface MultiplePhonesProps {
  value?: PhoneEntry[];
  onChange?: (phones: PhoneEntry[]) => void;
  disabled?: boolean;
}

const phoneTypes = [
  { label: 'Principal', value: 'principal' },
  { label: 'Mobile', value: 'mobile' },
  { label: 'Fixe', value: 'fixe' },
  { label: 'Professionnel', value: 'professionnel' },
  { label: 'Autre', value: 'autre' }
];

const MultiplePhones: React.FC<MultiplePhonesProps> = ({
  value = [],
  onChange,
  disabled = false
}) => {
  const handleAdd = () => {
    const newPhones = [...value, { numero: '', type: 'principal' }];
    onChange?.(newPhones);
  };

  const handleRemove = (index: number) => {
    const newPhones = value.filter((_, i) => i !== index);
    onChange?.(newPhones);
  };

  const handlePhoneChange = (index: number, numero: string) => {
    const newPhones = [...value];
    newPhones[index] = { ...newPhones[index], numero };
    onChange?.(newPhones);
  };

  const handleTypeChange = (index: number, type: string) => {
    const newPhones = [...value];
    newPhones[index] = { ...newPhones[index], type };
    onChange?.(newPhones);
  };

  return (
    <div>
      {value.map((phoneEntry, index) => (
        <Card 
          key={index} 
          size="small" 
          style={{ marginBottom: 8 }}
          title={
            <Space>
              <PhoneOutlined />
              Téléphone {index + 1}
            </Space>
          }
          extra={
            value.length > 1 && (
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleRemove(index)}
                disabled={disabled}
              />
            )
          }
        >
          <Space.Compact style={{ width: '100%' }}>
            <Input
              style={{ width: '70%' }}
              placeholder="+33 1 23 45 67 89"
              value={phoneEntry.numero}
              onChange={(e) => handlePhoneChange(index, e.target.value)}
              disabled={disabled}
              prefix={<PhoneOutlined />}
            />
            <Select
              style={{ width: '30%' }}
              value={phoneEntry.type}
              onChange={(type) => handleTypeChange(index, type)}
              disabled={disabled}
            >
              {phoneTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Space.Compact>
        </Card>
      ))}
      
      <Button
        type="dashed"
        onClick={handleAdd}
        block
        icon={<PlusOutlined />}
        disabled={disabled}
        style={{ marginTop: 8 }}
      >
        Ajouter un téléphone
      </Button>
    </div>
  );
};

export default MultiplePhones;
