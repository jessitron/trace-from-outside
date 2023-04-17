import { NodeSDK } from "@opentelemetry/sdk-node";
import * as otel from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { Metadata } from "@grpc/grpc-js";
const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-base");

import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

console.log("What is the traceparent env var? " + process.env["TRACEPARENT"]);

const metadata = new Metadata();
metadata.set(
  "x-honeycomb-team",
  process.env["HONEYCOMB_API_KEY"] || "lack of api key"
);
const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: "https://api.honeycomb.io:443",
    metadata,
  }),
  serviceName: "jaswanthm-restful-booker-platform",
});

sdk.start();

main();

sdk.shutdown();

function main() {
  let traceId: string = process.env.TRACE_ID as string;
  console.log("ENV Trace = " + traceId);

  let spanId: string = process.env.SPAN_ID as string;
  console.log("ENV Span = " + spanId);

  const externalSpanContext: otel.SpanContext = {
    traceId: traceId,
    spanId: spanId,
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
  const tracer = otel.trace.getTracer("jaswanthm-restful-booker-platform");

  otel.context.with(newContext, () => {
    const s = tracer.startSpan("bananas", { kind: otel.SpanKind.SERVER });

    console.log("span in trace " + s.spanContext().traceId);

    s.end();
  });
}
