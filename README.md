<div align=center>

# <img src="https://storage.googleapis.com/sourcegraph-assets/cody/20230417/logomark-default.svg" width="26"> Cody with [LLaMA.cpp](https://github.com/ggerganov/llama.cpp)

"VSCode AI coding assistant powered by self-hosted llama.cpp endpoint."

</div>

## Get started

- Install coLLaMa from VSCode marketplace.
- Set your llama.cpp server's address like http://192.168.1.100 in the Cody>llama Server Endpoint configure.
- Now enjoy coding with your localized deploy models.

<img src="examples/chat_demo.gif" alt="chat with llama.cpp server"/>

## Quick start your model service
### Recommended deployment with [llamafile](https://github.com/Mozilla-Ocho/llamafile)
>
1. Download [wizardcoder-python-13b.llamafile](https://huggingface.co/jartine/wizardcoder-13b-python/resolve/main/wizardcoder-python-13b.llamafile?download=true) (7.9 GB).

2. Open your computer's terminal.

3. If you're using macOS, Linux, or BSD, you'll need to grant permission 
for your computer to execute this new file. (You only need to do this 
once.)

```sh
chmod +x wizardcoder-python-13b.llamafile
```

4. If you're on Windows, rename the file by adding ".exe" on the end.

5. Run the llamafile. e.g.:

```sh
# for *nix
./wizardcoder-python-13b.llamafile
# for windows
.\wizardcoder-python-13b.llamafile.exe
```

6. Your browser should open automatically and display a chat interface. 
(If it doesn't, just open your browser and point it at http://localhost:8080.)


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


## Contributing

All code in this repository is open source (Apache 2).

Quickstart: `pnpm install && cd vscode && pnpm run dev` to run a local build of the Cody VS Code extension.

