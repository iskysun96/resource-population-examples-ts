import * as algokit from '@algorandfoundation/algokit-utils'
import { ResourceAvailabilityClient } from '../artifacts/resource_availability/ResourceAvailabilityClient'
import { CounterClient } from '../artifacts/resource_availability/CounterClient'
import { decodeAddress } from 'algosdk'

// Below is a showcase of various deployment options you can use in TypeScript Client
export async function deploy() {
  console.log('\n=== Resource Availability Example Script ===')

  // STEP 5: Edit the following constants after building and running the setup script.
  const counterAppId = 1131
  const counterAppAddress = '6MS3BY2VHFBCIOSWAZ5OVX2VNBJUV3PROL56FLGTDEPU7NHUHJ6RLKC4Q4'
  const helloDevAssetId = 1164

  // Set up Algorand Client
  const algorand = algokit.AlgorandClient.fromEnvironment()

  // Set up accounts
  const deployer = await algorand.account.fromEnvironment('DEPLOYER')
  console.log('deployer addr: ', deployer.addr)

  const alice = await algorand.account.fromEnvironment('ALICE')
  console.log('Alice addr: ', alice.addr)

  // Set up App Clients
  const ResourceAppClient = algorand.client.getTypedAppClientByCreatorAndName(ResourceAvailabilityClient, {
    sender: deployer,
    creatorAddress: deployer.addr,
  })

  const AliceCounterClient = algorand.client.getTypedAppClientById(CounterClient, {
    sender: alice,
    id: counterAppId,
  })

  // Deploy the ResourceAvailability App
  const resourceApp = await ResourceAppClient.deploy({
    onSchemaBreak: 'append',
    onUpdate: 'append',
  })
  const resourceAppId = resourceApp.appId
  console.log('Resource App ID: ', resourceAppId)

  // === Account reference example ===
  console.log('\n=== Account Reference Example ===')
  // Method #1
  let response = await ResourceAppClient.getAccountBalance({}, { accounts: [alice.addr] })
  console.log('Method #1 Account Balance', response.return)

  // Method #2
  response = await ResourceAppClient.getAccountBalance({}, { sendParams: { populateAppCallResources: true } })
  console.log('Method #2 Account Balance', response.return)

  // Method #3
  response = await ResourceAppClient.getAccountBalanceWithArg({ acct: alice.addr })
  console.log('Method #3 Account Balance', response.return)

  // === Asset reference example ===
  console.log('\n=== Asset Reference Example ===')
  // Method #1
  response = await ResourceAppClient.getAssetTotalSupply({}, { assets: [helloDevAssetId] })
  console.log('Method #1 Asset Total Supply', response.return)

  // Method #2
  response = await ResourceAppClient.getAssetTotalSupply({}, { sendParams: { populateAppCallResources: true } })
  console.log('Method #2 Asset Total Supply', response.return)

  // Method #3
  response = await ResourceAppClient.getAssetTotalSupplyWithArg({ asa: helloDevAssetId })
  console.log('Method #3 Asset Total Supply', response.return)

  // === App reference example ===
  console.log('\n=== App Reference Example ===')
  // Method #1
  response = await ResourceAppClient.incrementViaInner(
    {},
    { apps: [counterAppId], sendParams: { fee: algokit.algos(0.002) } },
  )
  console.log('Method #1 Increment via inner', response.return)

  // Method #2
  response = await ResourceAppClient.incrementViaInner(
    {},
    { sendParams: { populateAppCallResources: true, fee: algokit.algos(0.002) } },
  )
  console.log('Method #2 Increment via inner', response.return)

  // Method #3
  response = await ResourceAppClient.incrementViaInnerWithArg(
    { app: counterAppId },
    { sendParams: { fee: algokit.algos(0.002) } },
  )
  console.log('Method #3 Increment via inner', response.return)

  // === Account + Asset example ===
  console.log('\n=== Account + Asset Example ===')
  // Method #1
  response = await ResourceAppClient.getAssetBalance({}, { assets: [helloDevAssetId], accounts: [alice.addr] })
  console.log('Method #1 Asset Balance', response.return)

  // Method #2
  response = await ResourceAppClient.getAssetBalance({}, { sendParams: { populateAppCallResources: true } })
  console.log('Method #2 Asset Balance', response.return)

  // Method #3
  response = await ResourceAppClient.getAssetBalanceWithArg({ acct: alice.addr, asset: helloDevAssetId })
  console.log('Method #3 Asset Balance', response.return)

  // === Account + Application example ===
  console.log('\n=== Account + Application Example ===')

  // Check if Alice has opted in to the Counter App and opt in if not
  const appAccountInfo = await algorand.account.getInformation(alice.addr)

  if (appAccountInfo.appsLocalState) {
    let optedIn = false
    for (let i = 0; i < appAccountInfo.appsLocalState.length; i++) {
      if (appAccountInfo.appsLocalState[i].id == counterAppId) {
        optedIn = true
        break
      }
    }
    console.log('Alice opted in to Counter App:', optedIn)
    if (!optedIn) {
      await AliceCounterClient.optIn.optIn({})
    }
  }

  // increment Alice's local state counter
  await AliceCounterClient.incrementMyCounter({})
  console.log("Incremented Alice's local state counter")

  // Method #1
  response = await ResourceAppClient.getMyCounter({}, { accounts: [alice.addr], apps: [counterAppId] })
  console.log('Method #1 My Counter', response.return)

  // Method #2
  response = await ResourceAppClient.getMyCounter({}, { sendParams: { populateAppCallResources: true } })
  console.log('Method #2 My Counter', response.return)

  // Method #3
  response = await ResourceAppClient.getMyCounterWithArg({ acct: alice.addr, app: counterAppId })
  console.log('Method #3 My Counter', response.return)

  // === Application + Box reference example ===
  console.log('\n=== Application + Box Example ===')

  const BoxKeyLength = 32
  const boxValueLength = 8
  const boxSize = BoxKeyLength + boxValueLength
  const boxMBR = 2_500 + boxSize * 400

  // Method #1
  const boxPrefix = 'box_counter' // box identifier prefix
  const encoder = new TextEncoder()
  const boxPrefixBytes = encoder.encode(boxPrefix) //UInt8Array of boxPrefix
  const publicKey = decodeAddress(alice.addr).publicKey

  const payMbr = await algorand.transactions.payment({
    amount: algokit.microAlgos(boxMBR),
    sender: alice.addr,
    receiver: counterAppAddress,
  })

  response = await AliceCounterClient.incrementBoxCounter(
    { payMbr: payMbr },
    { boxes: [new Uint8Array([...boxPrefixBytes, ...publicKey])] },
  )
  console.log('Method #1 Box Counter', response.return)

  const payMbr2 = await algorand.transactions.payment({
    amount: algokit.microAlgos(boxMBR),
    sender: alice.addr,
    receiver: counterAppAddress,
  })

  // Method #2
  response = await AliceCounterClient.incrementBoxCounter(
    { payMbr: payMbr2 },
    { sendParams: { populateAppCallResources: true } },
  )
  console.log('Method #2 Box Counter', response.return)
}
