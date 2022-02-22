import AppFrame from "./components/app-frame";
import StatusBar from "./components/status-bar";

// screen components
import GetIdentity from "./components/get-identity";
import ListRooms from "./pages/list-rooms";
import EnterPassword from "./pages/enter-password";
import EnterNickname from "./pages/enter-nickname";
import Stage from "./pages/stage";

import { useMachine } from "@xstate/react";
import { inspect } from "@xstate/inspect";
import argosChildMachine from "./argos-child-machine.js";

import _ from "lodash";

if (process.env.NODE_ENV === "development" && false) {
	inspect({
		iframe: false, // open in new window
	});
}

function App() {
	let [state, send] = useMachine(argosChildMachine, {
		devTools:
			process.env.NODE_ENV === "development" && typeof window !== "undefined",
	});

	return (
		<div className="App" id="App">
			<AppFrame>
				<StatusBar
					room={_.get(state, "context.room.name")}
					version="0.57.4"
					context={state.context}
				/>
				<Screen state={state.value} context={state.context} send={send} />
			</AppFrame>
		</div>
	);
}

export default App;

function Screen({ context, state, send }) {
	switch (state) {
		case "get_identity":
			return <GetIdentity send={send} context={context} />;

		case "list_rooms":
			return <ListRooms send={send} context={context} />;

		case "enter_password":
			return <EnterPassword send={send} context={context} />;

		case "enter_nickname":
			return <EnterNickname send={send} context={context} />;

		case "stage":
			return <Stage send={send} context={context} />;

		default:
			return <></>;
	}
}
