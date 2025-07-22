import React from "react";
import ITrackPlayTableProps from "./ITrackPlayTableProps";
import ITrackPlayTableState from "./ITrackPlayTableState";
import ContainerTable from "../submodules/react-container-components/components/ContainerTable";

export default class TrackPlayTable extends React.Component<ITrackPlayTableProps, ITrackPlayTableState> {
    constructor(props: ITrackPlayTableProps) {
        super(props);
    }

    render() {
        return (
            <ContainerTable
                enableCollapse={true}
                label={"Track Play Table"}
                tableColumns={{
                    trackTitle: {
                        columnLabel: "Track Title"
                    },
                    artistName: {
                        columnLabel: "Artist Name"
                    },
                    trackLength: {
                        columnLabel: "Track Length"
                    },
                    playCount: {
                        columnLabel: "Play Count"
                    }
                }}
                tableData={this.props.trackPlayData}
            />
        );
    }
}