(function() {
    var root = { type: "view", children: [], style: {}, attrs: {}, listeners: {} };
    var render = Timeless.Native.render;

    var elm = {
        kind: "element",
        t: "view",
        $elm: null,
        props: { style: {} },
        events: {},
        children: [
            {
                kind: "element",
                t: "text",
                $elm: null,
                value: "Hello, Timeless Native!",
                children: []
            }
        ]
    };

    render(elm, root);

    if (root.children.length > 0) {
        __nativeBridge_render(root.children[0]);
    }
})();
