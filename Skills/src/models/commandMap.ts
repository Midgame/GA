import SkillMessage from "./skillMessage"
import logger from '../util/logger'
import SkillResponse from './skillResponse'

type skillHandler = (message: SkillMessage) => SkillResponse | Promise<SkillResponse>

class Command {
  canonicalName: string

  aliases: string[]

  handler: skillHandler

  findAlias(message: string): string | undefined {
    return this.aliases.find((item: string) => message.startsWith(item))
  }
}


export default class CommandMap {
  commands: Command[]

  constructor() {
    this.commands = []
  }

  findCommand(message: string): Command | undefined {
    const command = this.commands.find((item: Command) => !!item.findAlias(message))
    return command
  }

  findMatchingAlias(message: string): string | undefined {
    for (let i = 0; i < this.commands.length; i++) {
      const alias = this.commands[i].findAlias(message)
      if (alias) return alias
    }
    return undefined
  }

  handleCommand(message: SkillMessage): Promise<SkillResponse> | SkillResponse {
    const command = this.findCommand(message.contents)
    if (!command) {
      logger.error(`Tried to call handleCommand on non-existent handler: ${message.toString()}`)
      return null
    }
    logger.info(`Calling command: ${command.canonicalName}`)
    return command.handler(message)
  }

  addCommand(canonicalName: string, aliases: string[], handler: skillHandler): void {
    const command = new Command()
    command.canonicalName = canonicalName
    command.aliases = aliases
    if (!command.aliases.includes(canonicalName)) {
      command.aliases.push(canonicalName)
    }
    command.handler = handler
    this.commands.push(command)
  }
}
