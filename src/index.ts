import { env } from '@/env'
import { getIssues, getPRs } from '@/graphql'
import type { IssueNode, PullRequestNode } from '@/schema'
import { GistBox, MAX_LENGTH, MAX_LINES } from 'gist-box'

const capitalize = <T extends string>(str: T) =>
    (str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase()) as Capitalize<
        Lowercase<T>
    >

const truncate = (str: string) =>
    str.length <= MAX_LENGTH ? str : str.slice(0, MAX_LENGTH - 3) + '...'

const serializers = {
    Issue: (item: IssueNode) => {
        const action = capitalize(item.issueState)
        return `❗️ ${action}: issue #${item.number} in ${item.repo.name}`
    },
    PullRequest: (item: PullRequestNode) => {
        const action = capitalize(item.prState)
        const emoji =
            action === 'Closed' ? '❌' : action === 'Merged' ? '🎉' : '💪'
        const line = `${emoji} ${capitalize(action)}:`
        return `${line} PR #${item.number} in ${item.repo.name}`
    },
}

const getIssuesAndPRs = async (author: string) => {
    const issues = await getIssues(author)
    const PRs = await getPRs(author)

    const allNodes = [
        ...issues.search.edges.map((e) => e.node),
        ...PRs.search.edges.map((e) => e.node),
    ]
        // Filter out excluded repos and owners
        .filter(
            (node) =>
                !env.EXCLUDE_REPO.includes(node.repo.name) &&
                !env.EXCLUDE_OWNER.includes(node.repo.owner.login)
        )
        // Sort by most recent activity (closed or created)
        .sort((a, b) => {
            const aDate = a.closedAt || a.createdAt
            const bDate = b.closedAt || b.createdAt
            return bDate.getTime() - aDate.getTime()
        })

    return allNodes
}

const activities = await getIssuesAndPRs(env.GH_USERNAME)

const content = activities
    // We only have five lines to work with
    .slice(0, MAX_LINES)
    // Call the serializer to construct a string
    .map((item) => {
        switch (item.type) {
            case 'Issue':
                return serializers.Issue(item)
            case 'PullRequest':
                return serializers.PullRequest(item)
            default:
                // @ts-expect-error never happens
                throw new Error(`Unknown type: ${item.type}`)
        }
    })
    // Truncate if necessary
    .map(truncate)
    // Join items to one string
    .join('\n')

const box = new GistBox({ id: env.GIST_ID, token: env.GH_PAT })

try {
    console.log(`Updating Gist ${env.GIST_ID}`)
    if (process.argv.includes('--dry')) {
        console.log('Dry run, not updating the Gist')
        console.log(content)
        process.exit(0)
    }
    await box.update({ content, description: env.DESCRIPTION })
    console.log('Gist updated!')
} catch (err) {
    console.error(`Error getting or update the Gist: ${err}`)
    process.exit(1)
}
