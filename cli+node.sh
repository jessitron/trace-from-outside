#!/bin/bash
# an otel-cli demo of span background
#
# This demo shows span background functionality with events added to the span
# while it's running in the background, then a child span is created and
# the background span is ended gracefully.

set -e
set -x

export OTEL_EXPORTER_OTLP_ENDPOINT=localhost:4317

carrier=$(mktemp)    # traceparent propagation via tempfile
sockdir=$(mktemp -d) # a unix socket will be created here

# start the span background server, set up trace propagation, and
# time out after 30 seconds (which shouldn't be reached)
otel-cli span background \
    --tp-carrier $carrier \
    --sockdir $sockdir \
    --tp-print \
    --service "jaswanthm-restful-booker-platform" \
    --name "$0 script execution" \
    --timeout 30 &

data1=$(uuidgen)

# add an event to the span running in the background, with an attribute
# set to the uuid we just generated
otel-cli span event \
    --name "did a thing" \
    --sockdir $sockdir \
    --attrs "data1=$data1"

# waste some time
sleep 1

# add an event that says we wasted some time
otel-cli span event --name "slept 1 second" --sockdir $sockdir

traceId=$(echo $(cut -d ":" -f2- <<< $(sed '1q;d' $carrier)))
nospaces=${traceId## } # remove leading spaces
nospaces=${traceId%% } # remove trailing spaces
echo $traceId
export TRACE_ID=$traceId

spanId=$(echo $(cut -d ":" -f2- <<< $(sed '2q;d' $carrier)))
nospaces=${spanId## } # remove leading spaces
nospaces=${spanId%% } # remove trailing spaces
echo $spanId
export SPAN_ID=$spanId

npm install
npm run start

# finally, tell the background server we're all done and it can exit
otel-cli span end --sockdir $sockdir
