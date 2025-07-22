import React from "react";
import PropTypes from "prop-types";
 
export default class PagingControl extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            count: 0,
            limit: 2000,
            limits: [ 2000 ],
            offset: 0
        };
    }

    componentDidMount() {
        const stateUpdate = {
            count: this.state.count,
            limit: this.state.limit,
            limits: this.state.limits,
            offset: this.state.offset
        }

        if (this.props.count) {
            stateUpdate.count = this.props.count;
        }

        if (this.props.limit) {
            stateUpdate.limit = this.props.limit;
        }

        if (this.props.limits) {
            stateUpdate.limits = this.props.limits;
        }

        if (this.props.offset) {
            stateUpdate.offset = this.props.offset;
        }

        this.setState({
            count: stateUpdate.count,
            limit: stateUpdate.limit,
            limits: stateUpdate.limits,
            offset: stateUpdate.offset
        });
    }

    render() {
        const status = `${this.state.offset}-${Math.min(this.state.offset + this.state.limit, this.state.count)} of ${this.state.count}`;        

        return (
            <span>
                {
                    this.props.onLimitChange &&
                    (
                        <select
                            defaultValue={this.state.limit}
                            onChange={this.onLimitChange}
                        >
                            {
                                this.props.limits.map((limit, key) => {
                                    return <option key={key} value={limit}>{limit}</option>
                                })
                            }
                        </select>
                    )
                }
                <label
                    style={{ marginLeft: 10 }}
                >
                    {status}
                </label>
                <label
                    style={{
                        cursor: "pointer",
                        marginLeft: 10,
                        textDecoration: "underline"
                    }}
                    onClick={this.onPreviousClick}
                >
                    Prev
                </label>
                <label
                    style={{
                        cursor: "pointer",
                        marginLeft: 10,
                        textDecoration: "underline"
                    }}
                    onClick={this.onNextClick}
                >
                    Next
                </label>
            </span>
        );
    }

    onLimitChange = (event) => {
        if (this.props.onLimitChange) {
            const value = Number(event.target.value);
            this.props.onLimitChange(value);    
        }
    }

    onNextClick = () => {
        const nextOffset = this.state.offset + this.state.limit;

        if (nextOffset < this.state.count) {
            this.props.onOffsetChange(nextOffset);
        }
    }

    onPreviousClick = () => {
        const previousOffset = this.state.offset - this.state.limit;

        if (previousOffset >= 0) {
            this.props.onOffsetChange(previousOffset);
        }
    }
}

PagingControl.propTypes = {
    /** The count of records in this page. */
    count: PropTypes.number.isRequired,

    /** The amount of records to offset before returning them for pages. */
    offset: PropTypes.number.isRequired,

    /** The function that will get executed when an offset value is changed. */
    onOffsetChange: PropTypes.func.isRequired,

    /** Optional - The count of records to include per page. */
    limit: PropTypes.number,

    /** Optional - An array of valid limit values to make available. */
    limits: PropTypes.arrayOf(PropTypes.number),

    /** Optional - The function that is fired when a limit change orrurs. */
    onLimitChange: PropTypes.func,
};
