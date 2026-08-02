import { ConnectionInfo, Kinotic } from '@kinotic-ai/core'
import { appZone } from '@kinotic-ai/os-api'
import config from '../../../../.config/kinotic.config'

// The zone prefix must be set before any @Publish class is instantiated.
Kinotic.zonePrefix = appZone(config.organizationId, config.applicationId)

// Instantiate @Publish services here, before connecting.

const connectionInfo = new ConnectionInfo()
connectionInfo.host = 'localhost'
connectionInfo.port = 58503

await Kinotic.connect(connectionInfo)
console.log(`main microservice running in zone ${Kinotic.zonePrefix}`)
