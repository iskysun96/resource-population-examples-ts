# Instructions to Run the Resource Availability Code Examples

## Prerequisites

1. [Install AlgoKit](https://github.com/algorandfoundation/algokit-cli/tree/main?tab=readme-ov-file#install).
2. Install [Docker](https://www.docker.com/products/docker-desktop/). It is used to run a local Algorand network for development.
3. Install [Node.JS / npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

**Make sure to install these 3 prerequisites before continuing!**

## STEP 0

1. Open the cloned repository with the code editor of your choosing.
2. Open workspace mode by clicking `open workspace` inside of `resource-population-examples-ts.code-workspace` file at the root level.
3. To setup your dev environment using AlgoKit, run the below command in the `resource-population-example-ts` terminal:

```bash
algokit project bootstrap all
```

4. Activate Python virtual environment by running:

```bash
poetry shell
```

venv will automatically be activated the next time you open the project.

> Please note, in addition to built-in support for [VSCode Workspaces](https://code.visualstudio.com/docs/editor/workspaces), the cli provides native support for monorepos called `algokit workspaces`. Refer to [documentation](https://github.com/algorandfoundation/algokit-cli/blob/main/docs/features/project/run.md#workspace-vs-standalone-projects) for detailed guidelines for recommended project structures and ability to leverage custom command orchestration via `algokit project run`.

5. Open Docker Desktop and launch Algorand localnet by running `algokit localnet start` in your terminal [For more info click me!](https://github.com/algorandfoundation/algokit-cli/blob/main/docs/features/localnet.md#creating--starting-the-localnet).

## STEP 1

Run `algokit project run build` in your terminal.

This will build out artifacts of the `Counter` app and the `ResourceAvailability` app in `smart_contracts/resource_availability/contract.py` file.

## STEP 2

Run `npm run setup` to run the `setup-script.ts` file.

This initial setup does the following:

- Create an account named "ALICE" in your localnet
- ALICE deploys the Counter app to your localnet
- ALICE creates an ASA named "HelloDeveloper"

You will use the values you get from console logs in the following steps.

## STEP 3

Replace the constants in line 5-7 with the values you get after building and running the setup script

To showcase manually providing resources to the reference arrays, the resources are hardcoded in to the contract. This is why we have to run the setup script first and get the constant values.

## STEP 4

Run `algokit project run build` again in your terminal to get the updated ABI of the `ResourceAvailability` app.

By running this command again, we are rebuilding the ABI of the `ResourceAvailability` contract with the latest constant values.

## STEP 5

Replace the constants in line 11-13 with the values you get after building and running the setup script.

## STEP 6

Run `algokit project deploy localnet` to run the `smart_contracts/resource_availability/deploy-config.ts` file.

The `deploy-config.ts` file is where we deploy and call all of the methods in the `ResourceAvailability` app to showcase how to populate foreign resources when sending app calls.
