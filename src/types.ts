export interface BasicSearchNode {
    type: 'Issue' | 'PullRequest'
    title: string
    repo: {
        name: string
    }
    number: number
    createdAt: string
}

export interface IssueNode extends BasicSearchNode {
    type: 'Issue'
    issueState: 'OPEN' | 'CLOSED'
}

export interface PullRequestNode extends BasicSearchNode {
    type: 'PullRequest'
    prState: 'OPEN' | 'CLOSED' | 'MERGED'
}

export type SearchNode = IssueNode | PullRequestNode

interface SearchResponse<T> {
    search: {
        edges: T[]
    }
}

export type SearchIssuesResponse = SearchResponse<{
    node: SearchNode
}>
