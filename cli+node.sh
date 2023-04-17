#!/bin/bash
# an otel-cli demo of span background
#
# This demo shows span background functionality with events added to the span
# while it's running in the background, then a child span is created and
# the background span is ended gracefully.

set -e
set -x

export OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io:443
export OTEL_EXPORTER_OTLP_HEADERS="x-honeycomb-team=${HONEYCOMB_API_KEY}"

otel-cli exec --service outside-service --name "script $0" npm start

