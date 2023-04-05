# n-radio-downloader (WIP)

Save NHK Radio shows locally.

This project consists of a simple, lightweight Node.js library and an Electron app that provides portability and a GUI.

Please note that this project is unofficial, so I cannot guarantee its functionality.

# Features

- The app is designed specifically to download radio streams, not to function as a radio player.
- Browse and list radio shows.
- Follow your favorite radio shows.
- Automatic detection of new episodes.
- Automatic download of radio episodes.

## Other features

- Can also be used as a standalone library.
- Selectable download directory

# instruction

## installation

requires Node.js

```bash
npm install
```

## build library

```bash
npm run build -w downloader
```

## development

```bash
npm run start -w app
```

## Build the Electron app

```bash
npm run make:win -w app
npm run make:mac -w app
```


