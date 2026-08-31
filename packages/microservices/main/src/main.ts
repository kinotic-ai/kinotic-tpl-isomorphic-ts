import { Kinotic } from '@kinotic-ai/core'
import { appZone } from '@kinotic-ai/management-api'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_NAMESPACE } from '@opentelemetry/semantic-conventions'
import config from '../../../../.config/kinotic.config'

// Kinotic creates a span for every service invocation, on both the calling and the receiving side,
// and exports them once an SDK is registered. OTEL_EXPORTER_OTLP_ENDPOINT names the collector
// (http://localhost:4317 for the local docker-compose stack); with nothing set the SDK stays off,
// so the spans are dropped in process rather than retried against an endpoint that isn't there.
const telemetry = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
                  ? new NodeSDK({
                                    resource: resourceFromAttributes({
                                        [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME
                                                             ?? `${config.applicationId}-main`,
                                        // Groups every service of an organization: Mimir joins the two
                                        // into job="<namespace>/<name>", and Tempo and Loki keep them
                                        // as separate fields to filter on.
                                        [ATTR_SERVICE_NAMESPACE]: config.organizationId
                                    }),
                                    traceExporter: new OTLPTraceExporter()
                                })
                  : undefined
telemetry?.start()

// The zone prefix must be set before any @Publish class is instantiated.
Kinotic.zonePrefix = appZone(config.organizationId, config.applicationId)

// Instantiate @Publish services here. Before or after connect() both work — registrations
// queue until the connection is up and re-subscribe on every reconnect.

// Resolves the server from KINOTIC_SERVER_HOST / KINOTIC_SERVER_PORT / KINOTIC_SERVER_USE_SSL and
// the credentials from KINOTIC_CLIENT_ID + KINOTIC_CLIENT_SECRET, or KINOTIC_TOKEN. Pass a
// ConnectOptions to override any of it.
await Kinotic.connect()
console.log(`main microservice running in zone ${Kinotic.zonePrefix}`)

// Spans are batched, so the last ones are still buffered when the workload is asked to stop.
process.on('SIGTERM', () => {
    void Promise.resolve(telemetry?.shutdown()).finally(() => process.exit(0))
})
