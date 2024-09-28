export type TODO = any;

export type GUID = string;

export type TableColumn = {
  dataIndex: string | null;
  label: string;
  render?: (value: any, row?: any) => any;
  searchable?: boolean;
  editable?: boolean;
};

export type TableAction = {
  label: string | Function;
  onClick: Function;
  disabled?: boolean;
};
