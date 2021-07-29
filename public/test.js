var peer = new Peer();
peer.on("open", function (id) {
  console.log("My peer ID is: " + id);

  var conn = peer.connect("another-peers-id");
  // on open will be launch when you successfully connect to PeerServer
  conn.on("open", function () {
    console.log("hey");
    // here you have conn.id
    conn.send("hi!");
  });

  console.log(conn);
});
