function! s:callback(results) abort
  if type(a:results) != type([])
    let a:results = []
  endif

  if len(a:results) > 0
    let g:ddc#source#ale#_results = a:results
    let g:ddc#source#ale#_requested = v:true
    call ddc#refresh_candidates()
  endif
endfunction

function! ddc#ale#get_completions() abort
  if !ale#completion#CanProvideCompletions()
    call s:callback([])
  else
    call ale#completion#GetCompletions('ale-callback', {'callback': {results->s:callback(results)}})
  endif
endfunction
