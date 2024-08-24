
export interface IBlackListedTokenRepository {
  blacklist(token: string): Promise<void>
  isBlacklisted(token: string): Promise<boolean>
}
