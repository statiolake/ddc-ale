// ddc source for ALE.

import {
  BaseSource,
  Candidate,
  Context,
  DdcOptions,
  SourceOptions,
} from "https://deno.land/x/ddc_vim@v0.0.13/types.ts";
import { Denops } from "https://deno.land/x/ddc_vim@v0.0.13/deps.ts";
import { once } from "https://deno.land/x/denops_std@v1.0.1/anonymous/mod.ts";

export class Source extends BaseSource {
  getCompletePosition(
    denops: Denops,
    context: Context,
    _options: DdcOptions,
    _sourceOptions: SourceOptions,
    _sourceParams: Record<string, unknown>
  ): Promise<number> {
    return denops.call(
      "ale#completion#GetCompletionPositionForDeoplete",
      context.input
    ) as Promise<number>;
  }

  async gatherCandidates(
    denops: Denops,
    _context: Context,
    _ddcOptions: DdcOptions,
    _sourceOptions: SourceOptions,
    _sourceParams: Record<string, unknown>,
    _completeStr: string
  ): Promise<Candidate[]> {
    const candidates = await new Promise<Candidate[]>((resolve) => {
      denops.call(
        "ddc#ale#get_completions",
        denops.name,
        once(denops, (results: unknown) => resolve(results as Candidate[]))[0]
      );
    });

    // FIXME: Hack: Some LSP (such as Rust Analyzer) sometimes returns
    // candidates ending with whitespace, so fix them here.
    candidates.forEach(
      (candidate) => (candidate.word = candidate.word.trimEnd())
    );

    return candidates;
  }
}
