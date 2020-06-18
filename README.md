# Nextcloud Notes Client
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT) ![GitHub package.json version](https://img.shields.io/github/package-json/v/dgmid/nextcloud-notes-mac-client) [![GitHub release (latest by date)](https://img.shields.io/github/v/release/dgmid/nextcloud-notes-mac-client?label=latest%20release&logo=github)](https://github.com/dgmid/nextcloud-notes-mac-client/releases/latest) ![GitHub All Releases](https://img.shields.io/github/downloads/dgmid/nextcloud-notes-mac-client/total)

A replacement for the Mac Notes app that syncs with a Nextcloud server running the Nextcloud Notes app

![Nextcloud Notes Client in edit mode](https://user-images.githubusercontent.com/1267580/78501862-14557f00-775e-11ea-8c6a-8d5cf2ab9a83.png)
<small>*Nextcloud Notes Client in edit mode (dark theme)*</small>

![Nextcloud Notes Client in edit mode](https://user-images.githubusercontent.com/1267580/78501864-1a4b6000-775e-11ea-8d7f-808181def3da.png)
<small>*Nextcloud Notes Client in edit mode (light theme)*</small>

![Nextcloud Notes Client in preview mode](https://user-images.githubusercontent.com/1267580/78501977-ea508c80-775e-11ea-881e-c22e4c7f2c53.png)
<small>*Nextcloud Notes Client in preview mode (dark theme)*</small>

![Nextcloud Notes Client in preview mode](https://user-images.githubusercontent.com/1267580/78501983-f0df0400-775e-11ea-9e56-1fa0b6ccbe34.png)
<small>*Nextcloud Notes Client in preview mode (light theme)*</small>

## Requirements

[node.js / npm](https://www.npmjs.com/get-npm)

To build this project you will need to install ***gulp***, **electron packager** and **asar**

```shell
npm install -g electron-packager
npm install -g asar
npm install -g gulp
```

## Usage

`cd` to the project directory and run:
```shell
npm install
```

To modify the `html` / `css` / `js` run:
```shell
gulp watch
```

To test the app run:
```shell
npm start
```

To package the final app run:
```shell
npm run package
```
The packaged app will be written to `build/Nextcloud Notes Client-linux-x64/` in the project directory.

To install the final app:
```
sudo cp -r build/Nextcloud\ Notes\ Client-linux-x64/* /opt/nextcloud-notes-client/ &&\
sudo cp etc/icon.png /opt/nextcloud-notes-client/ &&\
sudo cp etc/nextcloud\ notes\ client.desktop /usr/share/applications/
```


## i18n
Translations for this app are by:

| language | translator |
| --- | --- |
| EN | [dgmid](https://github.com/dgmid) |
| IT | [dgmid](https://github.com/dgmid) |
| DE | [stratmaster](https://github.com/stratmaster) |
| ES | Juan Velasco |
| FR | Alain Grau |
