import { FC, Fragment, useEffect, useState } from 'react';
import {
  Table as MTable,
  TableHead,
  TableBody,
  TablePagination,
  TableRow,
  TableCell,
  TextField,
  TableFooter
} from '@mui/material';

import { GUID, TODO, TableColumn } from 'shared/types';
import { ActionButton } from './ActionButton';
import { Container, DragIcon } from './styles';

interface DraggableProps {
  disabled?: boolean;
  onDragEnd: (row: any, newIndex: number) => void;
}

interface Props {
  data: any[];
  columns: TableColumn[];
  actions?: TODO[];
  noHead?: boolean;
  pagination?: boolean;
  ExpandableRow?: FC;
  footer?: TODO;
  draggable?: DraggableProps;
  idField?: string;
}

const Table = (props: Props) => {
  const {
    data,
    columns,
    actions = null,
    noHead = false,
    pagination = true,
    ExpandableRow = null,
    footer = null,
    draggable = null,
    idField = 'id'
  } = props;

  const [localData, setLocalData] = useState<any[]>(data);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(pagination ? 10 : data.length);
  const [search, setSearch] = useState<TODO>({});
  const [editingCell, setEditingCell] = useState<TODO>(null);
  const [dragging, setDragging] = useState<string | number | null>(null);

  useEffect(() => {
    if (data) {
      setLocalData(data);
      if (!pagination) {
        setRowsPerPage(data.length);
      }
    }
  }, [data]);

  let cols = columns;
  if (actions) {
    cols = [
      ...cols,
      {
        dataIndex: null,
        label: 'Actions',
        render: (_value: any, row: any) => {
          return <ActionButton actions={actions} row={row} />;
        }
      }
    ];
  }

  const handleChangePage = (_event: TODO, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: TODO) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleColumnSearch = (dataIndex: string, value: any) => {
    setSearch({
      ...search,
      [dataIndex]: value
    });
  };

  // Draggable
  const handleDragStart = (rowId: GUID | number) => {
    setDragging(rowId);
  };

  const handleDragOver = (rowId: GUID | number) => {
    if (!dragging || rowId === dragging) {
      return;
    }

    const draggedIndex = localData.findIndex((d) => d.id === dragging);
    const draggedItem = localData[draggedIndex];

    const rowIndex = localData.findIndex((d) => d.id === rowId);

    // Move items around while dragging
    let newData = [...localData];
    newData.splice(draggedIndex, 1);
    newData.splice(rowIndex, 0, draggedItem);

    setLocalData(newData);
  };

  const getCellEditor = (data: any, column: TableColumn) => {
    const { dataIndex } = column;

    const value = data[dataIndex!];

    return <TextField value={value} />;
  };

  const filterData = (data: any[]) => {
    let filteredData: any[] = [];
    data.forEach((d) => {
      let filtered = false;

      Object.keys(search).forEach((key) => {
        const searchValue = search[key];
        if (![null, ''].includes(searchValue)) {
          if (!d[key].toLowerCase().includes(searchValue.toLowerCase())) {
            filtered = true;
          }
        }
      });

      if (!filtered) {
        filteredData.push(d);
      }
    });

    const startIndex = page * rowsPerPage;

    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  };

  const searchBoxes = cols.map((c, i) => {
    const { searchable, dataIndex } = c;
    let contents = null;

    if (searchable) {
      const searchValue = search[dataIndex!] ? search[dataIndex!] : '';

      contents = (
        <TextField
          placeholder="Search"
          value={searchValue}
          onChange={(e) => handleColumnSearch(dataIndex!, e.target.value)}
        />
      );
    }

    return <TableCell key={i}>{contents}</TableCell>;
  });

  const labels = cols.map((c, i) => {
    const { label = '' } = c;
    return <TableCell key={i}>{label}</TableCell>;
  });

  const rows = filterData(localData).map((d) => {
    const cells = cols.map((c, j) => {
      const { dataIndex, render, editable = false } = c;

      const cellKey = `${d[idField]}-${j}`;
      const isEditing = editingCell === cellKey;

      let contents = d[dataIndex!];
      if (render) {
        contents = render(d[dataIndex!], d);
      }

      if (isEditing) {
        contents = getCellEditor(c, d);
      }

      return (
        <TableCell
          key={cellKey}
          onClick={
            editable
              ? () => {
                  if (!isEditing) {
                    setEditingCell(cellKey);
                  }
                }
              : undefined
          }
        >
          {contents}
        </TableCell>
      );
    });

    return (
      <Fragment key={d[idField]}>
        <TableRow
          key={d[idField]}
          draggable={draggable ? true : false} // TODO make it use draggable.disabled
          onDragStart={() => handleDragStart(d[idField])}
          onDragOver={() => handleDragOver(d[idField])}
          onDragEnd={() => {
            const newIndex = localData.findIndex((row) => row.id === d[idField]);
            draggable!.onDragEnd(d, newIndex);
            setDragging(null);
          }}
        >
          {draggable !== null && (
            <TableCell>
              <DragIcon />
            </TableCell>
          )}
          {cells}
        </TableRow>
        {ExpandableRow !== null && (
          <TableRow key={`${d[idField]}-expanded`}>
            <TableCell colSpan={cols.length}>
              <ExpandableRow
                // @ts-ignore
                data={d}
              />
            </TableCell>
          </TableRow>
        )}
      </Fragment>
    );
  });

  return (
    <Container>
      <MTable>
        {!noHead && (
          <TableHead>
            <TableRow>
              {draggable !== null && <TableCell></TableCell>}
              {searchBoxes}
            </TableRow>
            <TableRow>
              {draggable !== null && <TableCell></TableCell>}
              {labels}
            </TableRow>
          </TableHead>
        )}
        <TableBody>{rows}</TableBody>
        {footer !== null && <TableFooter>{footer}</TableFooter>}
      </MTable>
      {pagination !== false ? (
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={localData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          color="primary"
        />
      ) : null}
    </Container>
  );
};

export default Table;
