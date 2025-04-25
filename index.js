#!/usr/bin/env node
import 'dotenv/config'

import { Toolkit } from 'actions-toolkit'
import { GistBox, MAX_LENGTH, MAX_LINES } from 'gist-box'

const capitalize = (str) => str.slice(0, 1).toUpperCase() + str.slice(1)
const truncate = (str) =>
    str.length <= MAX_LENGTH ? str : str.slice(0, MAX_LENGTH - 3) + '...'

const serializers = {
    IssueCommentEvent: (item) => {
        return `🗣 Commented on #${item.payload.issue.number} in ${item.repo.name}`
    },
    IssuesEvent: (item) => {
        return `❗️ ${capitalize(item.payload.action)} issue #${
            item.payload.issue.number
        } in ${item.repo.name}`
    },
    PullRequestEvent: (item) => {
        const emoji = item.payload.action === 'opened' ? '💪' : '❌'
        const line = item.payload.pull_request.merged
            ? '🎉 Merged'
            : `${emoji} ${capitalize(item.payload.action)}`
        return `${line} PR #${item.payload.pull_request.number} in ${
            item.repo.name
        }`
    },
}

Toolkit.run(
    async (tools) => {
        const { GIST_ID, GH_USERNAME, GH_PAT } = process.env

        // Get the user's public events
        tools.log.debug(`Getting activity for ${GH_USERNAME}`)
        const { data: events } =
            await tools.github.activity.listPublicEventsForUser({
                username: GH_USERNAME,
                per_page: 100,
            })
        tools.log.debug(
            `Activity for ${GH_USERNAME}, ${events.length} events found.`
        )

        const processedEvents = []
        const prIndex = new Map()

        for (const event of events) {
            // Ignore events that are not in the serializer
            if (!Object.hasOwn(serializers, event.type)) continue
            //  Exclude closed unmerged PRs
            if (event.type === 'PullRequestEvent') {
                const { action, pull_request } = event.payload
                if (action === 'closed' && !pull_request.merged) continue
            }
            // Consolidate duplicate PR events, retaining only the latest one
            if (event.type !== 'PullRequestEvent') {
                processedEvents.push(event)
            } else {
                const prNumber = event.payload.pull_request.number
                if (prIndex.has(prNumber)) {
                    processedEvents[prIndex.get(prNumber)] = event
                } else {
                    prIndex.set(prNumber, processedEvents.push(event) - 1)
                }
            }
        }

        const content = processedEvents
            // We only have five lines to work with
            .slice(0, MAX_LINES)
            // Call the serializer to construct a string
            .map((item) => serializers[item.type](item))
            // Truncate if necessary
            .map(truncate)
            // Join items to one string
            .join('\n')

        const box = new GistBox({ id: GIST_ID, token: GH_PAT })
        try {
            tools.log.debug(`Updating Gist ${GIST_ID}`)
            await box.update({ content })
            tools.exit.success('Gist updated!')
        } catch (err) {
            tools.log.debug('Error getting or update the Gist:')
            return tools.exit.failure(err)
        }
    },
    {
        event: ['schedule', 'push', 'workflow_dispatch'],
        secrets: ['GITHUB_TOKEN', 'GH_PAT', 'GH_USERNAME', 'GIST_ID'],
    }
)
