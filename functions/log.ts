// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

export class log {
  public static info (...message: any): void {
    console.log(`[${new Date().toLocaleString()}]`, ...message)
  }

  public static error (...message: any): void {
    console.error(`[${new Date().toLocaleString()}]`, ...message)
  }
}
