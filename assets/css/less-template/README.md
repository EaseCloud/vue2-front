Less Template
=============

Less template including all usual css extension and compatible mix-ins, import in other less file to get used.

Examples
--------

### 1. Importing the library

Put together `template.less` file in your project folder, for example:

```
/
/css/
/css/template.less
/css/style.less
/js/
/index.html
```

So, now we can import `template.less` in another less file:

```less
// File: style.less
import (once) "template.less"

// using less rules supported by template.less
// ...
```

### 2. Clearfix

If we have a div which children are all `float: left`. 

The outer `div#outer` cannot have a proper height wrapping all the inner elements.

To fix this issue, we make a new less class `clearfix` to work around it.

You can add this class directly into the outer div, or using mix-ins to extend the css rules of it:

HTML:

```html
<div id="outer" class="clearfix">
  <div class="item" class="pull-left">1</div>
  <div class="item" class="pull-left">2</div>
  <div class="item" class="pull-left">3</div>
</div>
```

The above example add the supporting `clearfix` and `pull-left` in the relative elements.
still, you can also use the below mix-in version to make a same effect.

HTML:

```html
<div id="outer">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>
```

LESS:

```less
import (once) "template.less"

#outer {
  .clearfix();
  .item {
    .pull-left;
  }
}
```
