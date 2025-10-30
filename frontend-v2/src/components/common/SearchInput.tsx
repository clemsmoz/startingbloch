/*
 * ================================================================================================
 * COMPOSANT SEARCH INPUT
 * ================================================================================================
 */

import React, { useRef, useState, useEffect } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const { Search } = Input;

const SearchContainer = styled(motion.div)`
  .ant-input-search {
    .ant-input {
      border-radius: 8px;
    }
    
    .ant-input-search-button {
      border-radius: 0 8px 8px 0;
    }
  }
`;

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  loading?: boolean;
  allowClear?: boolean;
  size?: 'small' | 'middle' | 'large';
  style?: React.CSSProperties;
  /** debounce en ms pour déclencher la recherche pendant la frappe */
  debounceMs?: number;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Rechercher...',
  onSearch,
  loading = false,
  allowClear = true,
  size = 'middle',
  style
  , debounceMs = 300
}) => {
  const [value, setValue] = useState('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      onSearch(v);
    }, debounceMs);
  };

  return (
    <SearchContainer
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Search
        placeholder={placeholder}
        allowClear={allowClear}
        onSearch={onSearch}
        onChange={handleChange}
        value={value}
        loading={loading}
        size={size}
        style={style}
        enterButton={<SearchOutlined />}
      />
    </SearchContainer>
  );
};

export default SearchInput;
