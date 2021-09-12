# ddc-ale

ALE source for ddc.vim.

## Requirements

- ddc.vim: <https://github.com/Shougo/ddc.vim>
- ale.vim: <https://github.com/dense-analysis/ale>

You also need denops.vim (<https://github.com/vim-denops/denops.vim>) to use
ddc.vim, which depends on Deno (<https://deno.land/>). For more installation
details, please refer to each plugin's README.

## Example

```vim
# Enable ALE source
call ddc#custom#patch_global('sources', ['ale'])

# Option: cleanResultsWhitespace
call ddc#custom#patch_global('sourceParams',
    \ {'ale': {'cleanResultsWhitespace': v:false}})
```

## Options

- `cleanResultsWhitespace`

  Default: `v:false`

  Whether it should remove the trailing whitespaces of each candidate
  returned by ALE.

  Usually you don't need to turn on this option Some LSPs (such as Rust
  Analyzer) returne words containing trailing whitespaces. If you feel that's
  unpleasant, you can fix the whitespace by turning this option to `v:true`.
