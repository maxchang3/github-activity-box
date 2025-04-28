import SearchIssues from '@/SearchIssues.graphql'
import { env } from '@/env'
import { type SearchResponse, SearchResponseSchema } from '@/schema'
import { graphql } from '@octokit/graphql'

const graphqlWithAuth = graphql.defaults({
    headers: {
        authorization: `token ${env.GH_PAT}`,
    },
})

type IssueType = 'issue' | 'pr'

/**
 * Executes a search query via GitHub's GraphQL API
 *
 * *Pull requests are a type of issue.* —— About pull requests, GitHub Docs
 * @see https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#about-pull-requests
 *
 * Should use separate queries for issues and pull requests, or we will get empty results.
 * @see https://docs.github.com/en/graphql/reference/queries
 */
const searchIssues = async (author: string, type: IssueType): Promise<SearchResponse> => {
    const response = await graphqlWithAuth(SearchIssues, {
        searchQuery: `author:${author} is:${type} sort:updated-desc`,
    })
    return SearchResponseSchema.parse(response)
}

export const getIssues = (author: string) => searchIssues(author, 'issue')
export const getPRs = (author: string) => searchIssues(author, 'pr')
