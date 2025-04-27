import { graphql } from '@octokit/graphql'
import type { SearchIssuesResponse } from 'src/types'
import SearchIssues from './SearchIssues.graphql'

const graphqlWithAuth = graphql.defaults({
    headers: {
        authorization: `token ${env.GH_PAT}`,
    },
})

export const getIssues = async (author: string) => {
    return graphqlWithAuth<SearchIssuesResponse>(SearchIssues, {
        searchQuery: `author:${author} is:issue`,
    })
}

export const getPRs = async (author: string) => {
    return graphqlWithAuth<SearchIssuesResponse>(SearchIssues, {
        searchQuery: `author:${author} is:pr`,
    })
}
