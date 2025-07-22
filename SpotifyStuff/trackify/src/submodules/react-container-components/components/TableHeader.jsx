import "./TableHeader.css";
import React from 'react';
import PropTypes from 'prop-types';

export default class TableHeader extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <span
                className={(this.props.hasOwnProperty("showBorder") && !this.props.showBorder) ? "noborder" : "withborder"}
                style={{
                    alignItems: this.props.alignItems ? this.props.alignItems : "center",
                    gridTemplateColumns: this.props.gridTemplateColumns ? this.props.gridTemplateColumns : "auto auto",
                    justifyContent: this.props.justifyContent ? this.props.justifyContent : "space-between",
                }}
            >
                {this.props.children}
            </span>
        )
    }
}

TableHeader.propTypes = {
    /** Optional - If provided will override the default value of "center" */
    alignItems: PropTypes.string,

    /** Optional - If provided, child elements will be added to the button and handled by default rendering. */
    children: PropTypes.node,

    /** Optional - If provided this will override the default template of "auto auto" */
    gridTemplateColumns: PropTypes.string,

    /** Optional - If provided this will override the default value of "space-between" */
    justifyContent: PropTypes.string,

    /** Optional - If provided this will override the default value of true  */
    showBorder: PropTypes.bool
}
