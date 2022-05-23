// ddc source for ALE.

import {
  BaseSource,
  Item,
  DdcGatherItems
} from "https://deno.land/x/ddc_vim@v2.3.0/types.ts";
import {
  GatherArguments,
} from "https://deno.land/x/ddc_vim@v2.3.0/base/source.ts";

type AleParams = {
  cleanResultsWhitespace: boolean;
};

export class Source extends BaseSource<AleParams> {
  private counter = 0;

  async gather(
    { denops, sourceParams, onCallback }: GatherArguments<AleParams>,
  ): Promise<DdcGatherItems> {
    this.counter = (this.counter + 1) % 100;
    const id = `source/${this.name}/${this.counter}`;

    const [results] = await Promise.all([
      onCallback(id) as Promise<Item[]>,
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
