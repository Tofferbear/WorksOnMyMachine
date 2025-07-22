import "./TableBody.css";
import React from 'react';
import PropTypes from 'prop-types';

export default class TableBody extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div
                style={{
                    height: this.props.height ? this.props.height : 400
                }}
            >
                {this.props.children}
            </div>
        )
    }
}

TableBody.propTypes = {
    /** Optional - If provided, child elements will be added to the button and handled by default rendering. */
    children: PropTypes.node,

    /** Optional - If provided, this will override the default value of 400. */
    height: PropTypes.any
}
