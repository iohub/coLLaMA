import { UserLocalHistory } from '@sourcegraph/cody-shared/src/chat/transcript/messages'
import { FeatureFlag } from '@sourcegraph/cody-shared/src/experimentation/FeatureFlagProvider'

import { ACCOUNT_USAGE_URL } from '../chat/protocol'

export type CodyTreeItemType = 'command' | 'support' | 'search' | 'chat'

export interface CodySidebarTreeItem {
    title: string
    icon: string
    id?: string
    description?: string
    command: {
        command: string
        args?: string[] | { [key: string]: string }[]
    }
    isNestedItem?: string
    requireFeature?: FeatureFlag
    requireUpgradeAvailable?: boolean
}

/**
 * Gets the tree view items to display based on the provided type.
 */
export function getCodyTreeItems(type: CodyTreeItemType): CodySidebarTreeItem[] {
    switch (type) {
        case 'command':
            return commandsItems
        case 'support':
            return supportItems
        default:
            return []
    }
}

// functon to create chat tree items from user chat history
export function createCodyChatTreeItems(userHistory: UserLocalHistory): CodySidebarTreeItem[] {
    const chatTreeItems: CodySidebarTreeItem[] = []
    const chatHistoryEntries = [...Object.entries(userHistory.chat)]
    chatHistoryEntries.forEach(([id, entry]) => {
        const lastHumanMessage = entry?.interactions?.findLast(interaction => interaction?.humanMessage)
        if (lastHumanMessage?.humanMessage.displayText && lastHumanMessage?.humanMessage.text) {
            let title = lastHumanMessage.humanMessage.displayText.split('\n')[0]

            // Display command key only
            if (title.startsWith('/')) {
                title = title.split(' ')[0]
            }

            chatTreeItems.push({
                id,
                title,
                icon: 'comment-discussion',
                command: { command: 'cody.chat.panel.restore', args: [id, title] },
            })
        }
    })
    return chatTreeItems.reverse()
}

const supportItems: CodySidebarTreeItem[] = [
    {
        title: 'Usage',
        icon: 'pulse',
        command: { command: 'vscode.open', args: [ACCOUNT_USAGE_URL.href] },
        requireFeature: FeatureFlag.CodyPro,
    },
    {
        title: 'Settings',
        icon: 'settings-gear',
        command: { command: 'cody.status-bar.interacted' },
    },
    {
        title: 'Keyboard Shortcuts',
        icon: 'keyboard',
        command: { command: 'workbench.action.openGlobalKeybindings', args: ['@ext:sourcegraph.cody-ai'] },
    }
]

const commandsItems: CodySidebarTreeItem[] = [
    {
        title: 'Chat',
        icon: 'comment',
        description: 'Ask Cody a question',
        command: { command: 'cody.chat.panel.new' },
    },
    {
        title: 'Document',
        icon: 'book',
        description: 'Add code documentation',
        command: { command: 'cody.command.document-code' },
    },
    {
        title: 'Edit',
        icon: 'wand',
        command: { command: 'cody.command.edit-code' },
        description: 'Edit code with instructions',
    },
    {
        title: 'Explain',
        icon: 'file-binary',
        command: { command: 'cody.command.explain-code' },
        description: 'Explain code',
    },
    {
        title: 'Smell',
        icon: 'symbol-keyword',
        command: { command: 'cody.command.smell-code' },
        description: 'Identify code smells',
    },
    {
        title: 'Test',
        icon: 'package',
        command: { command: 'cody.command.generate-tests' },
        description: 'Generate unit tests',
    },
    {
        title: 'Custom',
        icon: 'tools',
        command: { command: 'cody.action.commands.custom.menu' },
        description: 'Custom commands',
    },
]
