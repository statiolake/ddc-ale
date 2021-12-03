function! s:callback(id, results) abort
  let l:results = a:results
  if type(l:results) != type([])
    let l:results = []
  endif
  call ddc#callback(a:id, l:results)
endfunction

function! ddc#ale#get_completions(id) abort
  if !ale#completion#CanProvideCompletions()
    call s:callback(a:id, [])
  else
    call ale#completion#GetCompletions('ale-callback', {'callback': {results->s:callback(a:id, results)}})
  endif
endfunction
