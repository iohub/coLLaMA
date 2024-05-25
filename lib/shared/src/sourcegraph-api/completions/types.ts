export interface DoneEvent {
    type: 'done'
}

export interface CompletionEvent extends CompletionResponse {
    type: 'completion'
}

export interface ErrorEvent {
    type: 'error'
    error: string
}

export type Event = DoneEvent | CompletionEvent | ErrorEvent

export interface Message {
    speaker: 'human' | 'assistant'
    text?: string
}

export interface CompletionResponse {
    completion: string
    stopReason: string
}

export interface LLaMaCompletionResponse {
    content: string
}

export interface CompletionParameters {
    fast?: boolean
    messages: Message[]
    maxTokensToSample: number
    temperature?: number
    stopSequences?: string[]
    topK?: number
    topP?: number
    model?: string
    // LLaMa.cpp params
    prompt?: string
    stream?: boolean
    n_predict?: number
    top_k?: number
    top_p?: number
}

export interface CompletionCallbacks {
    onChange: (text: string) => void
    /**
     * Only called when a stream successfully completes. If an error is
     * encountered, this is never called.
     */
    onComplete: () => void
    /**
     * Only called when a stream fails or encounteres an error. This should be
     * assumed to be a "complete" event, and no other callbacks will be called
     * afterwards.
     */
    onError: (message: string, statusCode?: number) => void
}

export function FormatPrompt(params: CompletionParameters, promptType: string) : CompletionParameters {
    let prompt = ''
    switch (promptType) {
        case 'Guanaco':
            prompt += "A chat between a curious human and an artificial intelligence assistant.The assistant gives helpful, detailed, and polite answers to the user's questions.\n"
            params.messages.forEach(e => {
                const content = e.text ? e.text : ''
                if (e.speaker == "human") {
                    prompt +=  `\n### Human:\n${content}\n`
                }
                if (e.speaker == "assistant") {
                    prompt +=  `\n### Assistant:\n${content}\n`
                }
            })
            break
        case 'StarlingLM':
                params.messages.forEach(e => {
                    if (e.speaker == "human") {
                        prompt +=  e.text ? `GPT4 Correct User: ${e.text}<|end_of_turn|>` : "GPT4 Correct User: "
                    }
                    if (e.speaker == "assistant") {
                        prompt +=  e.text ? `GPT4 Correct Assistant: ${e.text}<|end_of_turn|>` : "GPT4 Correct Assistant:"
                    }
                })
                break
        case 'None':
            params.messages.forEach(e => {
                if (e.speaker == "human" && e.text) {
                    prompt +=  e.text
                }
                if (e.speaker == "assistant" && e.text) {
                    prompt +=  e.text
                }
            })
            break
        default: // WizardCoder format
            prompt += "Below is an instruction that describes a task. Write a response that appropriately completes the request.\n"
            params.messages.forEach(e => {
                const content = e.text ? e.text : ''
                if (e.speaker == "human") {
                    prompt +=  `\n### Instruction:\n${content}\n`
                }
                if (e.speaker == "assistant") {
                    prompt += `\n### Response:\n${content}\n`
                }
            })
    }
    params.prompt = prompt
    return params
}