// ddc source for ALE.

import {
  BaseSource,
  Candidate,
} from "https://deno.land/x/ddc_vim@v0.18.0/types.ts";
import {
  GatherCandidatesArguments,
} from "https://deno.land/x/ddc_vim@v0.18.0/base/source.ts";

type AleParams = {
  cleanResultsWhitespace: boolean;
};

export class Source extends BaseSource<AleParams> {
  private counter = 0;

  async gatherCandidates(
    { denops, sourceParams, onCallback }: GatherCandidatesArguments<AleParams>,
  ): Promise<Candidate[]> {
    this.counter = (this.counter + 1) % 100;
    const id = `source/${this.name}/${this.counter}`;

    const [results] = await Promise.all([
      onCallback(id) as Promise<Candidate[]>,
      denops.call("ddc#ale#get_completions", id),
    ]);

    // FIXME: Hack: Some LSPs (such as Rust Analyzer) sometimes return
    // candidates ending with whitespace, so fix them here.
    if (sourceParams.cleanResultsWhitespace) {
      results.forEach((result) => result.word = result.word.trimEnd());
    }
    return results;
  }

  params(): AleParams {
    return { cleanResultsWhitespace: false };
  }
}
