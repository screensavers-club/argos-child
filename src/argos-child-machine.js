import { createMachine, assign, send } from "xstate";
import axios from "axios";
import { result } from "lodash";

function newPromise() {
  return new Promise(function (resolve, reject) {
    if (Math.random() > 0.5) {
      window.setTimeout(() => {
        resolve("success");
      }, 1000);
    } else {
      window.setTimeout(() => {
        reject("failure");
      }, 1000);
    }
  });
}

let argosChildMachine = createMachine(
  {
    id: "ArgosChild",
    initial: "start",
    context: { room: {}, roomName: {}, children: [], error: {} },
    states: {
      start: {
        on: {
          JOIN_ROOM: { target: "select_room" },
        },
      },

      error: {
        context: {
          room: "error",
          id: "error",
          error: (context, event) => {
            return { ...context.error, message: event.data.message };
          },
        },
      },

      select_room: {
        context: {
          room: "select_room",
          id: "select_room",
        },

        invoke: {
          id: "fetch_room_name",
          src: (context, event) => {
            return axios.get(
              `${process.env.REACT_APP_PEER_SERVER}:${process.env.REACT_APP_PEER_SERVER_PORT}`
            );
          },

          onDone: {
            actions: assign({
              room: (context, event) => {
                console.log(event);
                return { name: event.data.data.roomName };
              },
            }),
          },
          onError: {
            actions: assign({
              error: (context, event) => {
                console.log(event.data.message);
                return { message: event.data.message };
              },
            }),
          },
        },

        on: {
          ROOM_SELECTED: {
            target: "enter_password",
          },
        },
      },

      enter_password: {
        context: {
          room: "enter_password",
          id: "enter_password",
        },
        on: {
          JOIN_ROOM: {
            target: "stream_room",
          },
        },
      },

      stream_room: {
        context: {
          room: "stream_room",
          id: "stream_room",
        },
      },
    },

    on: {
      actions: assign({
        room: (context, event) => {
          return { ...context.room, name: event.data.room };
        },
      }),
      RESET: { target: "start", room: "Not Connected" },
    },
  },
  {
    actions: {
      assign_room_name: (context, event) => {
        console.log(context, event);
        if (event.type === "SUCCESS") {
          context.room.name = event.name;
        }
      },
    },
  }
);

export default argosChildMachine;
