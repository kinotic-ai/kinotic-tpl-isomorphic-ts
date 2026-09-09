import { Kinotic } from '@kinotic-ai/core'
import { appZone } from '@kinotic-ai/management-api'
import config from '../../../../.config/kinotic.config'

// Kinotic records a span for every service invocation, on both the calling and the receiving
// side. Deployed, the runtime workload preloads the OpenTelemetry SDK into this process and
// exports them through its node, so nothing here needs to set telemetry up.

// The zone prefix must be set before any @Publish class is instantiated.
Kinotic.zonePrefix = appZone(config.organizationId, config.applicationId)

// Instantiate @Publish services here. Before or after connect() both work — registrations
// queue until the connection is up and re-subscribe on every reconnect.

// Resolves the server from KINOTIC_SERVER_HOST / KINOTIC_SERVER_PORT / KINOTIC_SERVER_USE_SSL and
// the credentials from KINOTIC_CLIENT_ID + KINOTIC_CLIENT_SECRET, or KINOTIC_TOKEN. Pass a
// ConnectOptions to override any of it.
await Kinotic.connect()
console.log(`main microservice running in zone ${Kinotic.zonePrefix}`)
