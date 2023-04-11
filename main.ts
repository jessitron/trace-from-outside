import { NodeSDK } from "@opentelemetry/sdk-node";
import * as otel from "@opentelemetry/api";
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-base");



const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  // serviceName: "jaswanthm-restful-booker-platform"
});

sdk.start();

main();

sdk.shutdown();

function main() {

  let traceId:string = process.env.TRACE_ID as string;
  console.log("ENV Trace = " + traceId)

  let spanId:string = process.env.SPAN_ID as string;
  console.log("ENV Span = " + spanId)

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
    const s = tracer.startSpan("bananas", {});

    console.log("span in trace " + s.spanContext().traceId);

    s.end();
  });
}
