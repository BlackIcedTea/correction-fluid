# Correction Fluid

Automatically replace the text of a page to what you want.

Correction Fluid use XRegExp(http://xregexp.com/) to replace the text of a page to what you want automatically.

We use rule control replacing, You can use it to translate Web UI, explain memes, or do some mischief...

Rule Example:
Find: ``"(.*?)"``
Replace: ``「$1」``

It makes double quotation marks converted into Chinese vertical quotation marks.

You can limited rule in detected URL or CSS selector, it is supported.

You can exclude some important URL that should not replace text in Exception Option, one line one URL matcher(support XRegExp).

If you have any advice, just comment!
