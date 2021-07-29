import { createMachine, assign } from "xstate";
import axios from "axios";

let argosChildMachine = createMachine({
  id: "ArgosChild",
  initial: "get_identity",

  context: { room: {}, joining_room: null, error: {}, identity: null },

  states: {
    get_identity: {
      invoke: {
        id: "generate_new_identity",
        src: (context, event) => {
          return axios.post(`${process.env.REACT_APP_PEER_SERVER}/session/new`);
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
        JOIN_ROOM_WITH_TOKEN: {
          target: "stage",
          actions: assign({
            room: (context, event) => {
              return event.room;
            },
            token: (context, event) => {
              return event.token;
            },
          }),
        },
      },
    },

    stage: {},
  },

  on: {
    RESET: { target: "list_rooms", room: "Not Connected" },
  },
});

export default argosChildMachine;
