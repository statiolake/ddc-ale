// ddc source for ALE.

import {
  BaseSource,
  Candidate,
} from "https://deno.land/x/ddc_vim@v0.4.3/types.ts";
import {
  GatherCandidatesArguments,
  GetCompletePositionArguments,
} from "https://deno.land/x/ddc_vim@v0.4.3/base/source.ts";
import { once } from "https://deno.land/x/denops_std@v1.0.1/anonymous/mod.ts";

export class Source extends BaseSource {
  getCompletePosition(
    { denops, context }: GetCompletePositionArguments,
  ): Promise<number> {
    return denops.call(
      "ale#completion#GetCompletionPositionForDeoplete",
      context.input,
    ) as Promise<number>;
  }

  async gatherCandidates(
    { denops }: GatherCandidatesArguments,
  ): Promise<Candidate[]> {
    return await new Promise<Candidate[]>((resolve) => {
      denops.call(
        "ddc#ale#get_completions",
        denops.name,
        once(denops, (results: unknown) => {
          const candidates: Candidate[] = Array.isArray(results) ? results : [];
          // FIXME: Hack: Some LSP (such as Rust Analyzer) sometimes returns
          // candidates ending with whitespace, so fix them here.
          candidates.forEach(
            (candidate) => {
              candidate.word = candidate.word.trimEnd();
            },
          );
          resolve(candidates);
        })[0],
      );
    });
  }
}
