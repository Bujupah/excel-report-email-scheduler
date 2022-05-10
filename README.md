# mSupply Dashboard: Excel report e-mail scheduler

The Open mSupply Dashboard Excel report e-mail scheduler plugin takes data from panels of mSupply dashboard to generate excel reports.

The reports are then emailed to a custom user report group, this report group is curated from the list of mSupply users, pulled from mSupply Dashboard's datasource.

The timing of the scheduler can be set in the plugin.

The app plugin is built with Golang as backend and react as frontend.

## Installation instructions

### Development

If you want to develop and change this plugin's file, you can install the plugin in your system through one if the two routes explained below.

The Docker route need docker installed in your system along with Node.js, Golang and yarn but it gives you fresh grafana install. It will also auto-setup grafana for you (to some extent) so it is the recommended path.

- [Docker development installation (recommended)](./docs/developers-docker-recommented-build.md)
- [Normal development installation](./docs/normal-installation.md)

## Requirements

- Golang version 1.16 or above
  - [Mage build tool](https://magefile.org/)
- Node.JS version 16 or above
- Grafana version 8
- Yarn

## Build for Production

- Do everything instructed in the Development section above.
- Now it's time to build for Production
  - Do `mage clean` to delete the dist folder. A fresh start.
  - Do `mage -v` to build for all platforms
    - Do `mage build:windows` if you want to build for Windows only
    - Do `mage build:linuxARM64` if you want to build for Linux only
  - Do `yarn build:frontend` to build the Javascript parts
  - Do `yarn sign` to sign the plugin.
    - Note: You would need a GRAFANA_API_KEY to sing the plugin.
    - Once you have signed the plugin you cannot change the content of the plugin folder (dist). Any add, edit or deletion of files in the folder would render the plugin invalid and it would not work in Grafana.
    - If you want to use the signed plugin in development mode but you have not been abled to, there is manifest file that gets generated when the plugin is singed. That file must be deleted if you want to use the plugin unsigned for development.
- Alternatively, if you do `yarn build`, it will run all of the above commands for you. (I just wanted to explain what the do to you.)
