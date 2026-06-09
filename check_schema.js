import clickhouse from "@clickhouse/client";
const client = clickhouse.createClient({
  host: "http://localhost:8123",
  username: "default",
  password: "",
  database: "observability",
});
async function test() {
  const rs = await client.query({ query: "DESCRIBE TABLE spans_1m" });
  console.log(await rs.json());
}
test();
