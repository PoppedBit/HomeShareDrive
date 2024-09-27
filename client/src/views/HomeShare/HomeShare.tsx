import { TableRows, Window } from "@mui/icons-material";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { PageHeader, Table } from "components";
import { useHomeShare } from "hooks";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { TableColumn, TODO } from "types/types";

const HomeShare = () => {

  const [view, setView] = useState<'table' | 'grid'>('table');

  const homeshare = useSelector((state: TODO) => state.homeshare);
  const { path, items } = homeshare;

  const { isLoading, getDirectoryContents } = useHomeShare();

  useEffect(() => {
    if(!isLoading && !items){
      getDirectoryContents(path);
    }
  }, [path, items, isLoading, getDirectoryContents]);

  const columns: TableColumn[] = [
    { dataIndex: 'name', label: 'Name' },
  ];

  return (
    <>
      <PageHeader text={path} />
      <div>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_event, value) => setView(value)}
        >
          <ToggleButton value='table'>
            <TableRows />
          </ToggleButton>
          <ToggleButton value='grid'>
            <Window />
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <Table data={items ?? []} columns={columns} actions={[]} pagination={false}/>
    </>
  );
};

export default HomeShare;