// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import request from 'request'
import { log } from '../../functions/log'

export async function getChannelData (channelName: string, clientID: string, authKey: string) {
  return new Promise((resolve, reject) => {
    const headers = {
      'client-id': clientID,
      Authorization: `Bearer ${authKey}`
    }
    request.get(
            `https://api.twitch.tv/helix/search/channels?query=${channelName}`, { headers: headers },
            (error, res, body) => {
              if (error) {
                return log.error(error)
              }
              try {
                const channelTempData = JSON.parse(body).data
                let doesExist = false

                for (let i = 0; i < channelTempData.length; i++) {
                  if ((channelTempData[i].broadcaster_login).toLowerCase() === channelName.toLowerCase()) {
                    doesExist = true
                    resolve(JSON.parse(body).data[i])
                  }
                }

                if (!doesExist) {
                  resolve(false)
                }
              } catch (e) {
                reject(e)
              }
            }
    )
  })
}
