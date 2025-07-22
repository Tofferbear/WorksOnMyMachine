import React from "react";
import IArtistPlayTableProps from "./IArtistPlayTableProps";
import IArtistPlayTableState from "./IArtistPlayTableState";
import ContainerTable from "../submodules/react-container-components/components/ContainerTable";

export default class ArtistPlayTable extends React.Component<IArtistPlayTableProps, IArtistPlayTableState> {
    constructor(props: IArtistPlayTableProps) {
        super(props);
    }

    render() {
        return (
            <ContainerTable
                enableCollapse={true}
                label={"Artist Play Table"}
                tableColumns={{
                    artistName: {
                        columnLabel: "Artist Name"
                    },
                    playCount: {
                        columnLabel: "Play Count"
                    }
                }}
                tableData={this.props.artistPlayData}
            />
        );
    }
}