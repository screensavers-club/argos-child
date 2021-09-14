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
      type: "E",
      slots: [null, null, null],
    },
  },

  states: {
    get_identity: {
      on: {
        IDENTITY: {
          target: "list_rooms",
          actions: assign({
            identity: (context, event) => {
              console.log(event);
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
                type: "E",
                slots: [event.sid, null, null],
              };
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
