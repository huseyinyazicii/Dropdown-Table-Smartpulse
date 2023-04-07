import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiFillCaretDown } from "react-icons/ai";
import { Box, Popover, InputBase } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { IServerSideGetRowsParams, IServerSideGetRowsRequest } from "ag-grid-enterprise";
import { AgGridEvent } from "ag-grid-community/dist/lib/events";
import { ColDef } from "ag-grid-community/dist/lib/entities/colDef";

import styles from "./style.module.css";
import "ag-grid-enterprise";

export interface ServerDataResult<T = any> {
    rows: Array<T>;
    totalRow: number;
}

interface DropdownTableProps<T = any> {
    pageSize?: number;
    width?: number;
    rowData: Array<T> | ((request: IServerSideGetRowsRequest) => Promise<ServerDataResult<T>>);
    selectedData: (data: Array<T>) => void;
}

function DropdownTable<T>({ pageSize = 5, width = 800, rowData, selectedData }: DropdownTableProps<T>) {
    const [selected, setSelected] = useState<Array<T>>([]);
    const [columnData, setColumnData] = useState<Array<ColDef<T>>>([]);

    const gridRef = useRef<any>();
    const divRef = useRef<any>();

    const defaultColDef = useMemo(
        () => ({
            sortable: true,
            flex: 1,
            resizable: true,
            floatingFilter: true,
            filter: "agTextColumnFilter",
        }),
        []
    );

    useEffect(() => {
        return () => setSelected([]);

        // eslint-disable-next-line
    }, []);

    const onSelectionChanged = () => {
        const selectedRows = gridRef.current.api.getSelectedRows();
        setSelected(selectedRows);
    };

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);
    const handleClick = () => setAnchorEl(divRef.current);
    const handleClose = () => {
        setAnchorEl(null);
        selectedData(selected);
    };

    const writeSelected = () => {
        let write = "";
        selected.forEach((select: any) => (write += `${Object.values(select)[0]}, `));
        return write;
    };

    const onFilterTextBoxChanged = useCallback((e: any) => {
        gridRef.current.api.setQuickFilter(e.target.value);
    }, []);

    const onGridReady = (params: AgGridEvent) => {
        if (typeof rowData !== "function") {
            setColData(rowData[0] || {});
            return;
        }

        const getRows = (params: IServerSideGetRowsParams) => {
            rowData(params.request)
                .then((response: ServerDataResult<T>) => {
                    params.success({ rowData: response.rows, rowCount: response.totalRow });
                    setColData(response.rows[0] || {});
                })
                .catch(() => params.fail());
        };

        params.api.setServerSideDatasource({ getRows });
    };

    const setColData = (row: object) => {
        const column: Array<ColDef<T>> = [];
        const fields = Object.keys(row);
        for (let i = 0; i < fields.length; i++) {
            if (i !== 0) {
                column.push({ field: fields[i], headerName: fields[i].toUpperCase() });
            } else {
                column.push({
                    field: fields[i],
                    headerName: fields[i].toUpperCase(),
                    checkboxSelection: true,
                    showDisabledCheckboxes: true,
                });
            }
        }
        setColumnData(column);
    };

    return (
        <div>
            <div ref={divRef} onClick={handleClick} className={styles.container} style={{ width }}>
                <span>{selected.length > 0 ? writeSelected() : "Select a value..."}</span>
                <AiFillCaretDown />
            </div>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
            >
                {typeof rowData !== "function" && (
                    <Box display="flex" alignItems="center" p={1}>
                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            fullWidth
                            placeholder="Search.."
                            size="small"
                            onChange={onFilterTextBoxChanged}
                            onClick={() => console.log("asd")}
                        />
                    </Box>
                )}

                <div className="ag-theme-alpine" style={{ height: 357, minWidth: width }}>
                    <AgGridReact
                        ref={gridRef}
                        columnDefs={columnData}
                        defaultColDef={defaultColDef}
                        animateRows={true}
                        rowSelection="multiple"
                        pagination={true}
                        paginationPageSize={pageSize}
                        cacheBlockSize={pageSize}
                        onSelectionChanged={onSelectionChanged}
                        onGridReady={onGridReady}
                        rowModelType={typeof rowData === "function" ? "serverSide" : "clientSide"}
                        rowData={typeof rowData === "function" ? null : rowData}
                    />
                </div>
            </Popover>
        </div>
    );
}

export default DropdownTable;
