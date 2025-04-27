import { vi } from 'vitest'

vi.stubEnv('GH_PAT', '123abc')
vi.stubEnv('GH_USERNAME', 'clippy')
vi.stubEnv('GIST_ID', '456def')
vi.stubEnv('GITHUB_TOKEN', '123abcd')
