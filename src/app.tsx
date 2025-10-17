import { hc } from "hono/client";

function App() {
  const client = hc("/");

  console.log(client);

  return (
    <>
      <h1>hi</h1>
    </>
  );
}

export default App;
