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
  const externalSpanContext: otel.SpanContext = {
    traceId: "39aec76ccd07ff96c2335c6d2b7c0048",
    spanId: "b01dfd393fb17ee9",
    isRemote: true,
    traceFlags: 1, // this says that it is sampled: we do want to emit this trace
  };
  console.log(
    "Is it a valid span context? " +
      otel.trace.isSpanContextValid(externalSpanContext)
  );

  const newContext = otel.trace.setSpanContext(
    otel.context.active(),
    externalSpanContext
  );
  const tracer = otel.trace.getTracer("inside-node-program");

  const realSpan = tracer.startSpan("ppo", {}, newContext);
  const newContext2 = otel.trace.setSpanContext(
    otel.context.active(),
    realSpan.spanContext()
  );
  realSpan.end();

  otel.context.with(newContext, () => {
    console.log("active context: " + JSON.stringify(otel.context.active()));

    const s = tracer.startSpan("bananas", {});

    console.log("span in trace " + s.spanContext().traceId);

    s.end();
  });
}
