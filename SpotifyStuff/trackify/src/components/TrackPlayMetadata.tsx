import * as React from "react";
import ITrackPlayMetadataProps from "./ITrackPlayMetadataProps";
import ITrackPlayMetadataState from "./ITrackPlayMetadataState";

export default class TrackPlayMetadata extends React.Component<ITrackPlayMetadataProps, ITrackPlayMetadataState> {
    constructor(props: ITrackPlayMetadataProps) {
        super(props);
    }

    public render() {
        return (
            <div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "200px auto"
                    }}
                >
                    <label>Total Play Count: </label>
                    <label>{this.props.trackPlaySum}</label>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "200px auto"
                    }}
                >
                    <label>Unique Play Count: </label>
                    <label>{this.props.uniqueTrackPlaySum}</label>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "200px auto"
                    }}
                >
                    <label>Artist w/ Most Plays: </label>
                    <label>{this.props.artistWithMostPlays}</label>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "200px auto"
                    }}
                >
                    <label>Longest Song: </label>
                    <label>{this.props.longestSong}</label>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "200px auto"
                    }}
                >
                    <label>Shortest Song: </label>
                    <label>{this.props.shortestSong}</label>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "200px auto"
                    }}
                >
                    <label>Avg Song Length: </label>
                    <label>{this.props.avgSongLength}</label>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "200px auto"
                    }}
                >
                    <label>Total Time Listening To Music: </label>
                    <label>{this.props.totalTimeListened}</label>
                </div>
            </div>
        );
    }
}
