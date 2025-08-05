/*
 * ================================================================================================
 * COMPOSANT SEARCH INPUT
 * ================================================================================================
 */

import React from 'react';
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
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Rechercher...',
  onSearch,
  loading = false,
  allowClear = true,
  size = 'middle',
  style
}) => {
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
        loading={loading}
        size={size}
        style={style}
        enterButton={<SearchOutlined />}
      />
    </SearchContainer>
  );
};

export default SearchInput;
