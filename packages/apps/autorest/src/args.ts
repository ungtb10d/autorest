import { parseArgs } from "@autorest/configuration";

export interface AutorestArgs {
  // Versioning
  v3?: boolean;
  preview?: boolean;
  prerelease?: boolean;
  version?: string;
  latest?: boolean;

  reset?: boolean;
  debug?: boolean;
  info?: boolean;
  json?: boolean;
  configFileOrFolder?: string;
  force?: boolean;

  verbose?: boolean;
  /**
   * To enable logs of the config loading in the cli.
   */
  "debug-cli-config-loading"?: boolean;
  "message-format"?: "regular" | "json";
  "list-available"?: boolean;
  "clear-temp"?: boolean;
  "list-installed"?: boolean;
  "skip-upgrade-check"?: boolean;
}

/**
 * Parse a list of command line arguments.
 * @param argv List of cli args(process.argv)
 */
export function parseAutorestArgs(argv: string[]): AutorestArgs {
  return parseArgs(argv).options;
}
