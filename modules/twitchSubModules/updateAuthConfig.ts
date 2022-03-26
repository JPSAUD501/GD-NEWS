// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { log } from '../../functions/log'
import { getAuthKey } from './authKey'

export async function updateTwitchAuthConfig (): Promise<string | void> {
  try {
    if (!process.env.DISCORD_TOKEN) throw new Error('Missing Discord Token')
    if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_SECRET) throw new Error('Missing Twitch Client ID or Secret')

    const authKey = await getAuthKey(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_SECRET)
    if (!authKey) return log.error('Error getting auth key')

    return authKey
  } catch (err) { log.info(err) }
}
