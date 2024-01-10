<div align=center>

# <img src="https://storage.googleapis.com/sourcegraph-assets/cody/20230417/logomark-default.svg" width="26"> Cody with LLaMA

"an AI pair programmer based on self-hosted llama.cpp endpoint."

</div>

## Get started

- Install coLLaMa from VSCode marketplace.
- Set your llama.cpp server's address like http://192.168.1.100 in the Cody>llama Server Endpoint configure.
- now enjoy coding with your localized deploy models.
- or Build and run the VS Code extension locally: `pnpm install && cd vscode && pnpm run dev`

## What is Cody?

Cody is a free, open-source AI coding assistant that can write and fix code, provide AI-generated autocomplete, and answer your coding questions. Cody fetches relevant code context from across your entire codebase to write better code that uses more of your codebase's APIs, impls, and idioms, with less hallucination.


## What can Cody do?

- **Chat:** Ask Cody questions about your entire codebase. Cody will use semantic search to retrieve files from your codebase and use context from those files to answer your questions.
- **Autocomplete:** Cody makes single-line and multi-line suggestions as you type, speeding up your coding and shortcutting the need for you to hunt down function and variable names as you type.
- **Inline Chat:** Ask Cody to fix or refactor code from anywhere in a file.
- **Commands:** Cody has quick commands for common actions. Simply highlight a code snippet and run a command, like “Document code,” “Explain code,” or “Generate Unit Tests.”

## Demos

**Autocomplete**

> <img src="https://storage.googleapis.com/sourcegraph-assets/website/Product%20Animations/GIFS/cody-completions-may2023-optim-sm2.gif" width=400>

**Inline chat**

> <img src="https://storage.googleapis.com/sourcegraph-assets/website/Product%20Animations/GIFS/cody_inline_June23-sm.gif" width=400>

**Codebase-wide chat:**

> <img src="https://storage.googleapis.com/sourcegraph-assets/website/Product%20Animations/GIFS/cody-chat-may2023-optim.gif" width=400>

## Contributing

All code in this repository is open source (Apache 2).

Quickstart: `pnpm install && cd vscode && pnpm run dev` to run a local build of the Cody VS Code extension.

