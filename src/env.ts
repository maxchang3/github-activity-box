import 'dotenv/config'

const { GIST_ID, GH_USERNAME, GH_PAT } = process.env

if (!GIST_ID || !GH_USERNAME || !GH_PAT) {
    console.error(
        'GIST_ID, GH_USERNAME and GH_PAT must be set in the environment variables'
    )
    process.exit(1)
}

export const ENV = {
    GIST_ID,
    GH_USERNAME,
    GH_PAT,
}
