import { CLAUDE_CLI } from "../constants.ts";

/**
 * Workerの設定管理を担当するクラス
 */
export class WorkerConfiguration {
  private verbose: boolean;
  private appendSystemPrompt?: string;
  private translatorUrl?: string;
  private dangerouslySkipPermissions: boolean;
  private maxOutputTokens: number;

  constructor(
    verbose = false,
    appendSystemPrompt?: string,
    translatorUrl?: string,
    dangerouslySkipPermissions = true, // デフォルトはtrue（既存の動作を維持）
    maxOutputTokens?: number,
  ) {
    this.verbose = verbose;
    this.appendSystemPrompt = appendSystemPrompt;
    this.translatorUrl = translatorUrl;
    this.dangerouslySkipPermissions = dangerouslySkipPermissions;

    // 環境変数からトークン制限を取得、未設定の場合はデフォルト値を使用
    this.maxOutputTokens = maxOutputTokens ||
      this.getMaxOutputTokensFromEnv() ||
      CLAUDE_CLI.DEFAULT_MAX_OUTPUT_TOKENS;
  }

  /**
   * verboseモードを設定する
   */
  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
  }

  /**
   * verboseモードが有効かを取得
   */
  isVerbose(): boolean {
    return this.verbose;
  }

  /**
   * 追加システムプロンプトを取得
   */
  getAppendSystemPrompt(): string | undefined {
    return this.appendSystemPrompt;
  }

  /**
   * 翻訳URLを取得
   */
  getTranslatorUrl(): string | undefined {
    return this.translatorUrl;
  }

  /**
   * 権限チェックスキップ設定を設定する
   */
  setDangerouslySkipPermissions(skipPermissions: boolean): void {
    this.dangerouslySkipPermissions = skipPermissions;
  }

  /**
   * 権限チェックスキップ設定を取得
   */
  getDangerouslySkipPermissions(): boolean {
    return this.dangerouslySkipPermissions;
  }

  /**
   * 環境変数から最大出力トークン数を取得
   */
  private getMaxOutputTokensFromEnv(): number | null {
    const envValue = Deno.env.get("CLAUDE_CODE_MAX_OUTPUT_TOKENS");
    if (envValue) {
      const parsed = parseInt(envValue, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return null;
  }

  /**
   * 最大出力トークン数を設定
   */
  setMaxOutputTokens(tokens: number): void {
    if (tokens > 0) {
      this.maxOutputTokens = tokens;
    }
  }

  /**
   * 最大出力トークン数を取得
   */
  getMaxOutputTokens(): number {
    return this.maxOutputTokens;
  }

  /**
   * Claudeコマンドの引数を構築
   */
  buildClaudeArgs(prompt: string, sessionId?: string | null): string[] {
    const args = [
      "-p",
      prompt,
      "--output-format",
      "stream-json",
    ];

    // verboseモードが有効な場合のみ--verboseオプションを追加
    if (this.verbose) {
      args.push("--verbose");
    }

    // セッション継続の場合
    if (sessionId) {
      // args.push("--resume", sessionId);
      args.push("--continue");
    }

    // 権限チェックスキップが有効な場合のみ
    if (this.dangerouslySkipPermissions) {
      args.push("--dangerously-skip-permissions");
    }

    // append-system-promptが設定されている場合
    if (this.appendSystemPrompt) {
      args.push(`--append-system-prompt=${this.appendSystemPrompt}`);
    }

    return args;
  }

  /**
   * Claude CLIの実行に必要な環境変数を構築
   */
  buildClaudeEnv(): Record<string, string> {
    const env: Record<string, string> = {};

    // 最大出力トークン数を環境変数として設定
    env.CLAUDE_CODE_MAX_OUTPUT_TOKENS = this.maxOutputTokens.toString();

    return env;
  }

  /**
   * verboseログを出力する
   */
  logVerbose(
    workerName: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): void {
    if (this.verbose) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [Worker:${workerName}] ${message}`;
      console.log(logMessage);

      if (metadata && Object.keys(metadata).length > 0) {
        console.log(
          `[${timestamp}] [Worker:${workerName}] メタデータ:`,
          metadata,
        );
      }
    }
  }
}
