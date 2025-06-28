/**
 * Workerの設定管理を担当するクラス
 */
export class WorkerConfiguration {
  private verbose: boolean;
  private appendSystemPrompt?: string;
  private translatorUrl?: string;
  private dangerouslySkipPermissions: boolean;

  constructor(
    verbose = false,
    appendSystemPrompt?: string,
    translatorUrl?: string,
    dangerouslySkipPermissions = false, // デフォルトはfalse（セキュリティ重視）
  ) {
    this.verbose = verbose;
    this.appendSystemPrompt = appendSystemPrompt;
    this.translatorUrl = translatorUrl;
    this.dangerouslySkipPermissions = dangerouslySkipPermissions;
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
   * Claudeコマンドの引数を構築
   */
  buildClaudeArgs(prompt: string, sessionId?: string | null): string[] {
    const args = [
      "-p",
      prompt,
      "--output-format",
      "stream-json",
      "--verbose", // stream-jsonには--verboseが必須
    ];

    // 注意: stream-jsonを使用する場合は--verboseが必須のため、常に追加

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
   * verboseログを出力する
   * 注意: Claude CLIは常に--verboseで実行されるが、アプリケーションレベルでの詳細ログは設定で制御
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
