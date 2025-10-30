/*
 * ================================================================================================
 * COMPOSANT MULTIPLE EMAILS - STARTINGBLOCH
 * ================================================================================================
 * 
 * Composant pour gérer plusieurs adresses email avec leurs types.
 * 
 * ================================================================================================
 */

import React from 'react';
import { Input, Select, Button, Space, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, MailOutlined } from '@ant-design/icons';

const { Option } = Select;

interface EmailEntry {
  email: string;
  type: string;
}

interface MultipleEmailsProps {
  value?: EmailEntry[];
  onChange?: (emails: EmailEntry[]) => void;
  disabled?: boolean;
}

const emailTypes = [
  { label: 'Principal', value: 'principal' },
  { label: 'Professionnel', value: 'professionnel' },
  { label: 'Personnel', value: 'personnel' },
  { label: 'Autre', value: 'autre' }
];

const MultipleEmails: React.FC<MultipleEmailsProps> = ({
  value = [],
  onChange,
  disabled = false
}) => {
  const handleAdd = () => {
    const newEmails = [...value, { email: '', type: 'principal' }];
    onChange?.(newEmails);
  };

  const handleRemove = (index: number) => {
    const newEmails = value.filter((_, i) => i !== index);
    onChange?.(newEmails);
  };

  const handleEmailChange = (index: number, email: string) => {
    const newEmails = [...value];
    newEmails[index] = { ...newEmails[index], email };
    onChange?.(newEmails);
  };

  const handleTypeChange = (index: number, type: string) => {
    const newEmails = [...value];
    newEmails[index] = { ...newEmails[index], type };
    onChange?.(newEmails);
  };

  return (
    <div>
      {value.map((emailEntry, index) => (
        <Card 
          key={index} 
          size="small" 
          style={{ marginBottom: 8 }}
          title={
            <Space>
              <MailOutlined />
              Email {index + 1}
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
              placeholder="email@example.com"
              value={emailEntry.email}
              onChange={(e) => handleEmailChange(index, e.target.value)}
              disabled={disabled}
              prefix={<MailOutlined />}
            />
            <Select
              style={{ width: '30%' }}
              value={emailEntry.type}
              onChange={(type) => handleTypeChange(index, type)}
              disabled={disabled}
            >
              {emailTypes.map(type => (
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
        Ajouter un email
      </Button>
    </div>
  );
};

export default MultipleEmails;
