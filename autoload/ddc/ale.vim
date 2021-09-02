let s:plugin_name = v:null
let s:method_name = v:null

function! s:callback(results) abort
  if type(s:method_name) == v:t_none
    return
  endif

  if type(a:results) != type([]) && type(a:results) != v:t_none
    let a:results = []
  endif

  " Just in case something might break with the denops call, lets wipe out our
  " script variables to prevent future timeout errors that could occur
  let l:plugin_name = s:plugin_name
  let l:method_name = s:method_name
  let s:plugin_name = v:null
  let s:method_name = v:null
  call denops#notify(l:plugin_name, l:method_name, [a:results])
endfunction

function! ddc#ale#get_completions(plugin_name, method_name) abort
  " If we were already waiting for a response from the server, we need to go
  " ahead and call it it with a null value to make room for the next batch of
  " completions
  if type(s:method_name) != v:t_none
    call s:callback(v:null)
  endif

  let s:plugin_name = a:plugin_name
  let s:method_name = a:method_name

  if !ale#completion#CanProvideCompletions()
    call s:callback([])
  else
    call ale#completion#GetCompletions('ale-callback', {'callback': {results->s:callback(results)}})
  endif
endfunction
