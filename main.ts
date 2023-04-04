import { NodeSDK } from "@opentelemetry/sdk-node";
import * as otel from "@opentelemetry/api";

const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-base");

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
});

sdk.start();

main();

sdk.shutdown();

function main() {
  const tracer = otel.trace.getTracer("inside-node-program");

  const s = tracer.startSpan("bananas");

  console.log("span in trace " + s.spanContext().traceId);

  s.end();
}
