import { useEffect } from "react";
import useLocalStorage from "react-use-localstorage";
import axios from "axios";

export default function GetIdentity({ send, context, state }) {
  const [_identity, _setIdentity] = useLocalStorage("identity");

  useEffect(() => {
    // if (_identity) {

    //   send("IDENTITY", { identity: _identity });
    //   return;
    // }

    return axios
      .post(`${process.env.REACT_APP_PEER_SERVER}/session/new`)
      .then((result) => {
        console.log(`setting identity ${result.data.identity}`);
        _setIdentity(result.data.identity);
        send("IDENTITY", { identity: result.data.identity });
      });
  }, []);
  return <div></div>;
}
