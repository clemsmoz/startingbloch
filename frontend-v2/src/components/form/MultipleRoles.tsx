/*
 * ================================================================================================
 * COMPOSANT MULTIPLE RÔLES - STARTINGBLOCH
 * ================================================================================================
 * 
 * Composant pour gérer plusieurs rôles d'un contact.
 * 
 * ================================================================================================
 */

import React from 'react';
import { Input, Button, Space, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';

interface RoleEntry {
  role: string;
}

interface MultipleRolesProps {
  value?: RoleEntry[];
  onChange?: (roles: RoleEntry[]) => void;
  disabled?: boolean;
}

const MultipleRoles: React.FC<MultipleRolesProps> = ({
  value = [],
  onChange,
  disabled = false
}) => {
  const handleAdd = () => {
    const newRoles = [...value, { role: '' }];
    onChange?.(newRoles);
  };

  const handleRemove = (index: number) => {
    const newRoles = value.filter((_, i) => i !== index);
    onChange?.(newRoles);
  };

  const handleRoleChange = (index: number, role: string) => {
    const newRoles = [...value];
    newRoles[index] = { role };
    onChange?.(newRoles);
  };

  return (
    <div>
      {value.map((roleEntry, index) => (
        <Card 
          key={index} 
          size="small" 
          style={{ marginBottom: 8 }}
          title={
            <Space>
              <UserOutlined />
              Rôle {index + 1}
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
          <Input
            placeholder="Ex: Responsable brevets, Inventeur..."
            value={roleEntry.role}
            onChange={(e) => handleRoleChange(index, e.target.value)}
            disabled={disabled}
            prefix={<UserOutlined />}
          />
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
        Ajouter un rôle
      </Button>
    </div>
  );
};

export default MultipleRoles;
