// ddc source for ALE.

import {
  BaseSource,
  Candidate,
} from "https://deno.land/x/ddc_vim@v0.5.2/types.ts";
import { batch, vars } from "https://deno.land/x/ddc_vim@v0.5.2/deps.ts";
import {
  GatherCandidatesArguments,
  OnInitArguments,
} from "https://deno.land/x/ddc_vim@v0.5.2/base/source.ts";

const DEFAULT_EMPTY_RESULTS: Candidate[] = [];

export class Source extends BaseSource {
  async onInit(args: OnInitArguments): Promise<void> {
    await batch(args.denops, async (denops) => {
      await vars.g.set(denops, "ddc#source#ale#_results", DEFAULT_EMPTY_RESULTS);
      await vars.g.set(denops, "ddc#source#ale#_requested", false);
      await vars.g.set(denops, "ddc#source#ale#_prev_input", "");
    });
  }

  async gatherCandidates(
    args: GatherCandidatesArguments,
  ): Promise<Candidate[]> {
    const prevInput: string = await vars.g.get(
      args.denops,
      "ddc#source#ale#_prev_input",
    ).then(p => typeof p === 'string' ? p : '');
    const requested: boolean = await vars.g.get(
      args.denops,
      "ddc#source#ale#_requested",
    ).then(r => typeof r === 'boolean' ? r : false);

    if (args.context.input === prevInput && requested) {
      const results: Candidate[] = await vars.g.get(
        args.denops,
        "ddc#source#ale#_results",
      ) ?? DEFAULT_EMPTY_RESULTS;
      // FIXME: Hack: Some LSPs (such as Rust Analyzer) sometimes return
      // candidates ending with whitespace, so fix them here.
      results.forEach((result) => result.word = result.word.trimEnd());
      return results;
    }

    await batch(args.denops, (denops) => {
      vars.g.set(denops, "ddc#source#ale#_results", []);
      vars.g.set(denops, "ddc#source#ale#_requested", false);
      vars.g.set(
        denops,
        "ddc#source#ale#_prev_input",
        args.context.input,
      );
      denops.call("ddc#ale#get_completions");
      return Promise.resolve();
    });

    return [];
  }
}
