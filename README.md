# example

Here is one way to manually set the trace context, in order to continue it inside the program

This puts the whole execution in a callback using context.with()

You could pass the context around and use it in span creation instead if you want
