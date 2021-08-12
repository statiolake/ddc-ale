function! s:callback(plugin_name, method_name, results) abort
  if type(a:results) != type([])
    let a:results = []
  endif
  call denops#notify(a:plugin_name, a:method_name, [a:results])
endfunction

function! ddc#ale#get_completions(plugin_name, method_name) abort
  if !ale#completion#CanProvideCompletions()
    call s:callback(a:plugin_name, a:method_name, [])
  endif

  call ale#completion#GetCompletions(
    \   'ale-callback',
    \   {'callback': {results->s:callback(a:plugin_name, a:method_name, results)}}
    \ )
endfunction
