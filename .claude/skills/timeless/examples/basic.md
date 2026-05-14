It show a basic page code

```js
function BasicPageView() {
  const title_ = ref("Basic Page");
  const navs_ = refarr([
    {
      title: 'Detail Page',
      href: '/detail',
    },
  ]);

  return View({
    class: 'basic-page'
  }, [
    View({ class: 'basic-page__title' }, ["Hello", title_]),
    View({}, [
      For({
        each:  navs_,
	render(nav) {
	  return View({}, []);
	},
      }),
    ]),
  ]);
}
```

