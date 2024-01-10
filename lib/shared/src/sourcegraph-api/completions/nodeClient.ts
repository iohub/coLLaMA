import http from 'http'
import https from 'https'

import { isError } from '../../utils'
import { customUserAgent } from '../graphql/client'
import { toPartialUtf8String } from '../utils'
import * as vscode from 'vscode'
import { SourcegraphCompletionsClient } from './client'
import { parseSSE, parseJsonData } from './parse'
import { CompletionCallbacks, CompletionParameters, FormatPrompt } from './types'

export class SourcegraphNodeCompletionsClient extends SourcegraphCompletionsClient {
    public stream(params: CompletionParameters, cb: CompletionCallbacks): () => void {
        let config = vscode.workspace.getConfiguration()
        params = FormatPrompt(params, config.get<string>('cody.prompt.format', 'WizardCoder'))
        const log = this.logger?.startCompletion(params)

        const abortController = new AbortController()
        const abortSignal = abortController.signal

        const requestFn = this.completionsEndpoint.startsWith('https://') ? https.request : http.request

        const request = requestFn(
            this.completionsEndpoint,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.config.accessToken ? { Authorization: `token ${this.config.accessToken}` } : null),
                    ...(customUserAgent ? { 'User-Agent': customUserAgent } : null),
                    ...this.config.customHeaders,
                },
                // So we can send requests to the Sourcegraph local development instance, which has an incompatible cert.
                rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0' && !this.config.debugEnable,
            },
            (res: http.IncomingMessage) => {
                if (res.statusCode === undefined) {
                    throw new Error('no status code present')
                }
                // For failed requests, we just want to read the entire body and
                // ultimately return it to the error callback.
                if (res.statusCode >= 400) {
                    // Bytes which have not been decoded as UTF-8 text
                    let bufferBin = Buffer.of()
                    // Text which has not been decoded as a server-sent event (SSE)
                    let errorMessage = ''
                    res.on('data', chunk => {
                        if (!(chunk instanceof Buffer)) {
                            throw new TypeError('expected chunk to be a Buffer')
                        }
                        // Messages are expected to be UTF-8, but a chunk can terminate
                        // in the middle of a character
                        const { str, buf } = toPartialUtf8String(Buffer.concat([bufferBin, chunk]))
                        errorMessage += str
                        bufferBin = buf
                    })

                    res.on('error', e => {
                        log?.onError(e.message)
                        cb.onError(e.message, res.statusCode)
                    })
                    res.on('end', () => {
                        log?.onError(errorMessage)
                        cb.onError(errorMessage, res.statusCode)
                    })
                    return
                }

                // Bytes which have not been decoded as UTF-8 text
                let bufferBin = Buffer.of()
                // Text which has not been decoded as a server-sent event (SSE)
                let completionText = ''
                let bufferStr = ''

                res.on('data', chunk => {
                    if (!(chunk instanceof Buffer)) {
                        throw new TypeError('expected chunk to be a Buffer')
                    }
                    // text/event-stream messages are always UTF-8, but a chunk
                    // may terminate in the middle of a character
                    const { str, buf } = toPartialUtf8String(Buffer.concat([bufferBin, chunk]))
                    bufferBin = buf
                    bufferStr += str
                    const jsonData = parseJsonData(bufferStr)
                    if (isError(jsonData)) {
                        // console.error(jsonData)
                        return
                    }
                    const event = parseSSE(jsonData.json)
                    if (isError(event)) {
                        console.error(event)
                        return
                    }
                    bufferStr = jsonData.remainingBuffer
                    if (event.type == "completion") {
                        completionText += event.completion
                        event.completion = completionText
                    }
                    this.sendEvents([event], cb)
                })

                res.on('error', e => {
                    log?.onError(e.message)
                    cb.onError(e.message)
                })
                res.on('end', () => {
                    this.sendEvents([{type: 'done'}], cb)
                })
            }
        )

        request.on('error', e => {
            let message = e.message
            if (message.includes('ECONNREFUSED')) {
                message =
                    'Could not connect to Cody. Please ensure that Cody app is running or that you are connected to the Sourcegraph server.'
            }
            log?.onError(message)
            cb.onError(message)
        })
        // console.log('POST', params)
        request.write(JSON.stringify(params))
        request.end()

        abortSignal.addEventListener('abort', () => {
            request.destroy()
        })

        return () => request.destroy()
    }
}
