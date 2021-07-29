import { createMachine, assign } from "xstate";
import axios from "axios";

let argosChildMachine = createMachine(
  {
    id: "ArgosChild",
    initial: "get_identity",

    context: { room: {}, joining_room: null, error: {}, identity: null },

    states: {
      get_identity: {
        invoke: {
          id: "generate_new_identity",
          src: (context, event) => {
            return axios.post(
              `${process.env.REACT_APP_PEER_SERVER}/session/new`
            );
          },
          onDone: {
            target: "list_rooms",
            actions: assign({
              identity: (context, event) => {
                return event.data.data.identity;
              },
            }),
          },
          onError: {
            target: "show_error",
            actions: assign({
              error: (context, event) => {
                return { message: "cannot connect to server" };
              },
            }),
          },
        },
      },

      list_rooms: {
        on: {
          REQUEST_JOIN_ROOM: {
            target: "enter_password",
            actions: assign({
              joining_room: (context, event) => {
                return event.name;
              },
            }),
          },
        },
      },

      show_error: {},

      enter_password: {
        on: {
          list_rooms: {
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
      RESET: { target: "list_rooms", room: "Not Connected" },
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
