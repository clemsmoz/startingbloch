/*
 * ================================================================================================
 * COMPOSANT DATA TABLE
 * ================================================================================================
 */

import { Table, TableProps } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

interface DataTableProps<T = any> extends Omit<TableProps<T>, 'columns' | 'dataSource'> {
  columns: ColumnsType<T>;
  data: T[];
  loading?: boolean;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onView?: (record: T) => void;
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  ...props
}: Readonly<DataTableProps<T>>) {
  const defaultPagination = {
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) => 
      `${range[0]}-${range[1]} sur ${total} éléments`,
  };

  const { t } = useTranslation();

  // Ensure column titles that are i18n keys (strings) are translated at render-time.
  const translatedColumns = columns.map((col) => {
    // If title is a string, assume it's an i18n key and translate it.
    if (col && typeof (col as any).title === 'string') {
      return { ...col, title: t((col as any).title) } as typeof col;
    }
    return col;
  });

  return (
    <Table<T>
      columns={translatedColumns}
      dataSource={data}
      loading={loading}
      pagination={pagination !== false ? { ...defaultPagination, ...pagination } : false}
      scroll={{ x: 'max-content' }}
      {...props}
    />
  );
}

export default DataTable;
