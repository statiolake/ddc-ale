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

interface AleParams {
  cleanResultsWhitespace: boolean;
}

export class Source extends BaseSource {
  async onInit({ denops }: OnInitArguments): Promise<void> {
    await batch(denops, async (denops) => {
      await vars.g.set(
        denops,
        "ddc#source#ale#_results",
        DEFAULT_EMPTY_RESULTS,
      );
      await vars.g.set(denops, "ddc#source#ale#_requested", false);
      await vars.g.set(denops, "ddc#source#ale#_prev_input", "");
    });
  }

  async gatherCandidates(
    { denops, context, sourceParams }: GatherCandidatesArguments,
  ): Promise<Candidate[]> {
    const params: AleParams = (sourceParams as unknown as AleParams);
    const prevInput: string = await vars.g.get(
      denops,
      "ddc#source#ale#_prev_input",
    ).then((p) => typeof p === "string" ? p : "");
    const requested: boolean = await vars.g.get(
      denops,
      "ddc#source#ale#_requested",
    ).then((r) => typeof r === "boolean" ? r : false);

    if (context.input === prevInput && requested) {
      const results: Candidate[] = await vars.g.get(
        denops,
        "ddc#source#ale#_results",
      ) ?? DEFAULT_EMPTY_RESULTS;
      // FIXME: Hack: Some LSPs (such as Rust Analyzer) sometimes return
      // candidates ending with whitespace, so fix them here.
      if (params.cleanResultsWhitespace) {
        results.forEach((result) => result.word = result.word.trimEnd());
      }
      return results;
    }

    await batch(denops, (denops) => {
      vars.g.set(denops, "ddc#source#ale#_results", []);
      vars.g.set(denops, "ddc#source#ale#_requested", false);
      vars.g.set(
        denops,
        "ddc#source#ale#_prev_input",
        context.input,
      );
      denops.call("ddc#ale#get_completions");
      return Promise.resolve();
    });

    return [];
  }

  params(): Record<string, unknown> {
    const Params: AleParams = { cleanResultsWhitespace: false };
    // It's unfortunate that the current types for BaseSource does not allow us
    // to pass through param types, maybe I can file an update to this
    return Params as unknown as Record<string, unknown>;
  }
}
