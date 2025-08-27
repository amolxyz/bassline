# Bassline

Bassline is a music live coding environment for the browser that brings the TidalCycles pattern language to JavaScript and uses AI to co-compose with you.

- Live REPL: <https://bassline.day>
- Docs: <https://strudel.cc/learn>
- Source: <https://github.com/strudel-cc/strudel>

## What is Bassline?

Bassline lets you write and perform algorithmic patterns for drums, melodies, harmonies and more directly in your browser. It ports core ideas from TidalCycles to a modern JavaScript runtime, with first‑class support for Web Audio, MIDI and OSC, and an extensible package architecture.

Highlights:
- Live‑coding REPL in the browser (and optional desktop build)
- Tidal‑style pattern language in JavaScript
- WebAudio engine with effects; MIDI/OSC output; sample and synth support
- Installable PWA, theming, and rich documentation

## Running Locally

After cloning the project, you can run the REPL locally:

1. Install [Node.js](https://nodejs.org/)
2. Install [pnpm](https://pnpm.io/installation)
3. Install dependencies:
   ```bash
   pnpm i
   ```
4. Start the development server:
   ```bash
   pnpm dev
   ```

## Using Bassline in Your Project

This project is organized into many [packages](./packages), which are also available on [npm](https://www.npmjs.com/search?q=%40strudel).

Read more about how to use these in your own project [here](https://strudel.cc/technical-manual/project-start).

Bassline is free/open source software under the GNU Affero General Public License v3. See the license for details. Adapted from [TidalCycles](https://tidalcycles.org/) and [Strudel](https://strudel.cc).

Licensing info for the default sound banks can be found in the [dough-samples](https://github.com/felixroos/dough-samples/blob/main/README.md) repository.

## Contributing

There are many ways to contribute! See the [contribution guide](./CONTRIBUTING.md).


---

Built with love on top of Strudel.
