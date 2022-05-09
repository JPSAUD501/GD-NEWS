// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import Discord from 'discord.js'

export interface IClientYTP extends Discord.Client {
  YTP?: any
}

export interface ITwitchChannelsDataChannel {
  [channelName: string]: {
    discordMessageId: string,
    twitchStreamId: string
  }
}
