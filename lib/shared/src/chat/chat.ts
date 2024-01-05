import { ANSWER_TOKENS } from '../prompt/constants'
import { Message } from '../sourcegraph-api'
import * as vscode from 'vscode'
import type { SourcegraphCompletionsClient } from '../sourcegraph-api/completions/client'
import type { CompletionCallbacks, CompletionParameters } from '../sourcegraph-api/completions/types'

type ChatParameters = Omit<CompletionParameters, 'messages'>

export class ChatClient {
    private maxTokens: number

    constructor(private completions: SourcegraphCompletionsClient) {
        let config = vscode.workspace.getConfiguration()
        this.maxTokens = config.get<number>('cody.chat.maxTokens', 100)
    }

    public chat(messages: Message[], cb: CompletionCallbacks, params?: Partial<ChatParameters>): () => void {
        const isLastMessageFromHuman = messages.length > 0 && messages.at(-1)!.speaker === 'human'
        const augmentedMessages = isLastMessageFromHuman ? messages.concat([{ speaker: 'assistant' }]) : messages
        const defaults: ChatParameters = {
            temperature: 0.6,
            maxTokensToSample: ANSWER_TOKENS,
            top_k: 20,
            top_p: 0.85,
            stream: true,
            n_predict: this.maxTokens
        }

        return this.completions.stream(
            {
                ...defaults,
                ...params,
                messages: augmentedMessages,
            },
            cb
        )
    }
}
