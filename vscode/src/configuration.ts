import * as vscode from 'vscode'

import type {
    Configuration,
    ConfigurationWithAccessToken,
} from '@sourcegraph/cody-shared/src/configuration'
import { DOTCOM_URL } from '@sourcegraph/cody-shared/src/sourcegraph-api/environments'

import { CONFIG_KEY, ConfigKeys } from './configuration-keys'
import { getAccessToken } from './services/SecretStorageProvider'

interface ConfigGetter {
    get<T>(section: (typeof CONFIG_KEY)[ConfigKeys], defaultValue?: T): T
}

/**
 * All configuration values, with some sanitization performed.
 */
export function getConfiguration(config: ConfigGetter = vscode.workspace.getConfiguration()): Configuration {
    const isTesting = process.env.CODY_TESTING === 'true'

    let debugRegex: RegExp | null = null
    try {
        const debugPattern: string | null = config.get<string | null>(CONFIG_KEY.debugFilter, null)
        if (debugPattern) {
            if (debugPattern === '*') {
                debugRegex = new RegExp('.*')
            } else {
                debugRegex = new RegExp(debugPattern)
            }
        }
    } catch (error: any) {
        void vscode.window.showErrorMessage("Error parsing cody.debug.filter regex - using default '*'", error)
        debugRegex = new RegExp('.*')
    }

    let autocompleteExperimentalGraphContext: 'lsp-light' | 'bfg' | null = config.get(
        CONFIG_KEY.autocompleteExperimentalGraphContext,
        null
    )
    // Handle the old `true` option
    if (autocompleteExperimentalGraphContext === true) {
        autocompleteExperimentalGraphContext = 'lsp-light'
    }

    let autocompleteAdvancedProvider: Configuration['autocompleteAdvancedProvider'] = 'fireworks'

    return {
        // NOTE: serverEndpoint is now stored in Local Storage instead but we will still keep supporting the one in confg
        // to use as fallback for users who do not have access to local storage
        serverEndpoint: sanitizeServerEndpoint(config.get(CONFIG_KEY.serverEndpoint, '')),
        proxy: config.get<string | null>(CONFIG_KEY.proxy, null),
        codebase: sanitizeCodebase(''),
        customHeaders: config.get<object>(CONFIG_KEY.customHeaders, {}) as Record<string, string>,
        useContext:  'none',
        debugEnable: config.get<boolean>(CONFIG_KEY.debugEnable, false),
        debugVerbose: config.get<boolean>(CONFIG_KEY.debugVerbose, false),
        debugFilter: debugRegex,
        telemetryLevel: 'off',
        autocomplete: config.get(CONFIG_KEY.autocompleteEnabled, true),
        autocompleteLanguages: config.get(CONFIG_KEY.autocompleteLanguages, {
            '*': true,
            scminput: false,
        }),
        experimentalChatPanel: config.get(CONFIG_KEY.experimentalChatPanel, isTesting),
        experimentalChatPredictions: config.get(CONFIG_KEY.experimentalChatPredictions, isTesting),
        experimentalSearchPanel: config.get(CONFIG_KEY.experimentalNewSearch, isTesting),
        experimentalSimpleChatContext: config.get(CONFIG_KEY.experimentalSimpleChatContext, isTesting),
        chatPreInstruction: config.get(CONFIG_KEY.chatPreInstruction),
        experimentalGuardrails: config.get(CONFIG_KEY.experimentalGuardrails, isTesting),
        experimentalNonStop: config.get(CONFIG_KEY.experimentalNonStop, isTesting),
        experimentalLocalSymbols: config.get(CONFIG_KEY.experimentalLocalSymbols, false),
        commandCodeLenses: config.get(CONFIG_KEY.commandCodeLenses, false),
        editorTitleCommandIcon: config.get(CONFIG_KEY.editorTitleCommandIcon, true),
        autocompleteAdvancedProvider,
        autocompleteAdvancedServerEndpoint: config.get<string | null>(
            'cody.llama.serverEndpoint',
            null
        ),
        autocompleteAdvancedModel: null,
        autocompleteAdvancedAccessToken: 'fake-token',
        autocompleteCompleteSuggestWidgetSelection: config.get(
            CONFIG_KEY.autocompleteCompleteSuggestWidgetSelection,
            true
        ),
        autocompleteExperimentalSyntacticPostProcessing: config.get(
            CONFIG_KEY.autocompleteExperimentalSyntacticPostProcessing,
            true
        ),
        autocompleteExperimentalGraphContext,
        autocompleteExperimentalDynamicMultilineCompletions: config.get(
            CONFIG_KEY.autocompleteExperimentalDynamicMultilineCompletions,
            false
        ),

        // NOTE: Inline Chat will be deprecated soon - Do not enable inline-chat when experimental.chatPanel is enabled
        inlineChat:
            config.get(CONFIG_KEY.inlineChatEnabled, false) !== config.get(CONFIG_KEY.experimentalChatPanel, isTesting),
        codeActions: config.get(CONFIG_KEY.codeActionsEnabled, true),

        /**
         * UNDOCUMENTED FLAGS
         */

        // Note: In spirit, we try to minimize agent-specific code paths in the VSC extension.
        // We currently use this flag for the agent to provide more helpful error messages
        // when something goes wrong, and to suppress event logging in the agent.
        // Rely on this flag sparingly.
        isRunningInsideAgent: config.get<boolean>('cody.advanced.agent.running' as any, false),
        agentIDE: config.get<'VSCode' | 'JetBrains' | 'Neovim' | 'Emacs'>('cody.advanced.agent.ide' as any),
        autocompleteTimeouts: {
            multiline: config.get<number | undefined>('cody.autocomplete.advanced.timeout.multiline' as any, undefined),
            singleline: config.get<number | undefined>(
                'cody.autocomplete.advanced.timeout.singleline' as any,
                undefined
            ),
        },
    }
}

function sanitizeCodebase(codebase: string | undefined): string {
    if (!codebase) {
        return ''
    }
    const protocolRegexp = /^(https?):\/\//
    const trailingSlashRegexp = /\/$/
    return codebase.replace(protocolRegexp, '').trim().replace(trailingSlashRegexp, '')
}

function sanitizeServerEndpoint(serverEndpoint: string): string {
    if (!serverEndpoint) {
        // TODO(philipp-spiess): Find out why the config is not loaded properly in the integration
        // tests.
        const isTesting = process.env.CODY_TESTING === 'true'
        if (isTesting) {
            return 'http://localhost:49300/'
        }

        return DOTCOM_URL.href
    }
    const trailingSlashRegexp = /\/$/
    return serverEndpoint.trim().replace(trailingSlashRegexp, '')
}

export const getFullConfig = async (): Promise<ConfigurationWithAccessToken> => {
    const config = getConfiguration()
    console.log('config:', config)
    // Migrate endpoints to local storage
    config.serverEndpoint = "http://127.0.0.1:8080" // localStorage?.getEndpoint() || config.serverEndpoint
    const accessToken = (await getAccessToken()) || null
    return { ...config, accessToken }
}
/*
    function checkValidEnumValues(configName: string, value: string | null): void {
        const validEnumValues = getConfigEnumValues('cody.' + configName)
        if (value) {
            if (!validEnumValues.includes(value)) {
                void vscode.window.showErrorMessage(
                    `Invalid value for ${configName}: ${value}. Valid values are: ${validEnumValues.join(', ')}`
                )
            }
        }
    }
*/