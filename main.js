"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_node_1 = require("@opentelemetry/sdk-node");
const otel = __importStar(require("@opentelemetry/api"));
const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-base");
const sdk = new sdk_node_1.NodeSDK({
    traceExporter: new ConsoleSpanExporter(),
});
sdk.start();
main();
sdk.shutdown();
function main() {
    const externalSpanContext = {
        traceId: "39aec76ccd07ff96c2335c6d2b7c0048",
        spanId: "b01dfd393fb17ee9",
        isRemote: true,
        traceFlags: 1, // this says that it is sampled: we do want to emit this trace
    };
    console.log("Is it a valid span context? " +
        otel.trace.isSpanContextValid(externalSpanContext));
    const newContext = otel.trace.setSpanContext(otel.context.active(), externalSpanContext);
    const tracer = otel.trace.getTracer("inside-node-program");
    const realSpan = tracer.startSpan("ppo", {}, newContext);
    const newContext2 = otel.trace.setSpanContext(otel.context.active(), realSpan.spanContext());
    realSpan.end();
    otel.context.with(newContext2, () => {
        console.log("active context: " + JSON.stringify(otel.context.active()));
        const s = tracer.startSpan("bananas", {});
        console.log("span in trace " + s.spanContext().traceId);
        s.end();
    });
}
