<div align=center>

# Copilot with [LLaMA.cpp](https://github.com/ggerganov/llama.cpp)

"VSCode AI coding assistant powered by self-hosted llama.cpp endpoint."

</div>

## Get started

- Install Open Copilot from VSCode marketplace.
- Set your llama.cpp server's address like http://192.168.0.101:8080 in the Cody>llama Server Endpoint configure.
- Now enjoy coding with your localized deploy models.

<img src="examples/chat_demo.gif" alt="chat with llama.cpp server"/>

## Quick start your model service

### Windows
>
1. Download llama.cpp binary release [archive](https://github.com/ggerganov/llama.cpp/releases)

2. Unzip `cudart-llama-bin-xxx-x64.zip` to folder

3. Download GGUF model file, for example: [wizardcoder-python-13b-v1.0.Q4_K_M.gguf](https://huggingface.co/TheBloke/WizardCoder-Python-13B-V1.0-GGUF/resolve/main/wizardcoder-python-13b-v1.0.Q4_K_M.gguf?download=true)

4. Execute `server.exe` startup command.

```sh
# only use cpu
D:\path_to_unzip_files\server.exe -m D:\path_to_model\wizardcoder-python-13b-v1.0.Q4_K_M.gguf -t 8 -c 1024
# use gpu
D:\path_to_unzip_files\server.exe -m D:\path_to_model\wizardcoder-python-13b-v1.0.Q4_K_M.gguf -t 8 -ngl 81 -c 1024
```


### Linux or MacOS

`Please compile the llama.cpp project by yourself, and follow the same startup steps.`

## What is Cody?

Cody is a free, open-source AI coding assistant that can write and fix code, provide AI-generated autocomplete, and answer your coding questions.


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

