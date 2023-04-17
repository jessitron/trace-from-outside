import { NodeSDK } from "@opentelemetry/sdk-node";
import * as otel from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { Metadata } from "@grpc/grpc-js";

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
  var newContext = otel.context.active();
  const traceparent = process.env["TRACEPARENT"]; // 00-fb80103a8b2c50e61f4abf8d3dc0ada6-f645d8ef0efe1de1-01
  console.log("Traceparent: " + traceparent);
  if (traceparent) {
    const [_1, traceId, spanId, _4] = traceparent?.split("-");
    console.log("ENV Trace = " + traceId);
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

    newContext = otel.trace.setSpanContext(
      otel.context.active(),
      externalSpanContext
    );
  }

  const tracer = otel.trace.getTracer("jaswanthm-restful-booker-platform");

  otel.context.with(newContext, () => {
    const s = tracer.startSpan("bananas", { kind: otel.SpanKind.SERVER });

    console.log("span in trace " + s.spanContext().traceId);

    s.end();
  });
}
