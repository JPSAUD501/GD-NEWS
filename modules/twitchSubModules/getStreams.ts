// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import request from 'request'
import { log } from '../../functions/log'

export async function streamGetData (channelName: string, clientID: string, authKey: string) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Client-Id': clientID,
      Authorization: `Bearer ${authKey}`
    }
    request.get(
            `https://api.twitch.tv/helix/streams?user_login=${channelName}`, { headers: headers },
            (error, res, body) => {
              if (error) {
                return log.error(error)
              }
              try {
                resolve(JSON.parse(body))
              } catch (e) {
                reject(e)
              }
            }
    )
  })
}
