import React from 'react';
import PropTypes from 'prop-types';
import ContainerButton from './ContainerButton';

// import {
//     ExcelExport as KendoExcelExport,
//     ExcelExportColumn as KendoExcelExportColumn,
// } from "@progress/kendo-react-excel-export";

export default class ExcelExporter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fields: []
        };

        this.exporter = React.createRef();
    }

    componentDidUpdate(prevProps) {
        const stateUpdate = {
            updateState: false,
            fields: this.state.fields
        };

        if (this.props.data !== prevProps.data) {
            if (this.props.data.length > 0) {
                const item = this.props.data[0];
                const fields = [];
                for (const key in item) {
                    if (Object.prototype.hasOwnProperty.call(item, key)) {
                        fields.push(key);
                    }
                }

                stateUpdate.fields = fields;
                stateUpdate.updateState = true;
            }
        }

        if (stateUpdate.updateState) {
            this.setState({
                fields: stateUpdate.fields
            });
        }
    }

    render() {
        return (
            <React.Fragment>
                <ContainerButton
                    disabled={this.props.disabled}
                    label="Excel Export"
                    onClick={this.excelExport}
                />
                {/* <KendoExcelExport data={this.props.data} ref={this.exporter} fileName={`${this.props.title ? `${this.props.title}_` : ''}${(new Date().toDateString())}.xlsx`}>

                    {

                        this.state.fields.map((name, key) => {

                            return (

                                <KendoExcelExportColumn field={name} title={name} key={key} />

                            )

                        })

                    }

                </KendoExcelExport> */}
            </React.Fragment>
        )
    }

    excelExport = () => {
        // if (this.exporter.current) {
        //     this.exporter.current.save();
        // }
    }
}

ExcelExporter.propTypes = {
    /** The object containing the data to export into Excel. */
    data: PropTypes.any.isRequired,

    /** The title of the Excel file being created. */
    title: PropTypes.string.isRequired,

    /** Optional - If provided, this will grey out the button and make it unclickable. */
    disabled: PropTypes.bool.isRequired
}
