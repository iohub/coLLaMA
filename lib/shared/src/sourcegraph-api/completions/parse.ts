import { isError } from '../../utils'

import { Event } from './types'

const EVENT_LINE_PREFIX = 'event: '
const DATA_LINE_PREFIX = 'data: '
const EVENTS_SEPARATOR = '\n\n'
export const LLAMA_ERROR_PREFIX = 'error: '

function parseEventType(eventLine: string): Event['type'] | Error {
    if (!eventLine.startsWith(EVENT_LINE_PREFIX)) {
        return new Error(`cannot parse event type: ${eventLine}`)
    }
    const eventType = eventLine.slice(EVENT_LINE_PREFIX.length)
    switch (eventType) {
        case 'completion':
        case 'error':
        case 'done':
            return eventType
        default:
            return new Error(`unexpected event type: ${eventType}`)
    }
}

function parseJSON<T>(data: string): T | Error {
    try {
        return JSON.parse(data) as T
    } catch {
        return new Error(`invalid JSON: ${data}`)
    }
}

function parseEventData(eventType: Event['type'], dataLine: string): Event | Error {
    if (!dataLine.startsWith(DATA_LINE_PREFIX)) {
        return new Error(`cannot parse event data: ${dataLine}`)
    }

    const jsonData = dataLine.slice(DATA_LINE_PREFIX.length)
    switch (eventType) {
        case 'completion': {
            const data = parseJSON<{ completion: string; stopReason: string }>(jsonData)
            if (isError(data)) {
                return data
            }
            if (typeof data.completion === undefined) {
                return new Error('invalid completion event')
            }
            return { type: eventType, completion: data.completion, stopReason: data.stopReason }
        }
        case 'error': {
            const data = parseJSON<{ error: string }>(jsonData)
            if (isError(data)) {
                return data
            }
            if (typeof data.error === undefined) {
                return new Error('invalid error event')
            }
            return { type: eventType, error: data.error }
        }
        case 'done':
            return { type: eventType }
    }
}

function parseEvent(eventBuffer: string): Event | Error {
    const [eventLine, dataLine] = eventBuffer.split('\n')
    const eventType = parseEventType(eventLine)
    if (isError(eventType)) {
        return eventType
    }
    return parseEventData(eventType, dataLine)
}

interface EventsParseResult {
    events: Event[]
    remainingBuffer: string
}

export function parseEvents(eventsBuffer: string): EventsParseResult | Error {
    let eventStartIndex = 0
    let eventEndIndex = eventsBuffer.indexOf(EVENTS_SEPARATOR)

    const events: Event[] = []
    while (eventEndIndex >= 0) {
        const event = parseEvent(eventsBuffer.slice(eventStartIndex, eventEndIndex))
        if (isError(event)) {
            return event
        }
        events.push(event)

        eventStartIndex = eventEndIndex + EVENTS_SEPARATOR.length
        eventEndIndex = eventsBuffer.indexOf(EVENTS_SEPARATOR, eventStartIndex)
    }

    return { events, remainingBuffer: eventsBuffer.slice(eventStartIndex) }
}

export interface JsonParseResult {
    json: string
    remainingBuffer: string
}

export function parseJsonData(dataLine: string): JsonParseResult | Error {
    const regex = /data: /gi
    let result, indices = []
    let cnt = 0
    while ( (result = regex.exec(dataLine)) && cnt < 2) {
        indices.push(result.index)
        cnt += 1
    }
    if (indices.length < 2) {
        return new Error(`cannot parseJsonData: ${dataLine}`)
    }
    let endindex = indices[1]-1
    for ( ; endindex > indices[0]; endindex--) {
        if (dataLine.at(endindex) == '}') break
    }
    return {
        json: dataLine.substring(indices[0]+DATA_LINE_PREFIX.length, endindex+1), 
        remainingBuffer: dataLine.substring(indices[1])
    }
}

export function parseSSE(jsonData: string): Event | Error {
    const data = parseJSON<{ content: string; stop: boolean }>(jsonData)
    if (isError(data)) {
        return data
    }
    if (data['stop']) {
        return { type: 'done' } 
    }
    return { type: 'completion', completion: data['content'], stopReason: '' }   
}