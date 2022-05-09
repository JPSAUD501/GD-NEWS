// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import axios from 'axios'
import YAML from 'yaml'
import fs from 'fs'
import getColors from 'get-image-colors'
import Discord, { MessageEmbed } from 'discord.js'
import { log } from '../functions/log'
import { ITwitchChannelsDataChannel } from '../interfaces/interfaces'
import { getChannelData } from './twitchSubModules/channelData'
import { streamGetData } from './twitchSubModules/getStreams'
import { updateTwitchAuthConfig } from './twitchSubModules/updateAuthConfig'
import { client } from '../index'

const config = YAML.parse(fs.readFileSync('./config.yaml', 'utf8'))

const twitchKey = {
  key: ''
}

const twitchChannelsData: { channel: ITwitchChannelsDataChannel } = {
  channel: {}
}

export const twitchUpdate: any = async function () {
  try {
    config.twitchChannels.map(
      async function (channel: string, i: number) {
        if (!channel) return log.error('ChannelName is not defined: ' + channel)

        if (!process.env.DISCORD_TOKEN) throw new Error('Missing Discord Token')
        if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_SECRET) throw new Error('Missing Twitch Client ID or Secret')

        const channelName = config.twitchChannels[i]

        const stream: any = await streamGetData(channel, process.env.TWITCH_CLIENT_ID, twitchKey.key)

        if (!stream) return log.error('StreamData is not defined: ' + stream)
        if (!stream.data) return log.error('StreamData.data is not defined: ' + stream)

        if (stream.data.length === 0) return log.info(`${new Date().toLocaleString()} ${channel} is offline`)
        else log.info(`${new Date().toLocaleString()} ${channel} is online`)

        const streamData = stream.data[0]

        const channelData: any = await getChannelData(channel, process.env.TWITCH_CLIENT_ID, twitchKey.key)
        if (!channelData) return log.error('Channel data not found')

        const thumbnailImgResponseTwitch = await axios.get(channelData.thumbnail_url, { responseType: 'arraybuffer' }).catch(log.error)
        if (!thumbnailImgResponseTwitch) return log.error('Error getting thumbnail image')
        if (!thumbnailImgResponseTwitch.data) return log.error('Error getting thumbnail image')
        const options: getColors.Options = { count: 1, type: 'image/png' }
        const colorTwitch = (await getColors(thumbnailImgResponseTwitch.data, options))[0]
        const colorHexTwitch = colorTwitch.hex()
        const ascentColorTwitch = parseInt(colorHexTwitch.replace('#', '0x'), 16)

        const embed = new MessageEmbed()
          .setTitle(`🔴 ${streamData.user_name} está **AO VIVO**!`)
          .setDescription(streamData.title)
          .setURL(`https://www.twitch.tv/${streamData.user_login}`)
          .setColor(ascentColorTwitch)
          .addField('Jogando:', streamData.game_name, true)
          .addField('Espectadores:', streamData.viewer_count.toString(), true)
          .addField('Twitch:', `[Assista a transmissão](https://www.twitch.tv/${streamData.user_login})`)
          .setFooter({ text: streamData.started_at })
          .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${streamData.user_login}-640x360.jpg?cacheBypass=${(Math.random()).toString()}`)
          .setThumbnail(`${channelData.thumbnail_url}`)

        const guild = client.guilds.cache.get(config.discordServerId)
        if (!guild) return log.error('Guild not found')
        const sendChannel = guild.channels.cache.get(config.twitchDiscordChannelId)
        if (!sendChannel) return log.error('Channel not found')
        if (sendChannel.type !== 'GUILD_NEWS') return log.error('Channel is not a text channel: ' + sendChannel.type)

        const message = class {
          static send (embed: Discord.MessageEmbed) {
            const msgContent: {
              content?: string,
              embeds?: [Discord.MessageEmbed],
            } = {}

            if (config.twitchNotifyDiscordRoleID) msgContent.content = `<@&${config.twitchNotifyDiscordRoleID}>`

            msgContent.embeds = [embed]

            sendChannel.send(msgContent).then(async (msg: { id: any }) => {
              twitchChannelsData.channel[channelName] = {
                discordMessageId: msg.id,
                twitchStreamId: streamData.id
              }
            })
          }

          static edit (messageId: string, embed: Discord.MessageEmbed) {
            const msgContent = { content: `<@&${config.twitchNotifyDiscordRoleID}>`, embeds: [embed] }
            sendChannel.messages.fetch(messageId).then((msg: { edit: (arg0: { content: string; embeds: Discord.MessageEmbed[] }) => void }) => {
              msg.edit(msgContent)
            })
          }
        }

        const messageId = twitchChannelsData.channel[channelName]?.discordMessageId || null
        const streamId = twitchChannelsData.channel[channelName]?.twitchStreamId || null

        if (!messageId || !sendChannel.messages.fetch(messageId)) return message.send(embed)
        if (streamId === streamData.id) return message.edit(messageId, embed)
        return message.send(embed)
      })
  } catch (e) { log.error(e) }
}

export const updateTwitchAuth: any = async function () {
  const key = await updateTwitchAuthConfig()
  if (key) twitchKey.key = key
  log.info('New Twitch key: ' + twitchKey.key)
}
