// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import request from 'request'
import { log } from '../../functions/log'

export async function getAuthKey (clientID: string, clientSecret: string) : Promise<any> {
  return new Promise((resolve: any) => {
    request.post(
      `https://id.twitch.tv/oauth2/token?client_id=${clientID}&client_secret=${clientSecret}&grant_type=client_credentials`,
      (error, _res, body) => {
        if (error) {
          return log.error(error)
        }
        try {
          resolve(JSON.parse(body).access_token)
        } catch (e) {
          log.error(e)
        }
      }
    )
  })
}
