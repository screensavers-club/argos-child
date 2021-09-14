import { createMachine, assign } from "xstate";

let argosChildMachine = createMachine({
  id: "ArgosChild",
  initial: "get_identity",

  context: {
    room: {},
    joining_room: null,
    error: {},
    identity: null,
    current_layout: {
      type: "D",
      slots: [
        { size: [50, 100], position: [0, 0], track: null },
        { size: [50, 50], position: [50, 0], track: null },
        { size: [50, 50], position: [50, 50], track: null },
      ],
    },
  },

  states: {
    get_identity: {
      on: {
        IDENTITY: {
          target: "list_rooms",
          actions: assign({
            identity: (context, event) => {
              return event.identity;
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

    stage: {
      on: {
        INIT_LAYOUT_WITH_SELF: {
          actions: assign({
            current_layout: (context, event) => {
              return {
                type: "D",
                slots: [
                  { size: [50, 100], position: [0, 0], track: event.sid },
                  { size: [50, 50], position: [50, 0], track: null },
                  { size: [50, 50], position: [50, 50], track: null },
                ],
              };
            },
          }),
        },
        UPDATE_LAYOUT: {
          actions: assign({
            current_layout: (context, event) => {
              console.log("updateLayout", event.layout);
              return event.layout;
            },
          }),
        },
        DISCONNECT: { target: "list_rooms", room: "Not Connected" },
      },
    },
  },

  on: {
    BACK: { target: "list_rooms", room: "Not Connected" },
  },
});

export default argosChildMachine;
