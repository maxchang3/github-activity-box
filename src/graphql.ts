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
 * Searches GitHub issues or pull requests by author using the GraphQL API.
 *
 * GitHub treats pull requests as a type of issue, but GraphQL API requires
 * separate queries for accurate results.
 *
 * @note Mixing issues and pull requests in a single GraphQL query often returns empty results.
 *
 * @see https://docs.github.com/en/graphql/reference/queries - GitHub GraphQL reference
 * @see https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#about-pull-requests - About pull requests
 *
 */
const searchIssues = async (author: string, type: IssueType): Promise<SearchResponse> => {
    const response = await graphqlWithAuth(SearchIssues, {
        searchQuery: `author:${author} is:${type} sort:updated-desc`,
    })
    return SearchResponseSchema.parse(response)
}

export const getIssues = (author: string) => searchIssues(author, 'issue')
export const getPRs = (author: string) => searchIssues(author, 'pr')
