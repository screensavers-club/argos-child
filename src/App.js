import { useEffect, useState } from "react";
import "./App.css";
import Peer from "peerjs";

function App() {
	let [conn, setConn] = useState({});
	useEffect(() => {
		let peer = new Peer({
			host: "192.168.1.33",
			port: "9000",
			debug: 2,
			path: "/peerjs/myapp",
		});

		peer.on("open", (id) => {
			console.log("my id is " + id);
			let _c = peer.connect("parent");
			setConn(_c);

			_c.on("open", () => {
				console.log("connection opened");
				_c.send("hi");
			});

			_c.on("data", (data) => {
				console.log("received ", data);
			});

			return function cleanup() {
				peer.disconnect();
			};
		});
	}, []);

	return <div className="App">{console.log(conn)}</div>;
}

export default App;
