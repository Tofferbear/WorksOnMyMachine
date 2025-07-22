import React from 'react';
import PropTypes from "prop-types";

export default class CollapsibleContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isCollapsed: false
        };
    }

    componentDidMount() {
        const stateUpdate = {
            isCollapsed: this.state.isCollapsed
        };

        if (this.props.isCollapsed) {
            stateUpdate.isCollapsed = this.props.isCollapsed;
        }

        this.setState({
            isCollapsed: stateUpdate.isCollapsed
        });

    }

    componentDidUpdate(prevProps) {
        const stateUpdate = {
            updateState: false,
            isCollapsed: this.state.isCollapsed
        }

        if (this.props.isCollapsed !== prevProps.isCollapsed) {
            stateUpdate.isCollapsed = this.props.isCollapsed;
            stateUpdate.updateState = true;
        }

        if (stateUpdate.updateState) {
            this.setState({
                isCollapsed: stateUpdate.isCollapsed
            });
        }
    }

    render() {
        return (
            <div
                style={
                    this.props.style ?
                    this.props.style :
                    {
                        backgroundColor: "#1c1d1f",
                        borderRadius: 10,
                        margin: 10,
                        padding: 0,
                    }
                }
            >
                {
                    this.props.enableCollapse &&
                    <span
                        style={{
                            display: "grid",
                            gridTemplateColumns: "auto auto",
                            justifyContent: "space-between"
                        }}
                    >
                        <span
                            style={{
                                alignItems: "center",
                                borderBottom: this.props.showBorder ? this.props.showBorder ? "1px solid #323232" : "none" : "1px solid #323232",
                                display: "grid",
                                fontWeight: "bold",
                                gap: "10px",
                                gridTemplateColumns: "auto auto",
                                justifyContent: "start",
                                margin: "0",
                                padding: "10"
                            }}
                        >
                            <span
                                onClick={this.onShowClick}
                                style={{
                                    cursor: "pointer",
                                    fontWeight: 'bold'
                                }}
                            >
                                ≡
                            </span>
                            {
                                this.props.label &&
                                <span>{this.props.label}</span>
                            }
                        </span>
                        <span
                            sytle={{
                                display: "flex"
                            }}
                        >
                            {
                                this.props.customActionButton &&
                                Object.keys(this.props.customActionButton).map((buttonLabel, buttonKey) => (
                                    <span
                                        key={buttonKey}
                                        style={{ marginLeft: 10 }}
                                    >
                                        {this.props.customActionButton[buttonLabel]}
                                    </span>
                                ))
                            }
                        </span>
                    </span>
                }
                {
                    !this.state.isCollapsed &&
                    <span
                        style={{
                            alignItems: "center",
                            cursor: "pointer",
                            fontWeight: "bold",
                            justifyContent: "space-between",
                            margin: "0"
                        }}
                    >
                        {this.props.children}
                    </span>
                }
            </div>
        );
    }

    onShowClick = () => {
        this.setState({
            isCollapsed: !this.state.isCollapsed
        });
    }
}

CollapsibleContainer.propTypes = {
    /** Set to true for enabling collapsible container, otherwise it will be a normal container. */
    enableCollapse: PropTypes.bool.isRequired,

    /** Optional - html element containing children for inner html. */
    children: PropTypes.node,

    /** Optional - html button elements containing custom buttons for inner html. */
    customActionButton: PropTypes.node,

    /** Optional - If provided and collapsing is enabled, it will set the initial state of the container. */
    isCollapsed: PropTypes.bool,

    /** Optional - If provided will add a label for the container just after the collapsor button. */
    label: PropTypes.string,

    /** Optional - If provided as true, this will cause the component to render a bottom border. */
    showBorder: PropTypes.bool,

    /** Optional - If provided, this will override any default sytling set by the class. */
    style: PropTypes.any
}
