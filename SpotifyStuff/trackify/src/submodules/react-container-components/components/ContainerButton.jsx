import './ContainerButton.css';
import React from 'react';
import PropTypes from 'prop-types';

export default class ContainerButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <span
                className={(this.props.hasOwnProperty('small') && this.props.small) ? 'bluebuttonsmall' : 'bluebutton'}
                disabled={this.props.hasOwnProperty('disabled') ? this.props.disabled : false}
                onClick={() => this.onClick()}
                style={this.props.style}
            >
                {this.props.hasOwnProperty('label') ? this.props.label : ''}
                {this.props.children}
            </span>
        );
    }

    onClick = () => {
        if (this.props.disabled) {
            return;
        }

        this.props.onClick();
    }
}

ContainerButton.propTypes = {
    /** The passed in function that will get executed when the button is clicked. */
    onClick: PropTypes.func,

    /** Optional - If provided, child elements will be added to the button and handled by default rendering. */
    children: PropTypes.node,

    /** Optional - If provided and set to true, the button will be rendered but be greyed out and unclickable. */
    disabled: PropTypes.bool,

    /** Optional - If provided will add a label for the button. */
    label: PropTypes.string,

    /** Optional - If provided and set too true, the button will be rendered smaller. */
    small: PropTypes.bool,

    /** Optional - If provided, will override the default styling set by CSS. */
    style: PropTypes.any
}
