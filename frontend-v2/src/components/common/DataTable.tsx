/*
 * ================================================================================================
 * COMPOSANT DATA TABLE
 * ================================================================================================
 */

import { Table, TableProps } from 'antd';
import { ColumnsType } from 'antd/es/table';

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

  return (
    <Table<T>
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination !== false ? { ...defaultPagination, ...pagination } : false}
      scroll={{ x: 'max-content' }}
      {...props}
    />
  );
}

export default DataTable;
