import React from "react";
import "./App.css";
import TrackifyContent from "./components/TrackifyContent";

export default class App extends React.Component {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className="App">
        <TrackifyContent />
      </div>
    );
  }
}
