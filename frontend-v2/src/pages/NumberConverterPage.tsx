import React, { useState } from 'react';
import { Button, Input, Select, Card, Typography } from 'antd';
import patman from '../utils/patmanConverter';
import { useAuthStore } from '../store/authStore';

const { Title, Text } = Typography;

const NumberConverterPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [typeNum, setTypeNum] = useState('depot');
  const [output, setOutput] = useState<string | null>(null);
  const { user } = useAuthStore();
  const allowed = user && (user.role === 'Admin' || user.role === 'User');
  if (!allowed) {
    return (
      <Card>
        <Title level={4}>Convertisseur de numéros</Title>
      </Card>
    );
  }

  const doConvert = () => {
    try {
      const res = patman.convert(input, typeNum);
      setOutput(res);
    } catch (err) {
      setOutput(`Erreur: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <Card style={{ maxWidth: 800 }}>
      <Title level={3}>Convertisseur Office → PatMan</Title>
      <div style={{ marginBottom: 12 }}>
        <Select value={typeNum} onChange={v=>setTypeNum(String(v))} style={{ width: 220 }}>
          <Select.Option value="depot">Dépôt</Select.Option>
          <Select.Option value="publication">Publication</Select.Option>
          <Select.Option value="delivrance">Délivrance</Select.Option>
        </Select>
      </div>

      <Input.TextArea rows={3} value={input} onChange={e=>setInput(e.target.value)} placeholder="Entrez le numéro (ex: FR 17 00574)" />
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <Button type="primary" onClick={doConvert}>Convertir</Button>
        <Button onClick={()=>{ setInput(''); setOutput(null); }}>Réinitialiser</Button>
      </div>

      <div style={{ marginTop: 16 }}>
        <Title level={5}>Résultat</Title>
        <Card>
          <Text code>{output ?? '—'}</Text>
        </Card>
      </div>
    </Card>
  );
};

export default NumberConverterPage;
