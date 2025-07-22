/*
* This reusable component is for adding a sortable column header to a table column.  It must be used within a <table></table> element.
*/

import React from 'react';
import PropTypes from 'prop-types';

export default class TableSortableColumn extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showFilterButton: false,
            sortColumn: '',
            sortDirection: -1
        };
    }

    render() {
        return (
            <th>
                <div
                    onMouseEnter={() => this.onToggleShowFilterButton(true)}
                    onMouseLeave={() => this.onToggleShowFilterButton(false)}
                    style={{
                        display: 'grid',
                        gap: '1px',
                        gridTemplateColumns: 'auto auto auto'
                    }}
                >
                    <span
                        onClick={() => this.onAddToFilterClick()}
                        style={{
                            cursor: 'pointer',
                            visibility: (this.state.showFilterButton && this.props.onAddToFilterClick) ? 'visible' : 'hidden'
                        }}
                    >
                        +
                    </span>
                    <span
                        onClick={() => this.onSortColumnChangeClick(this.props.columnSource)}
                    >
                        {this.props.label}
                    </span>
                    <span
                        style={{
                            visibility: this.state.sortColumn === this.props.columnSource ? 'visible' : 'hidden'
                        }}
                    >
                        {this.state.sortColumn === this.props.columnSource ? this.state.sortDirection === -1 ? '▲' : '▼' : '■'}
                    </span>
                </div>
            </th>
        );
    }

    onAddToFilterClick = async () => {
        if (this.props.onAddToFilterClick) {
            await this.props.onAddToFilterClick(this.props.columnSource, this.props.label);
        }    
    };

    onSortColumnChangeClick = async (sortColumn) => {
        const sortDirection = this.state.sortColumn === sortColumn ? this.state.sortDirection * -1 : 1;

        this.setState({
            sortColumn: sortColumn,
            sortDirection: sortDirection
        });
    }

    onToggleShowFilterButton = (value) => {
        this.setState({
            showFilterButton: value
        })
    };
}

TableSortableColumn.propTypes = {
    /** The label to set for the column header. */
    label: PropTypes.string.isRequired,

    /** The name of the column that provides the source data for the rows. */
    columnSource: PropTypes.string.isRequired,

    /** Optional - If provided, will call into the passed in function and pass in the column source and label. */
    onAddToFilterClick: PropTypes.func
}
