import * as algokit from '@algorandfoundation/algokit-utils'
import { ResourceAvailabilityClient } from '../artifacts/resource_availability/ResourceAvailabilityClient'
import { CounterClient } from '../artifacts/resource_availability/CounterClient'

// STEP 2: Run the setup script by running `npm run setup` in the terminal

export async function setup() {
  console.log('\n=== Setup Script ===')
  // Set up Algorand Client
  const algorand = algokit.AlgorandClient.fromEnvironment()

  // Set up ALICE's account
  const alice = await algorand.account.fromEnvironment('ALICE')
  console.log('Alice addr: ', alice.addr)

  // Set up Counter App Client
  const AliceCounterClient = algorand.client.getTypedAppClientByCreatorAndName(CounterClient, {
    sender: alice,
    creatorAddress: alice.addr,
  })

  const counterApp = await AliceCounterClient.deploy({
    onSchemaBreak: 'append',
    onUpdate: 'append',
    sendParams: { suppressLog: true },
  })

  const counterAppId = counterApp.appId
  console.log('Counter App ID: ', counterAppId)
  console.log('Counter App Address: ', counterApp.appAddress)

  // If app was just created fund the app account
  if (['create', 'replace'].includes(counterApp.operationPerformed)) {
    await algorand.send.payment(
      {
        amount: algokit.algos(1),
        sender: alice.addr,
        receiver: counterApp.appAddress,
      },
      { suppressLog: true },
    )
  }

  // Create the HelloDeveloper asset if it doesn't exist
  const createResponse = await algorand.send.assetCreate(
    {
      sender: alice.addr,
      assetName: 'HelloDeveloper',
      unitName: 'HD',
      total: 1000n,
      decimals: 0,
    },
    { suppressLog: true },
  )

  const assetId = BigInt(createResponse.confirmation.assetIndex!)
  console.log('HelloDeveloper Asset ID', assetId)
}

setup()
