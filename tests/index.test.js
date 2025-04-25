import { Toolkit } from 'actions-toolkit'
import { beforeEach, expect, it, vi } from 'vitest'

const events = [
    {
        type: 'IssuesEvent',
        repo: { name: 'clippy/take-over-github' },
        payload: { action: 'opened', issue: { number: 1 } },
    },
    {
        type: 'IssueCommentEvent',
        repo: { name: 'clippy/take-over-github' },
        payload: { action: 'closed', issue: { number: 1 } },
    },
    {
        type: 'PullRequestEvent',
        repo: { name: 'clippy/take-over-github' },
        payload: { action: 'opened', pull_request: { number: 2 } },
    },
    {
        type: 'PullRequestEvent',
        repo: { name: 'clippy/take-over-github' },
        payload: {
            action: 'closed',
            pull_request: { number: 2, merged: true },
        },
    },
    {
        type: 'PullRequestEvent',
        repo: { name: 'clippy/take-over-github' },
        payload: {
            action: 'closed',
            pull_request: { number: 3, merged: false },
        },
    },
    {
        type: 'PullRequestEvent',
        repo: {
            name: 'clippy/really-really-really-really-really-really-really-really-really-long',
        },
        payload: { action: 'opened', pull_request: { number: 3 } },
    },
    {
        type: 'PullRequestEvent',
        repo: { name: 'clippy/take-over-github' },
        payload: { action: 'opened', pull_request: { number: 4 } },
    },
].toReversed()

const mockedUpdate = vi.fn()

vi.mock('gist-box', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        GistBox: vi.fn().mockImplementation(() => ({
            update: mockedUpdate,
        })),
    }
})

vi.mock('actions-toolkit', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        Toolkit: vi.fn().mockImplementation(() => ({
            exit: {
                success: vi.fn(),
                failure: vi.fn(),
            },
            log: {
                debug: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
                fatal: vi.fn(),
            },
            github: {
                activity: {
                    listPublicEventsForUser: () => ({
                        data: events,
                    }),
                },
            },
        })),
    }
})

describe('activity-box', () => {
    /** @type {Parameters<typeof Toolkit['run']>[]} */
    let action
    /** @type {Toolkit} */
    let tools

    beforeEach(async () => {
        Toolkit.run = (fn) => {
            action = fn
        }

        await import('../index.js')

        tools = new Toolkit()

        mockedUpdate.mockReset()
    })

    it('updates the Gist with the expected string', async () => {
        await action(tools)
        expect(mockedUpdate).toHaveBeenCalled()
        expect(mockedUpdate.mock.calls[0][0]).toMatchSnapshot()
    })

    it('handles failure to update the Gist', async () => {
        mockedUpdate.mockImplementationOnce(() => {
            throw new Error('404')
        })

        await action(tools)
        expect(tools.exit.failure).toHaveBeenCalled()
        expect(tools.exit.failure.mock.calls).toMatchSnapshot()
    })
})
