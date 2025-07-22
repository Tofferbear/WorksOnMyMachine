/*
* This reusable component is for adding a common containerized table.
*/

import React from 'react';
import PropTypes from 'prop-types';
import ContainerButton from './ContainerButton';
import CollapsibleContainer from './CollapsibleContainer';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import TableFooter from './TableFooter';
import ExcelExporter from './ExcelExporter';
import PagingControl from './PagingControl';
import TableSortableColumn from './TableSortableColumn';

export default class ContainerTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            enableCollapse: false,
            isCollapsed: false,
            pagingCount: 0,
            pagingLimit: 200,
            pagingLimits: [ 5, 10, 25, 50, 100, 200 ],
            pagingOffset: 0,
            mergedCustomActionButtons: {},
            excelData: []
        }

        this.focusedRowRef = React.createRef();
    }

    componentDidMount() {
        let stateuUpdate = {
            enableCollapse: this.state.enableCollapse,
            isCollapsed: this.state.isCollapsed,
            pagingCount: this.state.pagingCount,
            pagingLimit: this.state.pagingLimit,
            pagingLimits: this.state.pagingLimits,
            mergedCustomActionButtons: this.state.mergedCustomActionButtons
        };

        if (this.props.enableCollapse) {
            stateuUpdate.enableCollapse = this.props.enableCollapse
        }

        if (this.props.isCollapsed) {
            stateuUpdate.isCollapsed = this.props.isCollapsed
        }

        if (this.props.pagingCount) {
            stateuUpdate.pagingCount = this.props.pagingCount;
        }

        if (this.props.pagingLimit) {
            stateuUpdate.pagingLimit = this.props.pagingLimit
        }

        if (this.props.pagingLimits) {
            stateuUpdate.pagingLimits = this.props.pagingLimits
        }

        if (this.props.customActionButtons) {
            stateuUpdate.mergedCustomActionButtons = this.generateCustomActionButtons();
        }

        this.setState({
            enableCollapse: stateuUpdate.enableCollapse,
            isCollapsed: stateuUpdate.isCollapsed,
            pagingCount: stateuUpdate.pagingCount,
            pagingLimit: stateuUpdate.pagingLimit,
            pagingLimits: stateuUpdate.pagingLimits,
            mergedCustomActionButtons: stateuUpdate.mergedCustomActionButtons
        }, async () => {
            await this.setupDefaultFiltersAndSearches();
        });
    }

    componentDidUpdate(prevProps, prevState) {
        let stateuUpdate = {
            updateState: false,
            isCollapsed: this.state.isCollapsed,
            pagingCount: this.state.pagingCount,
            pagingOffset: this.state.pagingOffset,
            mergedCustomActionButtons: this.state.mergedCustomActionButtons,
            excelData: this.state.excelData
        };

        if (this.props.focusedRowIndex !== prevProps.focusedRowIndex) {
            this.scrollToFocusedRow();
        }

        if (this.props.isCollapsed !== prevProps.isCollapsed) {
            stateuUpdate.isCollapsed = this.props.isCollapsed;
            stateuUpdate.updateState = true;
        }

        if (this.props.pagingCount !== prevProps.pagingCount) {
            if (this.props.pagingCount !== this.state.pagingCount) {
                stateuUpdate.pagingCount = this.props.pagingCount;
                stateuUpdate.pagingOffset = 0;
                stateuUpdate.updateState = true;
            }
        }

        if (this.props.pagingOffset !== prevProps.pagingOffset) {
            stateuUpdate.pagingOffset = this.props.pagingOffset;
            stateuUpdate.updateState = true;
        }

        if (this.props.customActionButtons !== prevProps.customActionButtons) {
            stateuUpdate.mergedCustomActionButtons = this.generateCustomActionButtons();
            stateuUpdate.updateState = true;
        }

        if (this.props.tableData !== prevProps.tableData) {
            if (this.props.exportToExcelFunction) {
                stateuUpdate.excelData = this.props.exportToExcelFunction(this.props.tableData);
                stateuUpdate.updateState = true;
            }
        }

        if (stateuUpdate.updateState) {
            this.setState({
                isCollapsed: stateuUpdate.isCollapsed,
                pagingCount: stateuUpdate.pagingCount,
                pagingOffset: stateuUpdate.pagingOffset,
                mergedCustomActionButtons: stateuUpdate.mergedCustomActionButtons,
                excelData: stateuUpdate.excelData
            });
        }
    }

    render() {
        const mergedHeaders = [...(!this.state.enableCollapse ? this.generateDefaultHeaders() : []), ...(this.props.tableHeaders ? this.props.tableHeaders : [])];
        const mergedFooters = [...this.generateDefaultFooters(), ...(this.props.tableFooters ? this.props.tableFooters : [])];

        return (
            <CollapsibleContainer
                customActionButtons={this.state.mergedCustomActionButtons}
                enableCollapse={this.state.enableCollapse}
                isCollapsed={this.state.isCollapsed}
                label={`${this.props.label}: ${this.props.tableData.length === 0 ? this.props.noDataHeaderMessage ? this.props.noDataHeaderMessage : "Loading..." : this.props.tableData.length}`}
            >
                {
                    mergedHeaders &&
                    mergedHeaders.length > 0 &&
                    mergedHeaders.map((header) => (
                        header
                    ))
                }
                <TableBody>
                    <table
                        cellPadding={5}
                        cellSpacing={0}
                        style={{
                            userSelect: "none"
                        }}
                    >
                        <thead>
                            <tr>
                                {
                                    Object.keys(this.props.tableColumns).map((columnSource, columnSourceKey) => (
                                        <TableSortableColumn
                                            label={this.props.tableColumns[columnSource].columnLabel}
                                            columnSource={columnSource}
                                            onAddToFilterClick={this.props.tableColumns[columnSource].addToFilterOrSearchClick}
                                            key={columnSourceKey}
                                        />
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.props.tableData.map((tableRow, tableDataKey) => (
                                    <tr
                                        key={tableDataKey}
                                        onClick={(event) => {
                                            this.onTableRowClicked(event, tableRow);
                                        }}
                                        ref={
                                            (this.props.focusedRowIndex && this.props.focusedRowIndex > -1) ?
                                            (tableDataKey === this.props.focusedRowIndex ? this.focusedRowRef : null) :
                                            null
                                        }
                                        style={{
                                            backgroundColor: (this.isRowSelected(tableRow)) ? '#1d83fb' : '#1c1d1f'
                                        }}
                                    >
                                        {
                                            Object.keys(this.props.tableColumns).map((columnSource, columnKey) => (
                                                <td
                                                    key={columnKey}
                                                >
                                                    <label
                                                        onClick={(event) => {
                                                            if (this.columnHasOnClick(columnSource)) {
                                                                this.onColumnItemClick(event, tableRow, columnSource);
                                                            }
                                                        }}
                                                        style={
                                                            this.columnHasOnClick(columnSource) ?
                                                            { color: 'lightgray', textDecoration: 'underline', cursor: 'pointer' } :
                                                            {}
                                                        }
                                                    >
                                                        {tableRow[columnSource]}
                                                    </label>
                                                </td>
                                            ))
                                        }
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </TableBody>
                {
                    mergedFooters &&
                    mergedFooters.length > 0 &&
                    mergedFooters.map((footer) => (
                        footer
                    ))
                }
            </CollapsibleContainer>
        );
    }


    // events
    onClearSelectionClick = () => {
        if (this.props.onSelectedTableRowClicked) {
            this.props.onSelectedTableRowClicked([]);
        }
    }

    onColumnItemClick = (event, tableRow, columnSource) => {
        event.stopPropagation();

        if (this.columnHasOnClick(columnSource)) {
            this.props.tableColumns[columnSource].onClick(tableRow, columnSource);
        }
    }

    onTableRowClicked = (event, tableRow) => {
        if (!this.props.selectedTableRows) {
            return;
        }

        const selectedIndex = this.props.selectedTableRows.indexOf(tableRow);
        const selectedTableRows = [];

        if (this.props.enableMultiRowSelect && (event.shiftKey || event.ctrlKey)) {
            selectedTableRows = this.props.selectedTableRows;

            if (event.shiftKey) {
                const shiftedTableDataIndex = this.props.tableData.indexOf(tableRow);
                const lastSelectedTableDataIndex = this.props.tableData.indexOf(this.props.selectedTableRows[this.props.selectedTableRows.length - 1]);

                if (shiftedTableDataIndex < lastSelectedTableDataIndex) {
                    for (let i = shiftedTableDataIndex; i < lastSelectedTableDataIndex; i++) {
                        if (!this.isRowSelected(this.props.tableData[i])) {
                            selectedTableRows.push(this.props.tableData[i]);
                        }
                    }
                } else {
                    for (let i = lastSelectedTableDataIndex + 1; i <= shiftedTableDataIndex; i++) {
                        if (!this.isRowSelected(this.props.tableData[i])) {
                            selectedTableRows.push(this.props.tableData[i]);
                        }
                    }
                }
            } else {
                if (event.ctrlKey) {
                    if (selectedIndex > -1) {
                        selectedTableRows.splice(selectedIndex, 1);
                    } else {
                        selectedTableRows.push(tableRow);
                    }
                }
            }
        } else {
            if (selectedIndex === -1) {
                selectedTableRows.push(tableRow);
            }
        }

        if (this.props.onSelectedTableRowClicked) {
            this.props.onSelectedTableRowClicked(selectedTableRows);
        }
    }

    // helper methods
    columnHasOnClick(columnSource) {
        return (
            this.props.tableColumns &&
            columnSource &&
            this.props.tableColumns.hasOwnProperty(columnSource) &&
            this.props.tableColumns[columnSource].hasOwnProperty('onClick')
        );
    }

    generateCustomActionButtons() {
        return {
            ...(this.props.customActionButtons ? this.props.customActionButtons : {}),
            ...(this.props.exportToExcelFunction ?
                {
                    "Excel Export": (
                        <ExcelExporter
                            data={this.state.excelData}
                            disabled={this.props.tableData.length === 0}
                            title={this.props.label}
                        />
                    )
                } :
                {})
        };
    }

    generateDefaultFooters() {
        return [
            <TableFooter key="defaultFooter">
                {
                    this.props.onSelectedTableRowClicked &&
                    <ContainerButton
                        label="Clear Selection"
                        onClick={this.onClearSelectionClick}
                    />
                }
                {
                    this.props.pagingOnOffsetChange && !this.props.pagingOnLimitChange &&
                    <PagingControl
                        count={this.state.pagingCount}
                        offset={this.state.pagingOffset}
                        onOffsetChange={this.props.pagingOnOffsetChange}
                    />
                }
                {
                    this.props.pagingOnOffsetChange && this.props.pagingOnLimitChange &&
                    <PagingControl
                        count={this.state.pagingCount}
                        offset={this.state.pagingOffset}
                        onOffsetChange={this.props.pagingOnOffsetChange}
                        limit={this.state.pagingLimit}
                        limits={this.state.pagingLimits}
                        onLimitChange={this.props.pagingOnLimitChange}
                    />
                }
            </TableFooter>
        ];
    }

    generateDefaultHeaders() {
        return [
            <TableHeader key="defaultHeader">
                <span>
                    {this.props.label}: {this.props.tableData.length === 0 ? this.props.noDataHeaderMessage ? this.props.noDataHeaderMessage : "Loading..." : this.props.tableData.length}
                </span>
                <span
                    style={{
                        display: "flex"
                    }}
                >
                    {
                        Object.keys(this.state.mergedCustomActionButtons).map((buttonLabel, buttonKey) => (
                            <span
                                key={buttonKey}
                                style={{ marginLeft: 10 }}
                            >
                                {this.state.mergedCustomActionButtons[buttonLabel]}
                            </span>
                        ))
                    }
                </span>
            </TableHeader>
        ];
    }

    isRowSelected(tableRow) {
        if (!this.props.selectedTableRows || !this.props.onSelectedTableRowClicked) {
            return false;
        }

        for (let i = 0; i < this.props.selectedTableRows.length; i++) {
            if (this.props.selectedTableRows[i] === tableRow) {
                return true;
            }
        }

        return false;
    }

    scrollToFocusedRow() {
        if (this.focusedRowRef.current) {
            this.focusedRowRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }

    async setupDefaultFiltersAndSearches() {
        await Object.keys(this.props.tableColumns).map(async (columnSource) => {
            if (this.props.tableColumns[columnSource].isDefaultFilterOrSearch && this.props.tableColumns[columnSource].addToFilterOrSearchClick) {
                await this.props.tableColumns[columnSource].addToFilterOrSearchClick(columnSource, this.props.tableColumns[columnSource].columnLabel)
            }
        });
    }
}

ContainerTable.propTypes = {
    /** The label to display for the table name.  */
    label: PropTypes.string.isRequired,

    /**
     * An object used to provide the TableSortableColumn element the required properties it needs.  Each object in the array should provide the following and will be added in order from left to right as columns to the table.
     * {
     *     <columnSource as the property key>:
     *     {
     *         columnLabel: <the label to display for the column>,
     *         addToFilterOrSearchClick: <optional - if provided an event handler for how to handle the column being added to a filter>
     *     },
     *     etc...
     * }
     */
    tableColumns: PropTypes.any.isRequired,

    /**
     * An array of objects used to provide <td> elements with data to display.  Each object in the array should provide an array of objects equal in length to tableColumns.length.
     * [
     *     tableRow,
     *     tableRow,
     *     tableRow,
     *     etc...
     * ]
     */
    tableData: PropTypes.array.isRequired,

    /** Optional - If provided, this should be an object that contains react button classes for being used in the header.
     * {
     *     "Button Label":
     *     (
     *         <ReactButtonClassHere/>
     *     ),
     *     "Button Label2":
     *     (
     *         <ReactButtonClassHere/>
     *     )
     * }
     */
    customActionButtons: PropTypes.any,

    /** Optional - If provided, this will be displayed when tableData has no records.  If not provided it will state "Loading..."" */
    noDataHeaderMessage: PropTypes.string,

    /** Optional - If provided, set to true for enabling collapsible container, otherwise it will be a normal container. */
    enableCollapse: PropTypes.bool,

    /** Optional - If provided and collapsing is enabled, it will set the initial state of the container. */
    isCollapsed: PropTypes.bool,

    /**  Optional - A property for passing selected table rows. */
    selectedTableRows: PropTypes.array,

    /**  Optional - An event handler for handling when a table row is clicked. */
    onSelectedTableRowClicked: PropTypes.func,

    /** Optional - If provided as true, it will enable multi row selection support. */
    enableMultiRowSelect: PropTypes.bool,

    /** Optional - If provided, sets the focus of the table to the given index position. */
    focusedRowIndex: PropTypes.number,

    /** Optional - If provided, this function handles exporting table data to an Excel format. */
    exportToExcelFunction: PropTypes.func,

    /** Optional - If provided, this will contain an array of custom <TableHeader> elements for adding to the table. */
    tableHeaders: PropTypes.array,

    /** Optional - If provided, this will contain an array of custom <TableFooter> elements for adding to the table. */
    tableFooters: PropTypes.array,

    /** Optional - The count of rows for the entire data set (not what's in tableData).. */
    pagingCount: PropTypes.number,

    /** Optional - The limit value for paging. */
    pagingLimit: PropTypes.number,

    /** Optional - The limits value for paging. */
    pagingLimits: PropTypes.arrayOf(PropTypes.number),

    /** Optional - The onLimitChange event handler. */
    pagingOnLimitChange: PropTypes.func,

    /** Optional - The onOffsetChange event handler. */
    pagingOnOffsetChange: PropTypes.func
}
