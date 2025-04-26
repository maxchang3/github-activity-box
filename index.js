#!/usr/bin/env node
import 'dotenv/config'
import { Octokit } from '@octokit/rest'
import { GistBox, MAX_LENGTH, MAX_LINES } from 'gist-box'

const { GIST_ID, GH_USERNAME, GH_PAT } = process.env

const octokit = new Octokit({
    auth: `token ${GH_PAT}`,
})

/**
 * @import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types'
 *
 * @typedef { typeof octokit.activity.listPublicEventsForUser } ListPublicEventsForUser
 * @typedef { GetResponseDataTypeFromEndpointMethod<ListPublicEventsForUser>[number] } PublicEvent
 */

const capitalize = (/** @type {string} */ str) =>
    str.slice(0, 1).toUpperCase() + str.slice(1)
const truncate = (/** @type {string} */ str) =>
    str.length <= MAX_LENGTH ? str : str.slice(0, MAX_LENGTH - 3) + '...'

/**
 * @type {Record<string, (item: PublicEvent) => string>}
 */
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

// Get the user's public events
console.log(`Getting activity for ${GH_USERNAME}`)
const { data: events } = await octokit.activity.listPublicEventsForUser({
    username: GH_USERNAME,
    per_page: 100,
})

console.log(`Activity for ${GH_USERNAME}, ${events.length} events found.`)

const processedEvents = /** @type {PublicEvent[]} */ ([])
const pr = /** @type {Set<number>} */ (new Set())

for (const event of events) {
    // Ignore events that are not in the serializer
    if (!Object.hasOwn(serializers, event.type)) continue
    // If the event is not a `PullRequestEvent`, add it directly
    if (event.type !== 'PullRequestEvent') {
        processedEvents.push(event)
        continue
    }
    // Exclude pull requests that are closed but not merged
    const { action, pull_request } = event.payload
    if (action === 'closed' && !pull_request.merged) continue
    // Consolidate duplicate PR events, retaining only the latest one
    const prNumber = event.payload.pull_request.number
    if (!pr.has(prNumber)) {
        pr.add(prNumber)
        processedEvents.push(event)
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
    console.log(`Updating Gist ${GIST_ID}`)
    if (process.argv.includes('--dry')) {
        console.log('Dry run, not updating the Gist')
        console.log(content)
        process.exit(0)
    }
    await box.update({ content })
    console.log('Gist updated!')
} catch (err) {
    console.error(`Error getting or update the Gist: ${err}`)
    process.exit(1)
}
