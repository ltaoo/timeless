declare namespace ProsemirrorMod {
  type Child = string | Node | null | undefined | readonly Child[];

  declare class OrderedMap<T = any> {
    private constructor(content: Array<string | T>);

    get(key: string): T | undefined;

    update(key: string, value: T, newKey?: string): OrderedMap<T>;

    remove(key: string): OrderedMap<T>;

    addToStart(key: string, value: T): OrderedMap<T>;

    addToEnd(key: string, value: T): OrderedMap<T>;

    addBefore(place: string, key: string, value: T): OrderedMap<T>;

    forEach(fn: (key: string, value: T) => any): void;

    prepend(map: MapLike<T>): OrderedMap<T>;

    append(map: MapLike<T>): OrderedMap<T>;

    subtract(map: MapLike<T>): OrderedMap<T>;

    toObject(): Record<string, T>;

    readonly size: number;

    static from<T>(map: MapLike<T>): OrderedMap<T>;
  }

  type MapLike<T = any> = Record<string, T> | OrderedMap<T>;

  /**
A mark is a piece of information that can be attached to a node,
such as it being emphasized, in code font, or a link. It has a
type and optionally a set of attributes that provide further
information (such as the target of the link). Marks are created
through a `Schema`, which controls which types exist and which
attributes they have.
*/
  declare class Mark {
    /**
    The type of this mark.
    */
    readonly type: MarkType;
    /**
    The attributes associated with this mark.
    */
    readonly attrs: Attrs;
    /**
    Given a set of marks, create a new set which contains this one as
    well, in the right position. If this mark is already in the set,
    the set itself is returned. If any marks that are set to be
    [exclusive](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) with this mark are present,
    those are replaced by this one.
    */
    addToSet(set: readonly Mark[]): readonly Mark[];
    /**
    Remove this mark from the given set, returning a new set. If this
    mark is not in the set, the set itself is returned.
    */
    removeFromSet(set: readonly Mark[]): readonly Mark[];
    /**
    Test whether this mark is in the given set of marks.
    */
    isInSet(set: readonly Mark[]): boolean;
    /**
    Test whether this mark has the same type and attributes as
    another mark.
    */
    eq(other: Mark): boolean;
    /**
    Convert this mark to a JSON-serializeable representation.
    */
    toJSON(): any;
    /**
    Deserialize a mark from JSON.
    */
    static fromJSON(schema: Schema, json: any): Mark;
    /**
    Test whether two sets of marks are identical.
    */
    static sameSet(a: readonly Mark[], b: readonly Mark[]): boolean;
    /**
    Create a properly sorted mark set from null, a single mark, or an
    unsorted array of marks.
    */
    static setFrom(marks?: Mark | readonly Mark[] | null): readonly Mark[];
    /**
    The empty set of marks.
    */
    static none: readonly Mark[];
  }

  type DOMNode$1 = InstanceType<typeof window.Node>;

  /**
A description of a DOM structure. Can be either a string, which is
interpreted as a text node, a DOM node, which is interpreted as
itself, a `{dom, contentDOM}` object, or an array.

An array describes a DOM element. The first value in the array
should be a string—the name of the DOM element, optionally prefixed
by a namespace URL and a space. If the second element is plain
object, it is interpreted as a set of attributes for the element.
Any elements after that (including the 2nd if it's not an attribute
object) are interpreted as children of the DOM elements, and must
either be valid `DOMOutputSpec` values, or the number zero.

The number zero (pronounced “hole”) is used to indicate the place
where a node's child nodes should be inserted. If it occurs in an
output spec, it should be the only child element in its parent
node.
*/
  type DOMOutputSpec =
    | string
    | DOMNode$1
    | {
        dom: DOMNode$1;
        contentDOM?: HTMLElement;
      }
    | readonly [string, ...any[]];
  /**
A DOM serializer knows how to convert ProseMirror nodes and
marks of various types to DOM nodes.
*/
  declare class DOMSerializer {
    /**
    The node serialization functions.
    */
    readonly nodes: {
      [node: string]: (node: Node$1) => DOMOutputSpec;
    };
    /**
    The mark serialization functions.
    */
    readonly marks: {
      [mark: string]: (mark: Mark, inline: boolean) => DOMOutputSpec;
    };
    /**
    Create a serializer. `nodes` should map node names to functions
    that take a node and return a description of the corresponding
    DOM. `marks` does the same for mark names, but also gets an
    argument that tells it whether the mark's content is block or
    inline content (for typical use, it'll always be inline). A mark
    serializer may be `null` to indicate that marks of that type
    should not be serialized.
    */
    constructor(
      /**
    The node serialization functions.
    */
      nodes: {
        [node: string]: (node: Node$1) => DOMOutputSpec;
      },
      /**
    The mark serialization functions.
    */
      marks: {
        [mark: string]: (mark: Mark, inline: boolean) => DOMOutputSpec;
      },
    );
    /**
    Serialize the content of this fragment to a DOM fragment. When
    not in the browser, the `document` option, containing a DOM
    document, should be passed so that the serializer can create
    nodes.
    */
    serializeFragment(
      fragment: Fragment,
      options?: {
        document?: Document;
      },
      target?: HTMLElement | DocumentFragment,
    ): HTMLElement | DocumentFragment;
    /**
    Serialize this node to a DOM node. This can be useful when you
    need to serialize a part of a document, as opposed to the whole
    document. To serialize a whole document, use
    [`serializeFragment`](https://prosemirror.net/docs/ref/#model.DOMSerializer.serializeFragment) on
    its [content](https://prosemirror.net/docs/ref/#model.Node.content).
    */
    serializeNode(
      node: Node$1,
      options?: {
        document?: Document;
      },
    ): globalThis.Node;
    /**
    Render an [output spec](https://prosemirror.net/docs/ref/#model.DOMOutputSpec) to a DOM node. If
    the spec has a hole (zero) in it, `contentDOM` will point at the
    node with the hole.
    */
    static renderSpec(
      doc: Document,
      structure: DOMOutputSpec,
      xmlNS?: string | null,
    ): {
      dom: DOMNode$1;
      contentDOM?: HTMLElement;
    };
    /**
    Build a serializer using the [`toDOM`](https://prosemirror.net/docs/ref/#model.NodeSpec.toDOM)
    properties in a schema's node and mark specs.
    */
    static fromSchema(schema: Schema): DOMSerializer;
    /**
    Gather the serializers in a schema's node specs into an object.
    This can be useful as a base to build a custom serializer from.
    */
    static nodesFromSchema(schema: Schema): {
      [node: string]: (node: Node$1) => DOMOutputSpec;
    };
    /**
    Gather the serializers in a schema's mark specs into an object.
    */
    static marksFromSchema(schema: Schema): {
      [mark: string]: (mark: Mark, inline: boolean) => DOMOutputSpec;
    };
  }

  /**
You can [_resolve_](https://prosemirror.net/docs/ref/#model.Node.resolve) a position to get more
information about it. Objects of this class represent such a
resolved position, providing various pieces of context
information, and some helper methods.

Throughout this interface, methods that take an optional `depth`
parameter will interpret undefined as `this.depth` and negative
numbers as `this.depth + value`.
*/
  declare class ResolvedPos {
    /**
    The position that was resolved.
    */
    readonly pos: number;
    /**
    The offset this position has into its parent node.
    */
    readonly parentOffset: number;
    /**
    The number of levels the parent node is from the root. If this
    position points directly into the root node, it is 0. If it
    points into a top-level paragraph, 1, and so on.
    */
    depth: number;
    /**
    The parent node that the position points into. Note that even if
    a position points into a text node, that node is not considered
    the parent—text nodes are ‘flat’ in this model, and have no content.
    */
    get parent(): Node$1;
    /**
    The root node in which the position was resolved.
    */
    get doc(): Node$1;
    /**
    The ancestor node at the given level. `p.node(p.depth)` is the
    same as `p.parent`.
    */
    node(depth?: number | null): Node$1;
    /**
    The index into the ancestor at the given level. If this points
    at the 3rd node in the 2nd paragraph on the top level, for
    example, `p.index(0)` is 1 and `p.index(1)` is 2.
    */
    index(depth?: number | null): number;
    /**
    The index pointing after this position into the ancestor at the
    given level.
    */
    indexAfter(depth?: number | null): number;
    /**
    The (absolute) position at the start of the node at the given
    level.
    */
    start(depth?: number | null): number;
    /**
    The (absolute) position at the end of the node at the given
    level.
    */
    end(depth?: number | null): number;
    /**
    The (absolute) position directly before the wrapping node at the
    given level, or, when `depth` is `this.depth + 1`, the original
    position.
    */
    before(depth?: number | null): number;
    /**
    The (absolute) position directly after the wrapping node at the
    given level, or the original position when `depth` is `this.depth + 1`.
    */
    after(depth?: number | null): number;
    /**
    When this position points into a text node, this returns the
    distance between the position and the start of the text node.
    Will be zero for positions that point between nodes.
    */
    get textOffset(): number;
    /**
    Get the node directly after the position, if any. If the position
    points into a text node, only the part of that node after the
    position is returned.
    */
    get nodeAfter(): Node$1 | null;
    /**
    Get the node directly before the position, if any. If the
    position points into a text node, only the part of that node
    before the position is returned.
    */
    get nodeBefore(): Node$1 | null;
    /**
    Get the position at the given index in the parent node at the
    given depth (which defaults to `this.depth`).
    */
    posAtIndex(index: number, depth?: number | null): number;
    /**
    Get the marks at this position, factoring in the surrounding
    marks' [`inclusive`](https://prosemirror.net/docs/ref/#model.MarkSpec.inclusive) property. If the
    position is at the start of a non-empty node, the marks of the
    node after it (if any) are returned.
    */
    marks(): readonly Mark[];
    /**
    Get the marks after the current position, if any, except those
    that are non-inclusive and not present at position `$end`. This
    is mostly useful for getting the set of marks to preserve after a
    deletion. Will return `null` if this position is at the end of
    its parent node or its parent node isn't a textblock (in which
    case no marks should be preserved).
    */
    marksAcross($end: ResolvedPos): readonly Mark[] | null;
    /**
    The depth up to which this position and the given (non-resolved)
    position share the same parent nodes.
    */
    sharedDepth(pos: number): number;
    /**
    Returns a range based on the place where this position and the
    given position diverge around block content. If both point into
    the same textblock, for example, a range around that textblock
    will be returned. If they point into different blocks, the range
    around those blocks in their shared ancestor is returned. You can
    pass in an optional predicate that will be called with a parent
    node to see if a range into that parent is acceptable.
    */
    blockRange(
      other?: ResolvedPos,
      pred?: (node: Node$1) => boolean,
    ): NodeRange | null;
    /**
    Query whether the given position shares the same parent node.
    */
    sameParent(other: ResolvedPos): boolean;
    /**
    Return the greater of this and the given position.
    */
    max(other: ResolvedPos): ResolvedPos;
    /**
    Return the smaller of this and the given position.
    */
    min(other: ResolvedPos): ResolvedPos;
  }
  /**
Represents a flat range of content, i.e. one that starts and
ends in the same node.
*/
  declare class NodeRange {
    /**
    A resolved position along the start of the content. May have a
    `depth` greater than this object's `depth` property, since
    these are the positions that were used to compute the range,
    not re-resolved positions directly at its boundaries.
    */
    readonly $from: ResolvedPos;
    /**
    A position along the end of the content. See
    caveat for [`$from`](https://prosemirror.net/docs/ref/#model.NodeRange.$from).
    */
    readonly $to: ResolvedPos;
    /**
    The depth of the node that this range points into.
    */
    readonly depth: number;
    /**
    Construct a node range. `$from` and `$to` should point into the
    same node until at least the given `depth`, since a node range
    denotes an adjacent set of nodes in a single parent node.
    */
    constructor(
      /**
    A resolved position along the start of the content. May have a
    `depth` greater than this object's `depth` property, since
    these are the positions that were used to compute the range,
    not re-resolved positions directly at its boundaries.
    */
      $from: ResolvedPos,
      /**
    A position along the end of the content. See
    caveat for [`$from`](https://prosemirror.net/docs/ref/#model.NodeRange.$from).
    */
      $to: ResolvedPos,
      /**
    The depth of the node that this range points into.
    */
      depth: number,
    );
    /**
    The position at the start of the range.
    */
    get start(): number;
    /**
    The position at the end of the range.
    */
    get end(): number;
    /**
    The parent node that the range points into.
    */
    get parent(): Node$1;
    /**
    The start index of the range in the parent node.
    */
    get startIndex(): number;
    /**
    The end index of the range in the parent node.
    */
    get endIndex(): number;
  }

  /**
Error type raised by [`Node.replace`](https://prosemirror.net/docs/ref/#model.Node.replace) when
given an invalid replacement.
*/
  declare class ReplaceError extends Error {}
  /**
A slice represents a piece cut out of a larger document. It
stores not only a fragment, but also the depth up to which nodes on
both side are ‘open’ (cut through).
*/
  declare class Slice {
    /**
    The slice's content.
    */
    readonly content: Fragment;
    /**
    The open depth at the start of the fragment.
    */
    readonly openStart: number;
    /**
    The open depth at the end.
    */
    readonly openEnd: number;
    /**
    Create a slice. When specifying a non-zero open depth, you must
    make sure that there are nodes of at least that depth at the
    appropriate side of the fragment—i.e. if the fragment is an
    empty paragraph node, `openStart` and `openEnd` can't be greater
    than 1.
    
    It is not necessary for the content of open nodes to conform to
    the schema's content constraints, though it should be a valid
    start/end/middle for such a node, depending on which sides are
    open.
    */
    constructor(
      /**
    The slice's content.
    */
      content: Fragment,
      /**
    The open depth at the start of the fragment.
    */
      openStart: number,
      /**
    The open depth at the end.
    */
      openEnd: number,
    );
    /**
    The size this slice would add when inserted into a document.
    */
    get size(): number;
    /**
    Tests whether this slice is equal to another slice.
    */
    eq(other: Slice): boolean;
    /**
    Convert a slice to a JSON-serializable representation.
    */
    toJSON(): any;
    /**
    Deserialize a slice from its JSON representation.
    */
    static fromJSON(schema: Schema, json: any): Slice;
    /**
    Create a slice from a fragment by taking the maximum possible
    open value on both side of the fragment.
    */
    static maxOpen(fragment: Fragment, openIsolating?: boolean): Slice;
    /**
    The empty slice.
    */
    static empty: Slice;
  }

  /**
These are the options recognized by the
[`parse`](https://prosemirror.net/docs/ref/#model.DOMParser.parse) and
[`parseSlice`](https://prosemirror.net/docs/ref/#model.DOMParser.parseSlice) methods.
*/
  interface ParseOptions {
    /**
    By default, whitespace is collapsed as per HTML's rules. Pass
    `true` to preserve whitespace, but normalize newlines to
    spaces or, if available, [line break replacements](https://prosemirror.net/docs/ref/#model.NodeSpec.linebreakReplacement),
    and `"full"` to preserve whitespace entirely.
    */
    preserveWhitespace?: boolean | "full";
    /**
    When given, the parser will, beside parsing the content,
    record the document positions of the given DOM positions. It
    will do so by writing to the objects, adding a `pos` property
    that holds the document position. DOM positions that are not
    in the parsed content will not be written to.
    */
    findPositions?: {
      node: DOMNode$1;
      offset: number;
      pos?: number;
    }[];
    /**
    The child node index to start parsing from.
    */
    from?: number;
    /**
    The child node index to stop parsing at.
    */
    to?: number;
    /**
    By default, the content is parsed into the schema's default
    [top node type](https://prosemirror.net/docs/ref/#model.Schema.topNodeType). You can pass this
    option to use the type and attributes from a different node
    as the top container.
    */
    topNode?: Node$1;
    /**
    Provide the starting content match that content parsed into the
    top node is matched against.
    */
    topMatch?: ContentMatch;
    /**
    A set of additional nodes to count as
    [context](https://prosemirror.net/docs/ref/#model.GenericParseRule.context) when parsing, above the
    given [top node](https://prosemirror.net/docs/ref/#model.ParseOptions.topNode).
    */
    context?: ResolvedPos;
  }
  /**
Fields that may be present in both [tag](https://prosemirror.net/docs/ref/#model.TagParseRule) and
[style](https://prosemirror.net/docs/ref/#model.StyleParseRule) parse rules.
*/
  interface GenericParseRule {
    /**
    Can be used to change the order in which the parse rules in a
    schema are tried. Those with higher priority come first. Rules
    without a priority are counted as having priority 50. This
    property is only meaningful in a schema—when directly
    constructing a parser, the order of the rule array is used.
    */
    priority?: number;
    /**
    By default, when a rule matches an element or style, no further
    rules get a chance to match it. By setting this to `false`, you
    indicate that even when this rule matches, other rules that come
    after it should also run.
    */
    consuming?: boolean;
    /**
    When given, restricts this rule to only match when the current
    context—the parent nodes into which the content is being
    parsed—matches this expression. Should contain one or more node
    names or node group names followed by single or double slashes.
    For example `"paragraph/"` means the rule only matches when the
    parent node is a paragraph, `"blockquote/paragraph/"` restricts
    it to be in a paragraph that is inside a blockquote, and
    `"section//"` matches any position inside a section—a double
    slash matches any sequence of ancestor nodes. To allow multiple
    different contexts, they can be separated by a pipe (`|`)
    character, as in `"blockquote/|list_item/"`.
    */
    context?: string;
    /**
    The name of the mark type to wrap the matched content in.
    */
    mark?: string;
    /**
    When true, ignore content that matches this rule.
    */
    ignore?: boolean;
    /**
    When true, finding an element that matches this rule will close
    the current node.
    */
    closeParent?: boolean;
    /**
    When true, ignore the node that matches this rule, but do parse
    its content.
    */
    skip?: boolean;
    /**
    Attributes for the node or mark created by this rule. When
    `getAttrs` is provided, it takes precedence.
    */
    attrs?: Attrs;
  }
  /**
Parse rule targeting a DOM element.
*/
  interface TagParseRule extends GenericParseRule {
    /**
    A CSS selector describing the kind of DOM elements to match.
    */
    tag: string;
    /**
    The namespace to match. Nodes are only matched when the
    namespace matches or this property is null.
    */
    namespace?: string;
    /**
    The name of the node type to create when this rule matches. Each
    rule should have either a `node`, `mark`, or `ignore` property
    (except when it appears in a [node](https://prosemirror.net/docs/ref/#model.NodeSpec.parseDOM) or
    [mark spec](https://prosemirror.net/docs/ref/#model.MarkSpec.parseDOM), in which case the `node`
    or `mark` property will be derived from its position).
    */
    node?: string;
    /**
    A function used to compute the attributes for the node or mark
    created by this rule. Can also be used to describe further
    conditions the DOM element or style must match. When it returns
    `false`, the rule won't match. When it returns null or undefined,
    that is interpreted as an empty/default set of attributes.
    */
    getAttrs?: (node: HTMLElement) => Attrs | false | null;
    /**
    For rules that produce non-leaf nodes, by default the content of
    the DOM element is parsed as content of the node. If the child
    nodes are in a descendent node, this may be a CSS selector
    string that the parser must use to find the actual content
    element, or a function that returns the actual content element
    to the parser.
    */
    contentElement?:
      | string
      | HTMLElement
      | ((node: HTMLElement) => HTMLElement);
    /**
    Can be used to override the content of a matched node. When
    present, instead of parsing the node's child nodes, the result of
    this function is used.
    */
    getContent?: (node: DOMNode$1, schema: Schema) => Fragment;
    /**
    Controls whether whitespace should be preserved when parsing the
    content inside the matched element. `false` means whitespace may
    be collapsed, `true` means that whitespace should be preserved
    but newlines normalized to spaces, and `"full"` means that
    newlines should also be preserved.
    */
    preserveWhitespace?: boolean | "full";
  }
  /**
A parse rule targeting a style property.
*/
  interface StyleParseRule extends GenericParseRule {
    /**
    A CSS property name to match. This rule will match inline styles
    that list that property. May also have the form
    `"property=value"`, in which case the rule only matches if the
    property's value exactly matches the given value. (For more
    complicated filters, use [`getAttrs`](https://prosemirror.net/docs/ref/#model.StyleParseRule.getAttrs)
    and return false to indicate that the match failed.) Rules
    matching styles may only produce [marks](https://prosemirror.net/docs/ref/#model.GenericParseRule.mark),
    not nodes.
    */
    style: string;
    /**
    Given to make TS see ParseRule as a tagged union @hide
    */
    tag?: undefined;
    /**
    Style rules can remove marks from the set of active marks.
    */
    clearMark?: (mark: Mark) => boolean;
    /**
    A function used to compute the attributes for the node or mark
    created by this rule. Called with the style's value.
    */
    getAttrs?: (node: string) => Attrs | false | null;
  }
  /**
A value that describes how to parse a given DOM node or inline
style as a ProseMirror node or mark.
*/
  type ParseRule = TagParseRule | StyleParseRule;
  /**
A DOM parser represents a strategy for parsing DOM content into a
ProseMirror document conforming to a given schema. Its behavior is
defined by an array of [rules](https://prosemirror.net/docs/ref/#model.ParseRule).
*/
  declare class DOMParser {
    /**
    The schema into which the parser parses.
    */
    readonly schema: Schema;
    /**
    The set of [parse rules](https://prosemirror.net/docs/ref/#model.ParseRule) that the parser
    uses, in order of precedence.
    */
    readonly rules: readonly ParseRule[];
    /**
    Create a parser that targets the given schema, using the given
    parsing rules.
    */
    constructor(
      /**
    The schema into which the parser parses.
    */
      schema: Schema,
      /**
    The set of [parse rules](https://prosemirror.net/docs/ref/#model.ParseRule) that the parser
    uses, in order of precedence.
    */
      rules: readonly ParseRule[],
    );
    /**
    Parse a document from the content of a DOM node.
    */
    parse(dom: DOMNode$1, options?: ParseOptions): Node$1;
    /**
    Parses the content of the given DOM node, like
    [`parse`](https://prosemirror.net/docs/ref/#model.DOMParser.parse), and takes the same set of
    options. But unlike that method, which produces a whole node,
    this one returns a slice that is open at the sides, meaning that
    the schema constraints aren't applied to the start of nodes to
    the left of the input and the end of nodes at the end.
    */
    parseSlice(dom: DOMNode$1, options?: ParseOptions): Slice;
    /**
    Construct a DOM parser using the parsing rules listed in a
    schema's [node specs](https://prosemirror.net/docs/ref/#model.NodeSpec.parseDOM), reordered by
    [priority](https://prosemirror.net/docs/ref/#model.GenericParseRule.priority).
    */
    static fromSchema(schema: Schema): DOMParser;
  }

  /**
An object holding the attributes of a node.
*/
  type Attrs = {
    readonly [attr: string]: any;
  };
  /**
Node types are objects allocated once per `Schema` and used to
[tag](https://prosemirror.net/docs/ref/#model.Node.type) `Node` instances. They contain information
about the node type, such as its name and what kind of node it
represents.
*/
  declare class NodeType {
    /**
    The name the node type has in this schema.
    */
    readonly name: string;
    /**
    A link back to the `Schema` the node type belongs to.
    */
    readonly schema: Schema;
    /**
    The spec that this type is based on
    */
    readonly spec: NodeSpec;
    /**
    True if this node type has inline content.
    */
    inlineContent: boolean;
    /**
    True if this is a block type
    */
    isBlock: boolean;
    /**
    True if this is the text node type.
    */
    isText: boolean;
    /**
    True if this is an inline type.
    */
    get isInline(): boolean;
    /**
    True if this is a textblock type, a block that contains inline
    content.
    */
    get isTextblock(): boolean;
    /**
    True for node types that allow no content.
    */
    get isLeaf(): boolean;
    /**
    True when this node is an atom, i.e. when it does not have
    directly editable content.
    */
    get isAtom(): boolean;
    /**
    Return true when this node type is part of the given
    [group](https://prosemirror.net/docs/ref/#model.NodeSpec.group).
    */
    isInGroup(group: string): boolean;
    /**
    The starting match of the node type's content expression.
    */
    contentMatch: ContentMatch;
    /**
    The set of marks allowed in this node. `null` means all marks
    are allowed.
    */
    markSet: readonly MarkType[] | null;
    /**
    The node type's [whitespace](https://prosemirror.net/docs/ref/#model.NodeSpec.whitespace) option.
    */
    get whitespace(): "pre" | "normal";
    /**
    Tells you whether this node type has any required attributes.
    */
    hasRequiredAttrs(): boolean;
    /**
    Indicates whether this node allows some of the same content as
    the given node type.
    */
    compatibleContent(other: NodeType): boolean;
    /**
    Create a `Node` of this type. The given attributes are
    checked and defaulted (you can pass `null` to use the type's
    defaults entirely, if no required attributes exist). `content`
    may be a `Fragment`, a node, an array of nodes, or
    `null`. Similarly `marks` may be `null` to default to the empty
    set of marks.
    */
    create(
      attrs?: Attrs | null,
      content?: Fragment | Node$1 | readonly Node$1[] | null,
      marks?: readonly Mark[],
    ): Node$1;
    /**
    Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but check the given content
    against the node type's content restrictions, and throw an error
    if it doesn't match.
    */
    createChecked(
      attrs?: Attrs | null,
      content?: Fragment | Node$1 | readonly Node$1[] | null,
      marks?: readonly Mark[],
    ): Node$1;
    /**
    Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but see if it is
    necessary to add nodes to the start or end of the given fragment
    to make it fit the node. If no fitting wrapping can be found,
    return null. Note that, due to the fact that required nodes can
    always be created, this will always succeed if you pass null or
    `Fragment.empty` as content.
    */
    createAndFill(
      attrs?: Attrs | null,
      content?: Fragment | Node$1 | readonly Node$1[] | null,
      marks?: readonly Mark[],
    ): Node$1 | null;
    /**
    Returns true if the given fragment is valid content for this node
    type.
    */
    validContent(content: Fragment): boolean;
    /**
    Check whether the given mark type is allowed in this node.
    */
    allowsMarkType(markType: MarkType): boolean;
    /**
    Test whether the given set of marks are allowed in this node.
    */
    allowsMarks(marks: readonly Mark[]): boolean;
    /**
    Removes the marks that are not allowed in this node from the given set.
    */
    allowedMarks(marks: readonly Mark[]): readonly Mark[];
  }
  /**
Like nodes, marks (which are associated with nodes to signify
things like emphasis or being part of a link) are
[tagged](https://prosemirror.net/docs/ref/#model.Mark.type) with type objects, which are
instantiated once per `Schema`.
*/
  declare class MarkType {
    /**
    The name of the mark type.
    */
    readonly name: string;
    /**
    The schema that this mark type instance is part of.
    */
    readonly schema: Schema;
    /**
    The spec on which the type is based.
    */
    readonly spec: MarkSpec;
    /**
    Create a mark of this type. `attrs` may be `null` or an object
    containing only some of the mark's attributes. The others, if
    they have defaults, will be added.
    */
    create(attrs?: Attrs | null): Mark;
    /**
    When there is a mark of this type in the given set, a new set
    without it is returned. Otherwise, the input set is returned.
    */
    removeFromSet(set: readonly Mark[]): readonly Mark[];
    /**
    Tests whether there is a mark of this type in the given set.
    */
    isInSet(set: readonly Mark[]): Mark | undefined;
    /**
    Queries whether a given mark type is
    [excluded](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) by this one.
    */
    excludes(other: MarkType): boolean;
  }
  /**
An object describing a schema, as passed to the [`Schema`](https://prosemirror.net/docs/ref/#model.Schema)
constructor.
*/
  interface SchemaSpec<Nodes extends string = any, Marks extends string = any> {
    /**
    The node types in this schema. Maps names to
    [`NodeSpec`](https://prosemirror.net/docs/ref/#model.NodeSpec) objects that describe the node type
    associated with that name. Their order is significant—it
    determines which [parse rules](https://prosemirror.net/docs/ref/#model.NodeSpec.parseDOM) take
    precedence by default, and which nodes come first in a given
    [group](https://prosemirror.net/docs/ref/#model.NodeSpec.group).
    */
    nodes:
      | {
          [name in Nodes]: NodeSpec;
        }
      | OrderedMap<NodeSpec>;
    /**
    The mark types that exist in this schema. The order in which they
    are provided determines the order in which [mark
    sets](https://prosemirror.net/docs/ref/#model.Mark.addToSet) are sorted and in which [parse
    rules](https://prosemirror.net/docs/ref/#model.MarkSpec.parseDOM) are tried.
    */
    marks?:
      | {
          [name in Marks]: MarkSpec;
        }
      | OrderedMap<MarkSpec>;
    /**
    The name of the default top-level node for the schema. Defaults
    to `"doc"`.
    */
    topNode?: string;
  }
  /**
A description of a node type, used when defining a schema.
*/
  interface NodeSpec {
    /**
    The content expression for this node, as described in the [schema
    guide](https://prosemirror.net/docs/guide/#schema.content_expressions). When not given,
    the node does not allow any content.
    */
    content?: string;
    /**
    The marks that are allowed inside of this node. May be a
    space-separated string referring to mark names or groups, `"_"`
    to explicitly allow all marks, or `""` to disallow marks. When
    not given, nodes with inline content default to allowing all
    marks, other nodes default to not allowing marks.
    */
    marks?: string;
    /**
    The group or space-separated groups to which this node belongs,
    which can be referred to in the content expressions for the
    schema.
    */
    group?: string;
    /**
    Should be set to true for inline nodes. (Implied for text nodes.)
    */
    inline?: boolean;
    /**
    Can be set to true to indicate that, though this isn't a [leaf
    node](https://prosemirror.net/docs/ref/#model.NodeType.isLeaf), it doesn't have directly editable
    content and should be treated as a single unit in the view.
    */
    atom?: boolean;
    /**
    The attributes that nodes of this type get.
    */
    attrs?: {
      [name: string]: AttributeSpec;
    };
    /**
    Controls whether nodes of this type can be selected as a [node
    selection](https://prosemirror.net/docs/ref/#state.NodeSelection). Defaults to true for non-text
    nodes.
    */
    selectable?: boolean;
    /**
    Determines whether nodes of this type can be dragged without
    being selected. Defaults to false.
    */
    draggable?: boolean;
    /**
    Can be used to indicate that this node contains code, which
    causes some commands to behave differently.
    */
    code?: boolean;
    /**
    Controls way whitespace in this a node is parsed. The default is
    `"normal"`, which causes the [DOM parser](https://prosemirror.net/docs/ref/#model.DOMParser) to
    collapse whitespace in normal mode, and normalize it (replacing
    newlines and such with spaces) otherwise. `"pre"` causes the
    parser to preserve spaces inside the node. When this option isn't
    given, but [`code`](https://prosemirror.net/docs/ref/#model.NodeSpec.code) is true, `whitespace`
    will default to `"pre"`. Note that this option doesn't influence
    the way the node is rendered—that should be handled by `toDOM`
    and/or styling.
    */
    whitespace?: "pre" | "normal";
    /**
    Determines whether this node is considered an important parent
    node during replace operations (such as paste). Non-defining (the
    default) nodes get dropped when their entire content is replaced,
    whereas defining nodes persist and wrap the inserted content.
    */
    definingAsContext?: boolean;
    /**
    In inserted content the defining parents of the content are
    preserved when possible. Typically, non-default-paragraph
    textblock types, and possibly list items, are marked as defining.
    */
    definingForContent?: boolean;
    /**
    When enabled, enables both
    [`definingAsContext`](https://prosemirror.net/docs/ref/#model.NodeSpec.definingAsContext) and
    [`definingForContent`](https://prosemirror.net/docs/ref/#model.NodeSpec.definingForContent).
    */
    defining?: boolean;
    /**
    When enabled (default is false), the sides of nodes of this type
    count as boundaries that regular editing operations, like
    backspacing or lifting, won't cross. An example of a node that
    should probably have this enabled is a table cell.
    */
    isolating?: boolean;
    /**
    Defines the default way a node of this type should be serialized
    to DOM/HTML (as used by
    [`DOMSerializer.fromSchema`](https://prosemirror.net/docs/ref/#model.DOMSerializer^fromSchema)).
    Should return a DOM node or an [array
    structure](https://prosemirror.net/docs/ref/#model.DOMOutputSpec) that describes one, with an
    optional number zero (“hole”) in it to indicate where the node's
    content should be inserted.
    
    For text nodes, the default is to create a text DOM node. Though
    it is possible to create a serializer where text is rendered
    differently, this is not supported inside the editor, so you
    shouldn't override that in your text node spec.
    */
    toDOM?: (node: Node$1) => DOMOutputSpec;
    /**
    Associates DOM parser information with this node, which can be
    used by [`DOMParser.fromSchema`](https://prosemirror.net/docs/ref/#model.DOMParser^fromSchema) to
    automatically derive a parser. The `node` field in the rules is
    implied (the name of this node will be filled in automatically).
    If you supply your own parser, you do not need to also specify
    parsing rules in your schema.
    */
    parseDOM?: readonly TagParseRule[];
    /**
    Defines the default way a node of this type should be serialized
    to a string representation for debugging (e.g. in error messages).
    */
    toDebugString?: (node: Node$1) => string;
    /**
    Defines the default way a [leaf node](https://prosemirror.net/docs/ref/#model.NodeType.isLeaf) of
    this type should be serialized to a string (as used by
    [`Node.textBetween`](https://prosemirror.net/docs/ref/#model.Node.textBetween) and
    [`Node.textContent`](https://prosemirror.net/docs/ref/#model.Node.textContent)).
    */
    leafText?: (node: Node$1) => string;
    /**
    A single inline node in a schema can be set to be a linebreak
    equivalent. When converting between block types that support the
    node and block types that don't but have
    [`whitespace`](https://prosemirror.net/docs/ref/#model.NodeSpec.whitespace) set to `"pre"`,
    [`setBlockType`](https://prosemirror.net/docs/ref/#transform.Transform.setBlockType) will convert
    between newline characters to or from linebreak nodes as
    appropriate.
    */
    linebreakReplacement?: boolean;
    /**
    Node specs may include arbitrary properties that can be read by
    other code via [`NodeType.spec`](https://prosemirror.net/docs/ref/#model.NodeType.spec).
    */
    [key: string]: any;
  }
  /**
Used to define marks when creating a schema.
*/
  interface MarkSpec {
    /**
    The attributes that marks of this type get.
    */
    attrs?: {
      [name: string]: AttributeSpec;
    };
    /**
    Whether this mark should be active when the cursor is positioned
    at its end (or at its start when that is also the start of the
    parent node). Defaults to true.
    */
    inclusive?: boolean;
    /**
    Determines which other marks this mark can coexist with. Should
    be a space-separated strings naming other marks or groups of marks.
    When a mark is [added](https://prosemirror.net/docs/ref/#model.Mark.addToSet) to a set, all marks
    that it excludes are removed in the process. If the set contains
    any mark that excludes the new mark but is not, itself, excluded
    by the new mark, the mark can not be added an the set. You can
    use the value `"_"` to indicate that the mark excludes all
    marks in the schema.
    
    Defaults to only being exclusive with marks of the same type. You
    can set it to an empty string (or any string not containing the
    mark's own name) to allow multiple marks of a given type to
    coexist (as long as they have different attributes).
    */
    excludes?: string;
    /**
    The group or space-separated groups to which this mark belongs.
    */
    group?: string;
    /**
    Determines whether marks of this type can span multiple adjacent
    nodes when serialized to DOM/HTML. Defaults to true.
    */
    spanning?: boolean;
    /**
    Marks the content of this span as being code, which causes some
    commands and extensions to treat it differently.
    */
    code?: boolean;
    /**
    Defines the default way marks of this type should be serialized
    to DOM/HTML. When the resulting spec contains a hole, that is
    where the marked content is placed. Otherwise, it is appended to
    the top node.
    */
    toDOM?: (mark: Mark, inline: boolean) => DOMOutputSpec;
    /**
    Associates DOM parser information with this mark (see the
    corresponding [node spec field](https://prosemirror.net/docs/ref/#model.NodeSpec.parseDOM)). The
    `mark` field in the rules is implied.
    */
    parseDOM?: readonly ParseRule[];
    /**
    Mark specs can include additional properties that can be
    inspected through [`MarkType.spec`](https://prosemirror.net/docs/ref/#model.MarkType.spec) when
    working with the mark.
    */
    [key: string]: any;
  }
  /**
Used to [define](https://prosemirror.net/docs/ref/#model.NodeSpec.attrs) attributes on nodes or
marks.
*/
  interface AttributeSpec {
    /**
    The default value for this attribute, to use when no explicit
    value is provided. Attributes that have no default must be
    provided whenever a node or mark of a type that has them is
    created.
    */
    default?: any;
    /**
    A function or type name used to validate values of this
    attribute. This will be used when deserializing the attribute
    from JSON, and when running [`Node.check`](https://prosemirror.net/docs/ref/#model.Node.check).
    When a function, it should raise an exception if the value isn't
    of the expected type or shape. When a string, it should be a
    `|`-separated string of primitive types (`"number"`, `"string"`,
    `"boolean"`, `"null"`, and `"undefined"`), and the library will
    raise an error when the value is not one of those types.
    */
    validate?: string | ((value: any) => void);
  }
  /**
A document schema. Holds [node](https://prosemirror.net/docs/ref/#model.NodeType) and [mark
type](https://prosemirror.net/docs/ref/#model.MarkType) objects for the nodes and marks that may
occur in conforming documents, and provides functionality for
creating and deserializing such documents.

When given, the type parameters provide the names of the nodes and
marks in this schema.
*/
  declare class Schema<Nodes extends string = any, Marks extends string = any> {
    /**
    The [spec](https://prosemirror.net/docs/ref/#model.SchemaSpec) on which the schema is based,
    with the added guarantee that its `nodes` and `marks`
    properties are
    [`OrderedMap`](https://github.com/marijnh/orderedmap) instances
    (not raw objects).
    */
    spec: {
      nodes: OrderedMap<NodeSpec>;
      marks: OrderedMap<MarkSpec>;
      topNode?: string;
    };
    /**
    An object mapping the schema's node names to node type objects.
    */
    nodes: {
      readonly [name in Nodes]: NodeType;
    } & {
      readonly [key: string]: NodeType;
    };
    /**
    A map from mark names to mark type objects.
    */
    marks: {
      readonly [name in Marks]: MarkType;
    } & {
      readonly [key: string]: MarkType;
    };
    /**
    The [linebreak
    replacement](https://prosemirror.net/docs/ref/#model.NodeSpec.linebreakReplacement) node defined
    in this schema, if any.
    */
    linebreakReplacement: NodeType | null;
    /**
    Construct a schema from a schema [specification](https://prosemirror.net/docs/ref/#model.SchemaSpec).
    */
    constructor(spec: SchemaSpec<Nodes, Marks>);
    /**
    The type of the [default top node](https://prosemirror.net/docs/ref/#model.SchemaSpec.topNode)
    for this schema.
    */
    topNodeType: NodeType;
    /**
    An object for storing whatever values modules may want to
    compute and cache per schema. (If you want to store something
    in it, try to use property names unlikely to clash.)
    */
    cached: {
      [key: string]: any;
    };
    /**
    Create a node in this schema. The `type` may be a string or a
    `NodeType` instance. Attributes will be extended with defaults,
    `content` may be a `Fragment`, `null`, a `Node`, or an array of
    nodes.
    */
    node(
      type: string | NodeType,
      attrs?: Attrs | null,
      content?: Fragment | Node$1 | readonly Node$1[],
      marks?: readonly Mark[],
    ): Node$1;
    /**
    Create a text node in the schema. Empty text nodes are not
    allowed.
    */
    text(text: string, marks?: readonly Mark[] | null): Node$1;
    /**
    Create a mark with the given type and attributes.
    */
    mark(type: string | MarkType, attrs?: Attrs | null): Mark;
    /**
    Deserialize a node from its JSON representation. This method is
    bound.
    */
    nodeFromJSON: (json: any) => Node$1;
    /**
    Deserialize a mark from its JSON representation. This method is
    bound.
    */
    markFromJSON: (json: any) => Mark;
  }

  /**
A fragment represents a node's collection of child nodes.

Like nodes, fragments are persistent data structures, and you
should not mutate them or their content. Rather, you create new
instances whenever needed. The API tries to make this easy.
*/
  declare class Fragment {
    /**
    The child nodes in this fragment.
    */
    readonly content: readonly Node$1[];
    /**
    The size of the fragment, which is the total of the size of
    its content nodes.
    */
    readonly size: number;
    /**
    Invoke a callback for all descendant nodes between the given two
    positions (relative to start of this fragment). Doesn't descend
    into a node when the callback returns `false`.
    */
    nodesBetween(
      from: number,
      to: number,
      f: (
        node: Node$1,
        start: number,
        parent: Node$1 | null,
        index: number,
      ) => boolean | void,
      nodeStart?: number,
      parent?: Node$1,
    ): void;
    /**
    Call the given callback for every descendant node. `pos` will be
    relative to the start of the fragment. The callback may return
    `false` to prevent traversal of a given node's children.
    */
    descendants(
      f: (
        node: Node$1,
        pos: number,
        parent: Node$1 | null,
        index: number,
      ) => boolean | void,
    ): void;
    /**
    Extract the text between `from` and `to`. See the same method on
    [`Node`](https://prosemirror.net/docs/ref/#model.Node.textBetween).
    */
    textBetween(
      from: number,
      to: number,
      blockSeparator?: string | null,
      leafText?: string | null | ((leafNode: Node$1) => string),
    ): string;
    /**
    Create a new fragment containing the combined content of this
    fragment and the other.
    */
    append(other: Fragment): Fragment;
    /**
    Cut out the sub-fragment between the two given positions.
    */
    cut(from: number, to?: number): Fragment;
    /**
    Create a new fragment in which the node at the given index is
    replaced by the given node.
    */
    replaceChild(index: number, node: Node$1): Fragment;
    /**
    Create a new fragment by prepending the given node to this
    fragment.
    */
    addToStart(node: Node$1): Fragment;
    /**
    Create a new fragment by appending the given node to this
    fragment.
    */
    addToEnd(node: Node$1): Fragment;
    /**
    Compare this fragment to another one.
    */
    eq(other: Fragment): boolean;
    /**
    The first child of the fragment, or `null` if it is empty.
    */
    get firstChild(): Node$1 | null;
    /**
    The last child of the fragment, or `null` if it is empty.
    */
    get lastChild(): Node$1 | null;
    /**
    The number of child nodes in this fragment.
    */
    get childCount(): number;
    /**
    Get the child node at the given index. Raise an error when the
    index is out of range.
    */
    child(index: number): Node$1;
    /**
    Get the child node at the given index, if it exists.
    */
    maybeChild(index: number): Node$1 | null;
    /**
    Call `f` for every child node, passing the node, its offset
    into this parent node, and its index.
    */
    forEach(f: (node: Node$1, offset: number, index: number) => void): void;
    /**
    Find the first position at which this fragment and another
    fragment differ, or `null` if they are the same.
    */
    findDiffStart(other: Fragment, pos?: number): number | null;
    /**
    Find the first position, searching from the end, at which this
    fragment and the given fragment differ, or `null` if they are
    the same. Since this position will not be the same in both
    nodes, an object with two separate positions is returned.
    */
    findDiffEnd(
      other: Fragment,
      pos?: number,
      otherPos?: number,
    ): {
      a: number;
      b: number;
    } | null;
    /**
    Return a debugging string that describes this fragment.
    */
    toString(): string;
    /**
    Create a JSON-serializeable representation of this fragment.
    */
    toJSON(): any;
    /**
    Deserialize a fragment from its JSON representation.
    */
    static fromJSON(schema: Schema, value: any): Fragment;
    /**
    Build a fragment from an array of nodes. Ensures that adjacent
    text nodes with the same marks are joined together.
    */
    static fromArray(array: readonly Node$1[]): Fragment;
    /**
    Create a fragment from something that can be interpreted as a
    set of nodes. For `null`, it returns the empty fragment. For a
    fragment, the fragment itself. For a node or array of nodes, a
    fragment containing those nodes.
    */
    static from(nodes?: Fragment | Node$1 | readonly Node$1[] | null): Fragment;
    /**
    An empty fragment. Intended to be reused whenever a node doesn't
    contain anything (rather than allocating a new empty fragment for
    each leaf node).
    */
    static empty: Fragment;
  }

  type MatchEdge = {
    type: NodeType;
    next: ContentMatch;
  };
  /**
Instances of this class represent a match state of a node type's
[content expression](https://prosemirror.net/docs/ref/#model.NodeSpec.content), and can be used to
find out whether further content matches here, and whether a given
position is a valid end of the node.
*/
  declare class ContentMatch {
    /**
    True when this match state represents a valid end of the node.
    */
    readonly validEnd: boolean;
    /**
    Match a node type, returning a match after that node if
    successful.
    */
    matchType(type: NodeType): ContentMatch | null;
    /**
    Try to match a fragment. Returns the resulting match when
    successful.
    */
    matchFragment(
      frag: Fragment,
      start?: number,
      end?: number,
    ): ContentMatch | null;
    /**
    Get the first matching node type at this match position that can
    be generated.
    */
    get defaultType(): NodeType | null;
    /**
    Try to match the given fragment, and if that fails, see if it can
    be made to match by inserting nodes in front of it. When
    successful, return a fragment of inserted nodes (which may be
    empty if nothing had to be inserted). When `toEnd` is true, only
    return a fragment if the resulting match goes to the end of the
    content expression.
    */
    fillBefore(
      after: Fragment,
      toEnd?: boolean,
      startIndex?: number,
    ): Fragment | null;
    /**
    Find a set of wrapping node types that would allow a node of the
    given type to appear at this position. The result may be empty
    (when it fits directly) and will be null when no such wrapping
    exists.
    */
    findWrapping(target: NodeType): readonly NodeType[] | null;
    /**
    The number of outgoing edges this node has in the finite
    automaton that describes the content expression.
    */
    get edgeCount(): number;
    /**
    Get the _n_​th outgoing edge from this node in the finite
    automaton that describes the content expression.
    */
    edge(n: number): MatchEdge;
  }

  /**
This class represents a node in the tree that makes up a
ProseMirror document. So a document is an instance of `Node`, with
children that are also instances of `Node`.

Nodes are persistent data structures. Instead of changing them, you
create new ones with the content you want. Old ones keep pointing
at the old document shape. This is made cheaper by sharing
structure between the old and new data as much as possible, which a
tree shape like this (without back pointers) makes easy.

**Do not** directly mutate the properties of a `Node` object. See
[the guide](https://prosemirror.net/docs/guide/#doc) for more information.
*/
  declare class Node$1 {
    /**
    The type of node that this is.
    */
    readonly type: NodeType;
    /**
    An object mapping attribute names to values. The kind of
    attributes allowed and required are
    [determined](https://prosemirror.net/docs/ref/#model.NodeSpec.attrs) by the node type.
    */
    readonly attrs: Attrs;
    /**
    The marks (things like whether it is emphasized or part of a
    link) applied to this node.
    */
    readonly marks: readonly Mark[];
    /**
    A container holding the node's children.
    */
    readonly content: Fragment;
    /**
    The array of this node's child nodes.
    */
    get children(): readonly Node$1[];
    /**
    For text nodes, this contains the node's text content.
    */
    readonly text: string | undefined;
    /**
    The size of this node, as defined by the integer-based [indexing
    scheme](https://prosemirror.net/docs/guide/#doc.indexing). For text nodes, this is the
    amount of characters. For other leaf nodes, it is one. For
    non-leaf nodes, it is the size of the content plus two (the
    start and end token).
    */
    get nodeSize(): number;
    /**
    The number of children that the node has.
    */
    get childCount(): number;
    /**
    Get the child node at the given index. Raises an error when the
    index is out of range.
    */
    child(index: number): Node$1;
    /**
    Get the child node at the given index, if it exists.
    */
    maybeChild(index: number): Node$1 | null;
    /**
    Call `f` for every child node, passing the node, its offset
    into this parent node, and its index.
    */
    forEach(f: (node: Node$1, offset: number, index: number) => void): void;
    /**
    Invoke a callback for all descendant nodes recursively between
    the given two positions that are relative to start of this
    node's content. The callback is invoked with the node, its
    position relative to the original node (method receiver),
    its parent node, and its child index. When the callback returns
    false for a given node, that node's children will not be
    recursed over. The last parameter can be used to specify a
    starting position to count from.
    */
    nodesBetween(
      from: number,
      to: number,
      f: (
        node: Node$1,
        pos: number,
        parent: Node$1 | null,
        index: number,
      ) => void | boolean,
      startPos?: number,
    ): void;
    /**
    Call the given callback for every descendant node. Doesn't
    descend into a node when the callback returns `false`.
    */
    descendants(
      f: (
        node: Node$1,
        pos: number,
        parent: Node$1 | null,
        index: number,
      ) => void | boolean,
    ): void;
    /**
    Concatenates all the text nodes found in this fragment and its
    children.
    */
    get textContent(): string;
    /**
    Get all text between positions `from` and `to`. When
    `blockSeparator` is given, it will be inserted to separate text
    from different block nodes. If `leafText` is given, it'll be
    inserted for every non-text leaf node encountered, otherwise
    [`leafText`](https://prosemirror.net/docs/ref/#model.NodeSpec.leafText) will be used.
    */
    textBetween(
      from: number,
      to: number,
      blockSeparator?: string | null,
      leafText?: null | string | ((leafNode: Node$1) => string),
    ): string;
    /**
    Returns this node's first child, or `null` if there are no
    children.
    */
    get firstChild(): Node$1 | null;
    /**
    Returns this node's last child, or `null` if there are no
    children.
    */
    get lastChild(): Node$1 | null;
    /**
    Test whether two nodes represent the same piece of document.
    */
    eq(other: Node$1): boolean;
    /**
    Compare the markup (type, attributes, and marks) of this node to
    those of another. Returns `true` if both have the same markup.
    */
    sameMarkup(other: Node$1): boolean;
    /**
    Check whether this node's markup correspond to the given type,
    attributes, and marks.
    */
    hasMarkup(
      type: NodeType,
      attrs?: Attrs | null,
      marks?: readonly Mark[],
    ): boolean;
    /**
    Create a new node with the same markup as this node, containing
    the given content (or empty, if no content is given).
    */
    copy(content?: Fragment | null): Node$1;
    /**
    Create a copy of this node, with the given set of marks instead
    of the node's own marks.
    */
    mark(marks: readonly Mark[]): Node$1;
    /**
    Create a copy of this node with only the content between the
    given positions. If `to` is not given, it defaults to the end of
    the node.
    */
    cut(from: number, to?: number): Node$1;
    /**
    Cut out the part of the document between the given positions, and
    return it as a `Slice` object.
    */
    slice(from: number, to?: number, includeParents?: boolean): Slice;
    /**
    Replace the part of the document between the given positions with
    the given slice. The slice must 'fit', meaning its open sides
    must be able to connect to the surrounding content, and its
    content nodes must be valid children for the node they are placed
    into. If any of this is violated, an error of type
    [`ReplaceError`](https://prosemirror.net/docs/ref/#model.ReplaceError) is thrown.
    */
    replace(from: number, to: number, slice: Slice): Node$1;
    /**
    Find the node directly after the given position.
    */
    nodeAt(pos: number): Node$1 | null;
    /**
    Find the (direct) child node after the given offset, if any,
    and return it along with its index and offset relative to this
    node.
    */
    childAfter(pos: number): {
      node: Node$1 | null;
      index: number;
      offset: number;
    };
    /**
    Find the (direct) child node before the given offset, if any,
    and return it along with its index and offset relative to this
    node.
    */
    childBefore(pos: number): {
      node: Node$1 | null;
      index: number;
      offset: number;
    };
    /**
    Resolve the given position in the document, returning an
    [object](https://prosemirror.net/docs/ref/#model.ResolvedPos) with information about its context.
    */
    resolve(pos: number): ResolvedPos;
    /**
    Test whether a given mark or mark type occurs in this document
    between the two given positions.
    */
    rangeHasMark(from: number, to: number, type: Mark | MarkType): boolean;
    /**
    True when this is a block (non-inline node)
    */
    get isBlock(): boolean;
    /**
    True when this is a textblock node, a block node with inline
    content.
    */
    get isTextblock(): boolean;
    /**
    True when this node allows inline content.
    */
    get inlineContent(): boolean;
    /**
    True when this is an inline node (a text node or a node that can
    appear among text).
    */
    get isInline(): boolean;
    /**
    True when this is a text node.
    */
    get isText(): boolean;
    /**
    True when this is a leaf node.
    */
    get isLeaf(): boolean;
    /**
    True when this is an atom, i.e. when it does not have directly
    editable content. This is usually the same as `isLeaf`, but can
    be configured with the [`atom` property](https://prosemirror.net/docs/ref/#model.NodeSpec.atom)
    on a node's spec (typically used when the node is displayed as
    an uneditable [node view](https://prosemirror.net/docs/ref/#view.NodeView)).
    */
    get isAtom(): boolean;
    /**
    Return a string representation of this node for debugging
    purposes.
    */
    toString(): string;
    /**
    Get the content match in this node at the given index.
    */
    contentMatchAt(index: number): ContentMatch;
    /**
    Test whether replacing the range between `from` and `to` (by
    child index) with the given replacement fragment (which defaults
    to the empty fragment) would leave the node's content valid. You
    can optionally pass `start` and `end` indices into the
    replacement fragment.
    */
    canReplace(
      from: number,
      to: number,
      replacement?: Fragment,
      start?: number,
      end?: number,
    ): boolean;
    /**
    Test whether replacing the range `from` to `to` (by index) with
    a node of the given type would leave the node's content valid.
    */
    canReplaceWith(
      from: number,
      to: number,
      type: NodeType,
      marks?: readonly Mark[],
    ): boolean;
    /**
    Test whether the given node's content could be appended to this
    node. If that node is empty, this will only return true if there
    is at least one node type that can appear in both nodes (to avoid
    merging completely incompatible nodes).
    */
    canAppend(other: Node$1): boolean;
    /**
    Check whether this node and its descendants conform to the
    schema, and raise an exception when they do not.
    */
    check(): void;
    /**
    Return a JSON-serializeable representation of this node.
    */
    toJSON(): any;
    /**
    Deserialize a node from its JSON representation.
    */
    static fromJSON(schema: Schema, json: any): Node$1;
  }

  /**
[Specs](https://prosemirror.net/docs/ref/#model.NodeSpec) for the nodes defined in this schema.
*/
  declare const nodes: {
    /**
    NodeSpec The top level document node.
    */
    doc: NodeSpec;
    /**
    A plain paragraph textblock. Represented in the DOM
    as a `<p>` element.
    */
    paragraph: NodeSpec;
    /**
    A blockquote (`<blockquote>`) wrapping one or more blocks.
    */
    blockquote: NodeSpec;
    /**
    A horizontal rule (`<hr>`).
    */
    horizontal_rule: NodeSpec;
    /**
    A heading textblock, with a `level` attribute that
    should hold the number 1 to 6. Parsed and serialized as `<h1>` to
    `<h6>` elements.
    */
    heading: NodeSpec;
    /**
    A code listing. Disallows marks or non-text inline
    nodes by default. Represented as a `<pre>` element with a
    `<code>` element inside of it.
    */
    code_block: NodeSpec;
    /**
    The text node.
    */
    text: NodeSpec;
    /**
    An inline image (`<img>`) node. Supports `src`,
    `alt`, and `href` attributes. The latter two default to the empty
    string.
    */
    image: NodeSpec;
    /**
    A hard line break, represented in the DOM as `<br>`.
    */
    hard_break: NodeSpec;
  };
  /**
[Specs](https://prosemirror.net/docs/ref/#model.MarkSpec) for the marks in the schema.
*/
  declare const marks: {
    /**
    A link. Has `href` and `title` attributes. `title`
    defaults to the empty string. Rendered and parsed as an `<a>`
    element.
    */
    link: MarkSpec;
    /**
    An emphasis mark. Rendered as an `<em>` element. Has parse rules
    that also match `<i>` and `font-style: italic`.
    */
    em: MarkSpec;
    /**
    A strong mark. Rendered as `<strong>`, parse rules also match
    `<b>` and `font-weight: bold`.
    */
    strong: MarkSpec;
    /**
    Code font mark. Represented as a `<code>` element.
    */
    code: MarkSpec;
  };
  /**
This schema roughly corresponds to the document schema used by
[CommonMark](http://commonmark.org/), minus the list elements,
which are defined in the [`prosemirror-schema-list`](https://prosemirror.net/docs/ref/#schema-list)
module.

To reuse elements from this schema, extend or read from its
`spec.nodes` and `spec.marks` [properties](https://prosemirror.net/docs/ref/#model.Schema.spec).
*/
  declare const schema: Schema<
    | "blockquote"
    | "image"
    | "text"
    | "doc"
    | "paragraph"
    | "horizontal_rule"
    | "heading"
    | "code_block"
    | "hard_break",
    "link" | "code" | "em" | "strong"
  >;

  /**
There are several things that positions can be mapped through.
Such objects conform to this interface.
*/
  interface Mappable {
    /**
    Map a position through this object. When given, `assoc` (should
    be -1 or 1, defaults to 1) determines with which side the
    position is associated, which determines in which direction to
    move when a chunk of content is inserted at the mapped position.
    */
    map: (pos: number, assoc?: number) => number;
    /**
    Map a position, and return an object containing additional
    information about the mapping. The result's `deleted` field tells
    you whether the position was deleted (completely enclosed in a
    replaced range) during the mapping. When content on only one side
    is deleted, the position itself is only considered deleted when
    `assoc` points in the direction of the deleted content.
    */
    mapResult: (pos: number, assoc?: number) => MapResult;
  }
  /**
An object representing a mapped position with extra
information.
*/
  declare class MapResult {
    /**
    The mapped version of the position.
    */
    readonly pos: number;
    /**
    Tells you whether the position was deleted, that is, whether the
    step removed the token on the side queried (via the `assoc`)
    argument from the document.
    */
    get deleted(): boolean;
    /**
    Tells you whether the token before the mapped position was deleted.
    */
    get deletedBefore(): boolean;
    /**
    True when the token after the mapped position was deleted.
    */
    get deletedAfter(): boolean;
    /**
    Tells whether any of the steps mapped through deletes across the
    position (including both the token before and after the
    position).
    */
    get deletedAcross(): boolean;
  }
  /**
A map describing the deletions and insertions made by a step, which
can be used to find the correspondence between positions in the
pre-step version of a document and the same position in the
post-step version.
*/
  declare class StepMap implements Mappable {
    /**
    Create a position map. The modifications to the document are
    represented as an array of numbers, in which each group of three
    represents a modified chunk as `[start, oldSize, newSize]`.
    */
    constructor(
      /**
    @internal
    */
      ranges: readonly number[],
      /**
    @internal
    */
      inverted?: boolean,
    );
    mapResult(pos: number, assoc?: number): MapResult;
    map(pos: number, assoc?: number): number;
    /**
    Calls the given function on each of the changed ranges included in
    this map.
    */
    forEach(
      f: (
        oldStart: number,
        oldEnd: number,
        newStart: number,
        newEnd: number,
      ) => void,
    ): void;
    /**
    Create an inverted version of this map. The result can be used to
    map positions in the post-step document to the pre-step document.
    */
    invert(): StepMap;
    /**
    Create a map that moves all positions by offset `n` (which may be
    negative). This can be useful when applying steps meant for a
    sub-document to a larger document, or vice-versa.
    */
    static offset(n: number): StepMap;
    /**
    A StepMap that contains no changed ranges.
    */
    static empty: StepMap;
  }
  /**
A mapping represents a pipeline of zero or more [step
maps](https://prosemirror.net/docs/ref/#transform.StepMap). It has special provisions for losslessly
handling mapping positions through a series of steps in which some
steps are inverted versions of earlier steps. (This comes up when
‘[rebasing](https://prosemirror.net/docs/guide/#transform.rebasing)’ steps for
collaboration or history management.)
*/
  declare class Mapping implements Mappable {
    /**
    The starting position in the `maps` array, used when `map` or
    `mapResult` is called.
    */
    from: number;
    /**
    The end position in the `maps` array.
    */
    to: number;
    /**
    Create a new mapping with the given position maps.
    */
    constructor(
      maps?: readonly StepMap[],
      /**
    @internal
    */
      mirror?: number[] | undefined,
      /**
    The starting position in the `maps` array, used when `map` or
    `mapResult` is called.
    */
      from?: number,
      /**
    The end position in the `maps` array.
    */
      to?: number,
    );
    /**
    The step maps in this mapping.
    */
    get maps(): readonly StepMap[];
    private _maps;
    private ownData;
    /**
    Create a mapping that maps only through a part of this one.
    */
    slice(from?: number, to?: number): Mapping;
    /**
    Add a step map to the end of this mapping. If `mirrors` is
    given, it should be the index of the step map that is the mirror
    image of this one.
    */
    appendMap(map: StepMap, mirrors?: number): void;
    /**
    Add all the step maps in a given mapping to this one (preserving
    mirroring information).
    */
    appendMapping(mapping: Mapping): void;
    /**
    Finds the offset of the step map that mirrors the map at the
    given offset, in this mapping (as per the second argument to
    `appendMap`).
    */
    getMirror(n: number): number | undefined;
    /**
    Append the inverse of the given mapping to this one.
    */
    appendMappingInverted(mapping: Mapping): void;
    /**
    Create an inverted version of this mapping.
    */
    invert(): Mapping;
    /**
    Map a position through this mapping.
    */
    map(pos: number, assoc?: number): number;
    /**
    Map a position through this mapping, returning a mapping
    result.
    */
    mapResult(pos: number, assoc?: number): MapResult;
  }

  /**
A step object represents an atomic change. It generally applies
only to the document it was created for, since the positions
stored in it will only make sense for that document.

New steps are defined by creating classes that extend `Step`,
overriding the `apply`, `invert`, `map`, `getMap` and `fromJSON`
methods, and registering your class with a unique
JSON-serialization identifier using
[`Step.jsonID`](https://prosemirror.net/docs/ref/#transform.Step^jsonID).
*/
  declare abstract class Step {
    /**
    Applies this step to the given document, returning a result
    object that either indicates failure, if the step can not be
    applied to this document, or indicates success by containing a
    transformed document.
    */
    abstract apply(doc: Node$1): StepResult;
    /**
    Get the step map that represents the changes made by this step,
    and which can be used to transform between positions in the old
    and the new document.
    */
    getMap(): StepMap;
    /**
    Create an inverted version of this step. Needs the document as it
    was before the step as argument.
    */
    abstract invert(doc: Node$1): Step;
    /**
    Map this step through a mappable thing, returning either a
    version of that step with its positions adjusted, or `null` if
    the step was entirely deleted by the mapping.
    */
    abstract map(mapping: Mappable): Step | null;
    /**
    Try to merge this step with another one, to be applied directly
    after it. Returns the merged step when possible, null if the
    steps can't be merged.
    */
    merge(other: Step): Step | null;
    /**
    Create a JSON-serializeable representation of this step. When
    defining this for a custom subclass, make sure the result object
    includes the step type's [JSON id](https://prosemirror.net/docs/ref/#transform.Step^jsonID) under
    the `stepType` property.
    */
    abstract toJSON(): any;
    /**
    Deserialize a step from its JSON representation. Will call
    through to the step class' own implementation of this method.
    */
    static fromJSON(schema: Schema, json: any): Step;
    /**
    To be able to serialize steps to JSON, each step needs a string
    ID to attach to its JSON representation. Use this method to
    register an ID for your step classes. Try to pick something
    that's unlikely to clash with steps from other modules.
    */
    static jsonID(
      id: string,
      stepClass: {
        fromJSON(schema: Schema, json: any): Step;
      },
    ): {
      fromJSON(schema: Schema, json: any): Step;
    };
  }
  /**
The result of [applying](https://prosemirror.net/docs/ref/#transform.Step.apply) a step. Contains either a
new document or a failure value.
*/
  declare class StepResult {
    /**
    The transformed document, if successful.
    */
    readonly doc: Node$1 | null;
    /**
    The failure message, if unsuccessful.
    */
    readonly failed: string | null;
    /**
    Create a successful step result.
    */
    static ok(doc: Node$1): StepResult;
    /**
    Create a failed step result.
    */
    static fail(message: string): StepResult;
    /**
    Call [`Node.replace`](https://prosemirror.net/docs/ref/#model.Node.replace) with the given
    arguments. Create a successful result if it succeeds, and a
    failed one if it throws a `ReplaceError`.
    */
    static fromReplace(
      doc: Node$1,
      from: number,
      to: number,
      slice: Slice,
    ): StepResult;
  }

  /**
Abstraction to build up and track an array of
[steps](https://prosemirror.net/docs/ref/#transform.Step) representing a document transformation.

Most transforming methods return the `Transform` object itself, so
that they can be chained.
*/
  declare class Transform {
    /**
    The current document (the result of applying the steps in the
    transform).
    */
    doc: Node$1;
    /**
    The steps in this transform.
    */
    readonly steps: Step[];
    /**
    The documents before each of the steps.
    */
    readonly docs: Node$1[];
    /**
    A mapping with the maps for each of the steps in this transform.
    */
    readonly mapping: Mapping;
    /**
    Create a transform that starts with the given document.
    */
    constructor(
      /**
    The current document (the result of applying the steps in the
    transform).
    */
      doc: Node$1,
    );
    /**
    The starting document.
    */
    get before(): Node$1;
    /**
    Apply a new step in this transform, saving the result. Throws an
    error when the step fails.
    */
    step(step: Step): this;
    /**
    Try to apply a step in this transformation, ignoring it if it
    fails. Returns the step result.
    */
    maybeStep(step: Step): StepResult;
    /**
    True when the document has been changed (when there are any
    steps).
    */
    get docChanged(): boolean;
    /**
    Return a single range, in post-transform document positions,
    that covers all content changed by this transform. Returns null
    if no replacements are made. Note that this will ignore changes
    that add/remove marks without replacing the underlying content.
    */
    changedRange(): {
      from: number;
      to: number;
    } | null;
    /**
    Replace the part of the document between `from` and `to` with the
    given `slice`.
    */
    replace(from: number, to?: number, slice?: Slice): this;
    /**
    Replace the given range with the given content, which may be a
    fragment, node, or array of nodes.
    */
    replaceWith(
      from: number,
      to: number,
      content: Fragment | Node$1 | readonly Node$1[],
    ): this;
    /**
    Delete the content between the given positions.
    */
    delete(from: number, to: number): this;
    /**
    Insert the given content at the given position.
    */
    insert(pos: number, content: Fragment | Node$1 | readonly Node$1[]): this;
    /**
    Replace a range of the document with a given slice, using
    `from`, `to`, and the slice's
    [`openStart`](https://prosemirror.net/docs/ref/#model.Slice.openStart) property as hints, rather
    than fixed start and end points. This method may grow the
    replaced area or close open nodes in the slice in order to get a
    fit that is more in line with WYSIWYG expectations, by dropping
    fully covered parent nodes of the replaced region when they are
    marked [non-defining as
    context](https://prosemirror.net/docs/ref/#model.NodeSpec.definingAsContext), or including an
    open parent node from the slice that _is_ marked as [defining
    its content](https://prosemirror.net/docs/ref/#model.NodeSpec.definingForContent).
    
    This is the method, for example, to handle paste. The similar
    [`replace`](https://prosemirror.net/docs/ref/#transform.Transform.replace) method is a more
    primitive tool which will _not_ move the start and end of its given
    range, and is useful in situations where you need more precise
    control over what happens.
    */
    replaceRange(from: number, to: number, slice: Slice): this;
    /**
    Replace the given range with a node, but use `from` and `to` as
    hints, rather than precise positions. When from and to are the same
    and are at the start or end of a parent node in which the given
    node doesn't fit, this method may _move_ them out towards a parent
    that does allow the given node to be placed. When the given range
    completely covers a parent node, this method may completely replace
    that parent node.
    */
    replaceRangeWith(from: number, to: number, node: Node$1): this;
    /**
    Delete the given range, expanding it to cover fully covered
    parent nodes until a valid replace is found.
    */
    deleteRange(from: number, to: number): this;
    /**
    Split the content in the given range off from its parent, if there
    is sibling content before or after it, and move it up the tree to
    the depth specified by `target`. You'll probably want to use
    [`liftTarget`](https://prosemirror.net/docs/ref/#transform.liftTarget) to compute `target`, to make
    sure the lift is valid.
    */
    lift(range: NodeRange, target: number): this;
    /**
    Join the blocks around the given position. If depth is 2, their
    last and first siblings are also joined, and so on.
    */
    join(pos: number, depth?: number): this;
    /**
    Wrap the given [range](https://prosemirror.net/docs/ref/#model.NodeRange) in the given set of wrappers.
    The wrappers are assumed to be valid in this position, and should
    probably be computed with [`findWrapping`](https://prosemirror.net/docs/ref/#transform.findWrapping).
    */
    wrap(
      range: NodeRange,
      wrappers: readonly {
        type: NodeType;
        attrs?: Attrs | null;
      }[],
    ): this;
    /**
    Set the type of all textblocks (partly) between `from` and `to` to
    the given node type with the given attributes.
    */
    setBlockType(
      from: number,
      to: number | undefined,
      type: NodeType,
      attrs?: Attrs | null | ((oldNode: Node$1) => Attrs),
    ): this;
    /**
    Change the type, attributes, and/or marks of the node at `pos`.
    When `type` isn't given, the existing node type is preserved,
    */
    setNodeMarkup(
      pos: number,
      type?: NodeType | null,
      attrs?: Attrs | null,
      marks?: readonly Mark[],
    ): this;
    /**
    Set a single attribute on a given node to a new value.
    The `pos` addresses the document content. Use `setDocAttribute`
    to set attributes on the document itself.
    */
    setNodeAttribute(pos: number, attr: string, value: any): this;
    /**
    Set a single attribute on the document to a new value.
    */
    setDocAttribute(attr: string, value: any): this;
    /**
    Add a mark to the node at position `pos`.
    */
    addNodeMark(pos: number, mark: Mark): this;
    /**
    Remove a mark (or all marks of the given type) from the node at
    position `pos`.
    */
    removeNodeMark(pos: number, mark: Mark | MarkType): this;
    /**
    Split the node at the given position, and optionally, if `depth` is
    greater than one, any number of nodes above that. By default, the
    parts split off will inherit the node type of the original node.
    This can be changed by passing an array of types and attributes to
    use after the split (with the outermost nodes coming first).
    */
    split(
      pos: number,
      depth?: number,
      typesAfter?: (null | {
        type: NodeType;
        attrs?: Attrs | null;
      })[],
    ): this;
    /**
    Add the given mark to the inline content between `from` and `to`.
    */
    addMark(from: number, to: number, mark: Mark): this;
    /**
    Remove marks from inline nodes between `from` and `to`. When
    `mark` is a single mark, remove precisely that mark. When it is
    a mark type, remove all marks of that type. When it is null,
    remove all marks of any type.
    */
    removeMark(from: number, to: number, mark?: Mark | MarkType | null): this;
    /**
    Removes all marks and nodes from the content of the node at
    `pos` that don't match the given new parent node type. Accepts
    an optional starting [content match](https://prosemirror.net/docs/ref/#model.ContentMatch) as
    third argument.
    */
    clearIncompatible(
      pos: number,
      parentType: NodeType,
      match?: ContentMatch,
    ): this;
  }

  /**
Try to find a target depth to which the content in the given range
can be lifted. Will not go across
[isolating](https://prosemirror.net/docs/ref/#model.NodeSpec.isolating) parent nodes.
*/
  declare function liftTarget(range: NodeRange): number | null;
  /**
Try to find a valid way to wrap the content in the given range in a
node of the given type. May introduce extra nodes around and inside
the wrapper node, if necessary. Returns null if no valid wrapping
could be found. When `innerRange` is given, that range's content is
used as the content to fit into the wrapping, instead of the
content of `range`.
*/
  declare function findWrapping(
    range: NodeRange,
    nodeType: NodeType,
    attrs?: Attrs | null,
    innerRange?: NodeRange,
  ):
    | {
        type: NodeType;
        attrs: Attrs | null;
      }[]
    | null;
  /**
Check whether splitting at the given position is allowed.
*/
  declare function canSplit(
    doc: Node$1,
    pos: number,
    depth?: number,
    typesAfter?: (null | {
      type: NodeType;
      attrs?: Attrs | null;
    })[],
  ): boolean;
  /**
Test whether the blocks before and after a given position can be
joined.
*/
  declare function canJoin(doc: Node$1, pos: number): boolean;
  /**
Find an ancestor of the given position that can be joined to the
block before (or after if `dir` is positive). Returns the joinable
point, if any.
*/
  declare function joinPoint(
    doc: Node$1,
    pos: number,
    dir?: number,
  ): number | undefined;
  /**
Try to find a point where a node of the given type can be inserted
near `pos`, by searching up the node hierarchy when `pos` itself
isn't a valid place but is at the start or end of a node. Return
null if no position was found.
*/
  declare function insertPoint(
    doc: Node$1,
    pos: number,
    nodeType: NodeType,
  ): number | null;
  /**
Finds a position at or around the given position where the given
slice can be inserted. Will look at parent nodes' nearest boundary
and try there, even if the original position wasn't directly at the
start or end of that node. Returns null when no position was found.
*/
  declare function dropPoint(
    doc: Node$1,
    pos: number,
    slice: Slice,
  ): number | null;

  /**
Add a mark to all inline content between two positions.
*/
  declare class AddMarkStep extends Step {
    /**
    The start of the marked range.
    */
    readonly from: number;
    /**
    The end of the marked range.
    */
    readonly to: number;
    /**
    The mark to add.
    */
    readonly mark: Mark;
    /**
    Create a mark step.
    */
    constructor(
      /**
    The start of the marked range.
    */
      from: number,
      /**
    The end of the marked range.
    */
      to: number,
      /**
    The mark to add.
    */
      mark: Mark,
    );
    apply(doc: Node$1): StepResult;
    invert(): Step;
    map(mapping: Mappable): Step | null;
    merge(other: Step): Step | null;
    toJSON(): any;
  }
  /**
Remove a mark from all inline content between two positions.
*/
  declare class RemoveMarkStep extends Step {
    /**
    The start of the unmarked range.
    */
    readonly from: number;
    /**
    The end of the unmarked range.
    */
    readonly to: number;
    /**
    The mark to remove.
    */
    readonly mark: Mark;
    /**
    Create a mark-removing step.
    */
    constructor(
      /**
    The start of the unmarked range.
    */
      from: number,
      /**
    The end of the unmarked range.
    */
      to: number,
      /**
    The mark to remove.
    */
      mark: Mark,
    );
    apply(doc: Node$1): StepResult;
    invert(): Step;
    map(mapping: Mappable): Step | null;
    merge(other: Step): Step | null;
    toJSON(): any;
  }
  /**
Add a mark to a specific node.
*/
  declare class AddNodeMarkStep extends Step {
    /**
    The position of the target node.
    */
    readonly pos: number;
    /**
    The mark to add.
    */
    readonly mark: Mark;
    /**
    Create a node mark step.
    */
    constructor(
      /**
    The position of the target node.
    */
      pos: number,
      /**
    The mark to add.
    */
      mark: Mark,
    );
    apply(doc: Node$1): StepResult;
    invert(doc: Node$1): Step;
    map(mapping: Mappable): Step | null;
    toJSON(): any;
  }
  /**
Remove a mark from a specific node.
*/
  declare class RemoveNodeMarkStep extends Step {
    /**
    The position of the target node.
    */
    readonly pos: number;
    /**
    The mark to remove.
    */
    readonly mark: Mark;
    /**
    Create a mark-removing step.
    */
    constructor(
      /**
    The position of the target node.
    */
      pos: number,
      /**
    The mark to remove.
    */
      mark: Mark,
    );
    apply(doc: Node$1): StepResult;
    invert(doc: Node$1): Step;
    map(mapping: Mappable): Step | null;
    toJSON(): any;
  }

  /**
Replace a part of the document with a slice of new content.
*/
  declare class ReplaceStep extends Step {
    /**
    The start position of the replaced range.
    */
    readonly from: number;
    /**
    The end position of the replaced range.
    */
    readonly to: number;
    /**
    The slice to insert.
    */
    readonly slice: Slice;
    /**
    The given `slice` should fit the 'gap' between `from` and
    `to`—the depths must line up, and the surrounding nodes must be
    able to be joined with the open sides of the slice. When
    `structure` is true, the step will fail if the content between
    from and to is not just a sequence of closing and then opening
    tokens (this is to guard against rebased replace steps
    overwriting something they weren't supposed to).
    */
    constructor(
      /**
    The start position of the replaced range.
    */
      from: number,
      /**
    The end position of the replaced range.
    */
      to: number,
      /**
    The slice to insert.
    */
      slice: Slice,
      /**
    @internal
    */
      structure?: boolean,
    );
    apply(doc: Node$1): StepResult;
    getMap(): StepMap;
    invert(doc: Node$1): ReplaceStep;
    map(mapping: Mappable): ReplaceStep | null;
    merge(other: Step): ReplaceStep | null;
    toJSON(): any;
  }
  /**
Replace a part of the document with a slice of content, but
preserve a range of the replaced content by moving it into the
slice.
*/
  declare class ReplaceAroundStep extends Step {
    /**
    The start position of the replaced range.
    */
    readonly from: number;
    /**
    The end position of the replaced range.
    */
    readonly to: number;
    /**
    The start of preserved range.
    */
    readonly gapFrom: number;
    /**
    The end of preserved range.
    */
    readonly gapTo: number;
    /**
    The slice to insert.
    */
    readonly slice: Slice;
    /**
    The position in the slice where the preserved range should be
    inserted.
    */
    readonly insert: number;
    /**
    Create a replace-around step with the given range and gap.
    `insert` should be the point in the slice into which the content
    of the gap should be moved. `structure` has the same meaning as
    it has in the [`ReplaceStep`](https://prosemirror.net/docs/ref/#transform.ReplaceStep) class.
    */
    constructor(
      /**
    The start position of the replaced range.
    */
      from: number,
      /**
    The end position of the replaced range.
    */
      to: number,
      /**
    The start of preserved range.
    */
      gapFrom: number,
      /**
    The end of preserved range.
    */
      gapTo: number,
      /**
    The slice to insert.
    */
      slice: Slice,
      /**
    The position in the slice where the preserved range should be
    inserted.
    */
      insert: number,
      /**
    @internal
    */
      structure?: boolean,
    );
    apply(doc: Node$1): StepResult;
    getMap(): StepMap;
    invert(doc: Node$1): ReplaceAroundStep;
    map(mapping: Mappable): ReplaceAroundStep | null;
    toJSON(): any;
  }

  /**
Update an attribute in a specific node.
*/
  declare class AttrStep extends Step {
    /**
    The position of the target node.
    */
    readonly pos: number;
    /**
    The attribute to set.
    */
    readonly attr: string;
    readonly value: any;
    /**
    Construct an attribute step.
    */
    constructor(
      /**
    The position of the target node.
    */
      pos: number,
      /**
    The attribute to set.
    */
      attr: string,
      value: any,
    );
    apply(doc: Node$1): StepResult;
    getMap(): StepMap;
    invert(doc: Node$1): AttrStep;
    map(mapping: Mappable): AttrStep | null;
    toJSON(): any;
    static fromJSON(schema: Schema, json: any): AttrStep;
  }
  /**
Update an attribute in the doc node.
*/
  declare class DocAttrStep extends Step {
    /**
    The attribute to set.
    */
    readonly attr: string;
    readonly value: any;
    /**
    Construct an attribute step.
    */
    constructor(
      /**
    The attribute to set.
    */
      attr: string,
      value: any,
    );
    apply(doc: Node$1): StepResult;
    getMap(): StepMap;
    invert(doc: Node$1): DocAttrStep;
    map(mapping: Mappable): this;
    toJSON(): any;
    static fromJSON(schema: Schema, json: any): DocAttrStep;
  }

  /**
‘Fit’ a slice into a given position in the document, producing a
[step](https://prosemirror.net/docs/ref/#transform.Step) that inserts it. Will return null if
there's no meaningful way to insert the slice here, or inserting it
would be a no-op (an empty slice over an empty range).
*/
  declare function replaceStep(
    doc: Node$1,
    from: number,
    to?: number,
    slice?: Slice,
  ): Step | null;

  type DOMNode = InstanceType<typeof window.Node>;

  type WidgetConstructor =
    | ((view: EditorView, getPos: () => number | undefined) => DOMNode)
    | DOMNode;
  /**
Decoration objects can be provided to the view through the
[`decorations` prop](https://prosemirror.net/docs/ref/#view.EditorProps.decorations). They come in
several variants—see the static members of this class for details.
*/
  declare class Decoration {
    /**
    The start position of the decoration.
    */
    readonly from: number;
    /**
    The end position. Will be the same as `from` for [widget
    decorations](https://prosemirror.net/docs/ref/#view.Decoration^widget).
    */
    readonly to: number;
    /**
    Creates a widget decoration, which is a DOM node that's shown in
    the document at the given position. It is recommended that you
    delay rendering the widget by passing a function that will be
    called when the widget is actually drawn in a view, but you can
    also directly pass a DOM node. `getPos` can be used to find the
    widget's current document position.
    */
    static widget(
      pos: number,
      toDOM: WidgetConstructor,
      spec?: {
        /**
        Controls which side of the document position this widget is
        associated with. When negative, it is drawn before a cursor
        at its position, and content inserted at that position ends
        up after the widget. When zero (the default) or positive, the
        widget is drawn after the cursor and content inserted there
        ends up before the widget.
        
        When there are multiple widgets at a given position, their
        `side` values determine the order in which they appear. Those
        with lower values appear first. The ordering of widgets with
        the same `side` value is unspecified.
        
        When `marks` is null, `side` also determines the marks that
        the widget is wrapped in—those of the node before when
        negative, those of the node after when positive.
        */
        side?: number;
        /**
        By default, the cursor, when at the position of the widget,
        will be strictly kept on the side indicated by
        [`side`](https://prosemirror.net/docs/ref/#view.Decoration^widget^spec.side). Set this to true
        to allow the DOM selection to stay on the other side if the
        client sets it there.
        
        **Note**: Mapping of this decoration, which decides on which
        side insertions at its position appear, will still happen
        according to `side`, and keyboard cursor motion will not,
        without further custom handling, visit both sides of the
        widget.
        */
        relaxedSide?: boolean;
        /**
        The precise set of marks to draw around the widget.
        */
        marks?: readonly Mark[];
        /**
        Can be used to control which DOM events, when they bubble out
        of this widget, the editor view should ignore.
        */
        stopEvent?: (event: Event) => boolean;
        /**
        When set (defaults to false), selection changes inside the
        widget are ignored, and don't cause ProseMirror to try and
        re-sync the selection with its selection state.
        */
        ignoreSelection?: boolean;
        /**
        When comparing decorations of this type (in order to decide
        whether it needs to be redrawn), ProseMirror will by default
        compare the widget DOM node by identity. If you pass a key,
        that key will be compared instead, which can be useful when
        you generate decorations on the fly and don't want to store
        and reuse DOM nodes. Make sure that any widgets with the same
        key are interchangeable—if widgets differ in, for example,
        the behavior of some event handler, they should get
        different keys.
        */
        key?: string;
        /**
        Called when the widget decoration is removed or the editor is
        destroyed.
        */
        destroy?: (node: DOMNode) => void;
        /**
        Specs allow arbitrary additional properties.
        */
        [key: string]: any;
      },
    ): Decoration;
    /**
    Creates an inline decoration, which adds the given attributes to
    each inline node between `from` and `to`.
    */
    static inline(
      from: number,
      to: number,
      attrs: DecorationAttrs,
      spec?: {
        /**
        Determines how the left side of the decoration is
        [mapped](https://prosemirror.net/docs/ref/#transform.Position_Mapping) when content is
        inserted directly at that position. By default, the decoration
        won't include the new content, but you can set this to `true`
        to make it inclusive.
        */
        inclusiveStart?: boolean;
        /**
        Determines how the right side of the decoration is mapped.
        See
        [`inclusiveStart`](https://prosemirror.net/docs/ref/#view.Decoration^inline^spec.inclusiveStart).
        */
        inclusiveEnd?: boolean;
        /**
        Specs may have arbitrary additional properties.
        */
        [key: string]: any;
      },
    ): Decoration;
    /**
    Creates a node decoration. `from` and `to` should point precisely
    before and after a node in the document. That node, and only that
    node, will receive the given attributes.
    */
    static node(
      from: number,
      to: number,
      attrs: DecorationAttrs,
      spec?: any,
    ): Decoration;
    /**
    The spec provided when creating this decoration. Can be useful
    if you've stored extra information in that object.
    */
    get spec(): any;
  }
  /**
A set of attributes to add to a decorated node. Most properties
simply directly correspond to DOM attributes of the same name,
which will be set to the property's value. These are exceptions:
*/
  type DecorationAttrs = {
    /**
    When non-null, the target node is wrapped in a DOM element of
    this type (and the other attributes are applied to this element).
    */
    nodeName?: string;
    /**
    A CSS class name or a space-separated set of class names to be
    _added_ to the classes that the node already had.
    */
    class?: string;
    /**
    A string of CSS to be _added_ to the node's existing `style` property.
    */
    style?: string;
    /**
    Any other properties are treated as regular DOM attributes.
    */
    [attribute: string]: string | undefined;
  };
  /**
An object that can [provide](https://prosemirror.net/docs/ref/#view.EditorProps.decorations)
decorations. Implemented by [`DecorationSet`](https://prosemirror.net/docs/ref/#view.DecorationSet),
and passed to [node views](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews).
*/
  interface DecorationSource {
    /**
    Map the set of decorations in response to a change in the
    document.
    */
    map: (mapping: Mapping, node: Node$1) => DecorationSource;
    /**
    Extract a DecorationSource containing decorations for the given child node at the given offset.
    */
    forChild(offset: number, child: Node$1): DecorationSource;
    /**
    Call the given function for each decoration set in the group.
    */
    forEachSet(f: (set: DecorationSet) => void): void;
  }
  /**
A collection of [decorations](https://prosemirror.net/docs/ref/#view.Decoration), organized in such
a way that the drawing algorithm can efficiently use and compare
them. This is a persistent data structure—it is not modified,
updates create a new value.
*/
  declare class DecorationSet implements DecorationSource {
    /**
    Create a set of decorations, using the structure of the given
    document. This will consume (modify) the `decorations` array, so
    you must make a copy if you want need to preserve that.
    */
    static create(doc: Node$1, decorations: Decoration[]): DecorationSet;
    /**
    Find all decorations in this set which touch the given range
    (including decorations that start or end directly at the
    boundaries) and match the given predicate on their spec. When
    `start` and `end` are omitted, all decorations in the set are
    considered. When `predicate` isn't given, all decorations are
    assumed to match.
    */
    find(
      start?: number,
      end?: number,
      predicate?: (spec: any) => boolean,
    ): Decoration[];
    private findInner;
    /**
    Map the set of decorations in response to a change in the
    document.
    */
    map(
      mapping: Mapping,
      doc: Node$1,
      options?: {
        /**
        When given, this function will be called for each decoration
        that gets dropped as a result of the mapping, passing the
        spec of that decoration.
        */
        onRemove?: (decorationSpec: any) => void;
      },
    ): DecorationSet;
    /**
    Add the given array of decorations to the ones in the set,
    producing a new set. Consumes the `decorations` array. Needs
    access to the current document to create the appropriate tree
    structure.
    */
    add(doc: Node$1, decorations: Decoration[]): DecorationSet;
    private addInner;
    /**
    Create a new set that contains the decorations in this set, minus
    the ones in the given array.
    */
    remove(decorations: Decoration[]): DecorationSet;
    private removeInner;
    forChild(offset: number, node: Node$1): DecorationSet | DecorationGroup;
    /**
    The empty set of decorations.
    */
    static empty: DecorationSet;
    forEachSet(f: (set: DecorationSet) => void): void;
  }
  declare class DecorationGroup implements DecorationSource {
    readonly members: readonly DecorationSet[];
    constructor(members: readonly DecorationSet[]);
    map(mapping: Mapping, doc: Node$1): DecorationSource;
    forChild(offset: number, child: Node$1): DecorationSource | DecorationSet;
    eq(other: DecorationGroup): boolean;
    locals(node: Node$1): readonly any[];
    static from(members: readonly DecorationSource[]): DecorationSource;
    forEachSet(f: (set: DecorationSet) => void): void;
  }

  declare global {
    interface Node {}
  }
  /**
A ViewMutationRecord represents a DOM
[mutation](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
or a selection change happens within the view. When the change is
a selection change, the record will have a `type` property of
`"selection"` (which doesn't occur for native mutation records).
*/
  type ViewMutationRecord =
    | MutationRecord
    | {
        type: "selection";
        target: DOMNode;
      };
  /**
By default, document nodes are rendered using the result of the
[`toDOM`](https://prosemirror.net/docs/ref/#model.NodeSpec.toDOM) method of their spec, and managed
entirely by the editor. For some use cases, such as embedded
node-specific editing interfaces, you want more control over
the behavior of a node's in-editor representation, and need to
[define](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews) a custom node view.

Objects returned as node views must conform to this interface.
*/
  interface NodeView {
    /**
    The outer DOM node that represents the document node.
    */
    dom: DOMNode;
    /**
    The DOM node that should hold the node's content. Only meaningful
    if the node view also defines a `dom` property and if its node
    type is not a leaf node type. When this is present, ProseMirror
    will take care of rendering the node's children into it. When it
    is not present, the node view itself is responsible for rendering
    (or deciding not to render) its child nodes.
    */
    contentDOM?: HTMLElement | null;
    /**
    When given, this will be called when the view is updating
    itself. It will be given a node, an array of active decorations
    around the node (which are automatically drawn, and the node
    view may ignore if it isn't interested in them), and a
    [decoration source](https://prosemirror.net/docs/ref/#view.DecorationSource) that represents any
    decorations that apply to the content of the node (which again
    may be ignored). It should return true if it was able to update
    to that node, and false otherwise. If the node view has a
    `contentDOM` property (or no `dom` property), updating its child
    nodes will be handled by ProseMirror.
    */
    update?: (
      node: Node$1,
      decorations: readonly Decoration[],
      innerDecorations: DecorationSource,
    ) => boolean;
    /**
    By default, `update` will only be called when a node of the same
    node type appears in this view's position. When you set this to
    true, it will be called for any node, making it possible to have
    a node view that representsmultiple types of nodes. You will
    need to check the type of the nodes you get in `update` and
    return `false` for types you cannot handle.
    */
    multiType?: boolean;
    /**
    Can be used to override the way the node's selected status (as a
    node selection) is displayed.
    */
    selectNode?: () => void;
    /**
    When defining a `selectNode` method, you should also provide a
    `deselectNode` method to remove the effect again.
    */
    deselectNode?: () => void;
    /**
    This will be called to handle setting the selection inside the
    node. The `anchor` and `head` positions are relative to the start
    of the node. By default, a DOM selection will be created between
    the DOM positions corresponding to those positions, but if you
    override it you can do something else.
    */
    setSelection?: (
      anchor: number,
      head: number,
      root: Document | ShadowRoot,
    ) => void;
    /**
    Can be used to prevent the editor view from trying to handle some
    or all DOM events that bubble up from the node view. Events for
    which this returns true are not handled by the editor.
    */
    stopEvent?: (event: Event) => boolean;
    /**
    Called when a [mutation](https://prosemirror.net/docs/ref/#view.ViewMutationRecord) happens within the
    view. Return false if the editor should re-read the selection or re-parse
    the range around the mutation, true if it can safely be ignored.
    */
    ignoreMutation?: (mutation: ViewMutationRecord) => boolean;
    /**
    Called when the node view is removed from the editor or the whole
    editor is destroyed.
    */
    destroy?: () => void;
  }
  /**
By default, document marks are rendered using the result of the
[`toDOM`](https://prosemirror.net/docs/ref/#model.MarkSpec.toDOM) method of their spec, and managed entirely
by the editor. For some use cases, you want more control over the behavior
of a mark's in-editor representation, and need to
[define](https://prosemirror.net/docs/ref/#view.EditorProps.markViews) a custom mark view.

Objects returned as mark views must conform to this interface.
*/
  interface MarkView {
    /**
    The outer DOM node that represents the document node.
    */
    dom: DOMNode;
    /**
    The DOM node that should hold the mark's content. When this is not
    present, the `dom` property is used as the content DOM.
    */
    contentDOM?: HTMLElement | null;
    /**
    Called when a [mutation](https://prosemirror.net/docs/ref/#view.ViewMutationRecord) happens within the
    view. Return false if the editor should re-read the selection or re-parse
    the range around the mutation, true if it can safely be ignored.
    */
    ignoreMutation?: (mutation: ViewMutationRecord) => boolean;
    /**
    Called when the mark view is removed from the editor or the whole
    editor is destroyed.
    */
    destroy?: () => void;
  }

  /**
An editor view manages the DOM structure that represents an
editable document. Its state and behavior are determined by its
[props](https://prosemirror.net/docs/ref/#view.DirectEditorProps).
*/
  declare class EditorView {
    private directPlugins;
    private _root;
    private mounted;
    private prevDirectPlugins;
    private pluginViews;
    /**
    The view's current [state](https://prosemirror.net/docs/ref/#state.EditorState).
    */
    state: EditorState;
    /**
    Create a view. `place` may be a DOM node that the editor should
    be appended to, a function that will place it into the document,
    or an object whose `mount` property holds the node to use as the
    document container. If it is `null`, the editor will not be
    added to the document.
    */
    constructor(
      place:
        | null
        | DOMNode
        | ((editor: HTMLElement) => void)
        | {
            mount: HTMLElement;
          },
      props: DirectEditorProps,
    );
    /**
    An editable DOM node containing the document. (You probably
    should not directly interfere with its content.)
    */
    readonly dom: HTMLElement;
    /**
    Indicates whether the editor is currently [editable](https://prosemirror.net/docs/ref/#view.EditorProps.editable).
    */
    editable: boolean;
    /**
    When editor content is being dragged, this object contains
    information about the dragged slice and whether it is being
    copied or moved. At any other time, it is null.
    */
    dragging: null | {
      slice: Slice;
      move: boolean;
    };
    /**
    Holds `true` when a
    [composition](https://w3c.github.io/uievents/#events-compositionevents)
    is active.
    */
    get composing(): boolean;
    /**
    The view's current [props](https://prosemirror.net/docs/ref/#view.EditorProps).
    */
    get props(): DirectEditorProps;
    /**
    Update the view's props. Will immediately cause an update to
    the DOM.
    */
    update(props: DirectEditorProps): void;
    /**
    Update the view by updating existing props object with the object
    given as argument. Equivalent to `view.update(Object.assign({},
    view.props, props))`.
    */
    setProps(props: Partial<DirectEditorProps>): void;
    /**
    Update the editor's `state` prop, without touching any of the
    other props.
    */
    updateState(state: EditorState): void;
    private updateStateInner;
    private destroyPluginViews;
    private updatePluginViews;
    private updateDraggedNode;
    /**
    Goes over the values of a prop, first those provided directly,
    then those from plugins given to the view, then from plugins in
    the state (in order), and calls `f` every time a non-undefined
    value is found. When `f` returns a truthy value, that is
    immediately returned. When `f` isn't provided, it is treated as
    the identity function (the prop value is returned directly).
    */
    someProp<PropName extends keyof EditorProps, Result>(
      propName: PropName,
      f: (value: NonNullable<EditorProps[PropName]>) => Result,
    ): Result | undefined;
    someProp<PropName extends keyof EditorProps>(
      propName: PropName,
    ): NonNullable<EditorProps[PropName]> | undefined;
    /**
    Query whether the view has focus.
    */
    hasFocus(): boolean;
    /**
    Focus the editor.
    */
    focus(): void;
    /**
    Get the document root in which the editor exists. This will
    usually be the top-level `document`, but might be a [shadow
    DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM)
    root if the editor is inside one.
    */
    get root(): Document | ShadowRoot;
    /**
    When an existing editor view is moved to a new document or
    shadow tree, call this to make it recompute its root.
    */
    updateRoot(): void;
    /**
    Given a pair of viewport coordinates, return the document
    position that corresponds to them. May return null if the given
    coordinates aren't inside of the editor. When an object is
    returned, its `pos` property is the position nearest to the
    coordinates, and its `inside` property holds the position of the
    inner node that the position falls inside of, or -1 if it is at
    the top level, not in any node.
    */
    posAtCoords(coords: { left: number; top: number }): {
      pos: number;
      inside: number;
    } | null;
    /**
    Returns the viewport rectangle at a given document position.
    `left` and `right` will be the same number, as this returns a
    flat cursor-ish rectangle. If the position is between two things
    that aren't directly adjacent, `side` determines which element
    is used. When < 0, the element before the position is used,
    otherwise the element after.
    */
    coordsAtPos(
      pos: number,
      side?: number,
    ): {
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
    /**
    Find the DOM position that corresponds to the given document
    position. When `side` is negative, find the position as close as
    possible to the content before the position. When positive,
    prefer positions close to the content after the position. When
    zero, prefer as shallow a position as possible.
    
    Note that you should **not** mutate the editor's internal DOM,
    only inspect it (and even that is usually not necessary).
    */
    domAtPos(
      pos: number,
      side?: number,
    ): {
      node: DOMNode;
      offset: number;
    };
    /**
    Find the DOM node that represents the document node after the
    given position. May return `null` when the position doesn't point
    in front of a node or if the node is inside an opaque node view.
    
    This is intended to be able to call things like
    `getBoundingClientRect` on that DOM node. Do **not** mutate the
    editor DOM directly, or add styling this way, since that will be
    immediately overriden by the editor as it redraws the node.
    */
    nodeDOM(pos: number): DOMNode | null;
    /**
    Find the document position that corresponds to a given DOM
    position. (Whenever possible, it is preferable to inspect the
    document structure directly, rather than poking around in the
    DOM, but sometimes—for example when interpreting an event
    target—you don't have a choice.)
    
    The `bias` parameter can be used to influence which side of a DOM
    node to use when the position is inside a leaf node.
    */
    posAtDOM(node: DOMNode, offset: number, bias?: number): number;
    /**
    Find out whether the selection is at the end of a textblock when
    moving in a given direction. When, for example, given `"left"`,
    it will return true if moving left from the current cursor
    position would leave that position's parent textblock. Will apply
    to the view's current state by default, but it is possible to
    pass a different state.
    */
    endOfTextblock(
      dir: "up" | "down" | "left" | "right" | "forward" | "backward",
      state?: EditorState,
    ): boolean;
    /**
    Run the editor's paste logic with the given HTML string. The
    `event`, if given, will be passed to the
    [`handlePaste`](https://prosemirror.net/docs/ref/#view.EditorProps.handlePaste) hook.
    */
    pasteHTML(html: string, event?: ClipboardEvent): boolean;
    /**
    Run the editor's paste logic with the given plain-text input.
    */
    pasteText(text: string, event?: ClipboardEvent): boolean;
    /**
    Serialize the given slice as it would be if it was copied from
    this editor. Returns a DOM element that contains a
    representation of the slice as its children, a textual
    representation, and the transformed slice (which can be
    different from the given input due to hooks like
    [`transformCopied`](https://prosemirror.net/docs/ref/#view.EditorProps.transformCopied)).
    */
    serializeForClipboard(slice: Slice): {
      dom: HTMLElement;
      text: string;
      slice: Slice;
    };
    /**
    Removes the editor from the DOM and destroys all [node
    views](https://prosemirror.net/docs/ref/#view.NodeView).
    */
    destroy(): void;
    /**
    This is true when the view has been
    [destroyed](https://prosemirror.net/docs/ref/#view.EditorView.destroy) (and thus should not be
    used anymore).
    */
    get isDestroyed(): boolean;
    /**
    Used for testing.
    */
    dispatchEvent(event: Event): void;
    /**
    Dispatch a transaction. Will call
    [`dispatchTransaction`](https://prosemirror.net/docs/ref/#view.DirectEditorProps.dispatchTransaction)
    when given, and otherwise defaults to applying the transaction to
    the current state and calling
    [`updateState`](https://prosemirror.net/docs/ref/#view.EditorView.updateState) with the result.
    This method is bound to the view instance, so that it can be
    easily passed around.
    */
    dispatch: (tr: Transaction) => void;
  }
  /**
The type of function [provided](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews) to
create [node views](https://prosemirror.net/docs/ref/#view.NodeView).
*/
  type NodeViewConstructor = (
    node: Node$1,
    view: EditorView,
    getPos: () => number | undefined,
    decorations: readonly Decoration[],
    innerDecorations: DecorationSource,
  ) => NodeView;
  /**
The function types [used](https://prosemirror.net/docs/ref/#view.EditorProps.markViews) to create
mark views.
*/
  type MarkViewConstructor = (
    mark: Mark,
    view: EditorView,
    inline: boolean,
  ) => MarkView;
  /**
Helper type that maps event names to event object types, but
includes events that TypeScript's HTMLElementEventMap doesn't know
about.
*/
  interface DOMEventMap extends HTMLElementEventMap {
    [event: string]: any;
  }
  /**
Props are configuration values that can be passed to an editor view
or included in a plugin. This interface lists the supported props.

The various event-handling functions may all return `true` to
indicate that they handled the given event. The view will then take
care to call `preventDefault` on the event, except with
`handleDOMEvents`, where the handler itself is responsible for that.

How a prop is resolved depends on the prop. Handler functions are
called one at a time, starting with the base props and then
searching through the plugins (in order of appearance) until one of
them returns true. For some props, the first plugin that yields a
value gets precedence.

The optional type parameter refers to the type of `this` in prop
functions, and is used to pass in the plugin type when defining a
[plugin](https://prosemirror.net/docs/ref/#state.Plugin).
*/
  interface EditorProps<P = any> {
    /**
    Can be an object mapping DOM event type names to functions that
    handle them. Such functions will be called before any handling
    ProseMirror does of events fired on the editable DOM element.
    Contrary to the other event handling props, when returning true
    from such a function, you are responsible for calling
    `preventDefault` yourself (or not, if you want to allow the
    default behavior).
    */
    handleDOMEvents?: {
      [event in keyof DOMEventMap]?: (
        this: P,
        view: EditorView,
        event: DOMEventMap[event],
      ) => boolean | void;
    };
    /**
    Called when the editor receives a `keydown` event.
    */
    handleKeyDown?: (
      this: P,
      view: EditorView,
      event: KeyboardEvent,
    ) => boolean | void;
    /**
    Handler for `keypress` events.
    */
    handleKeyPress?: (
      this: P,
      view: EditorView,
      event: KeyboardEvent,
    ) => boolean | void;
    /**
    Whenever the user directly input text, this handler is called
    before the input is applied. If it returns `true`, the default
    behavior of actually inserting the text is suppressed.
    */
    handleTextInput?: (
      this: P,
      view: EditorView,
      from: number,
      to: number,
      text: string,
      deflt: () => Transaction,
    ) => boolean | void;
    /**
    Called for each node around a click, from the inside out. The
    `direct` flag will be true for the inner node.
    */
    handleClickOn?: (
      this: P,
      view: EditorView,
      pos: number,
      node: Node$1,
      nodePos: number,
      event: MouseEvent,
      direct: boolean,
    ) => boolean | void;
    /**
    Called when the editor is clicked, after `handleClickOn` handlers
    have been called.
    */
    handleClick?: (
      this: P,
      view: EditorView,
      pos: number,
      event: MouseEvent,
    ) => boolean | void;
    /**
    Called for each node around a double click.
    */
    handleDoubleClickOn?: (
      this: P,
      view: EditorView,
      pos: number,
      node: Node$1,
      nodePos: number,
      event: MouseEvent,
      direct: boolean,
    ) => boolean | void;
    /**
    Called when the editor is double-clicked, after `handleDoubleClickOn`.
    */
    handleDoubleClick?: (
      this: P,
      view: EditorView,
      pos: number,
      event: MouseEvent,
    ) => boolean | void;
    /**
    Called for each node around a triple click.
    */
    handleTripleClickOn?: (
      this: P,
      view: EditorView,
      pos: number,
      node: Node$1,
      nodePos: number,
      event: MouseEvent,
      direct: boolean,
    ) => boolean | void;
    /**
    Called when the editor is triple-clicked, after `handleTripleClickOn`.
    */
    handleTripleClick?: (
      this: P,
      view: EditorView,
      pos: number,
      event: MouseEvent,
    ) => boolean | void;
    /**
    Can be used to override the behavior of pasting. `slice` is the
    pasted content parsed by the editor, but you can directly access
    the event to get at the raw content.
    */
    handlePaste?: (
      this: P,
      view: EditorView,
      event: ClipboardEvent,
      slice: Slice,
    ) => boolean | void;
    /**
    Called when something is dropped on the editor. `moved` will be
    true if this drop moves from the current selection (which should
    thus be deleted).
    */
    handleDrop?: (
      this: P,
      view: EditorView,
      event: DragEvent,
      slice: Slice,
      moved: boolean,
    ) => boolean | void;
    /**
    Called when the view, after updating its state, tries to scroll
    the selection into view. A handler function may return false to
    indicate that it did not handle the scrolling and further
    handlers or the default behavior should be tried.
    */
    handleScrollToSelection?: (this: P, view: EditorView) => boolean;
    /**
    Determines whether an in-editor drag event should copy or move
    the selection. When not given, the event's `altKey` property is
    used on macOS, `ctrlKey` on other platforms.
    */
    dragCopies?: (event: DragEvent) => boolean;
    /**
    Can be used to override the way a selection is created when
    reading a DOM selection between the given anchor and head.
    */
    createSelectionBetween?: (
      this: P,
      view: EditorView,
      anchor: ResolvedPos,
      head: ResolvedPos,
    ) => Selection | null;
    /**
    The [parser](https://prosemirror.net/docs/ref/#model.DOMParser) to use when reading editor changes
    from the DOM. Defaults to calling
    [`DOMParser.fromSchema`](https://prosemirror.net/docs/ref/#model.DOMParser^fromSchema) on the
    editor's schema.
    */
    domParser?: DOMParser;
    /**
    Can be used to transform pasted HTML text, _before_ it is parsed,
    for example to clean it up.
    */
    transformPastedHTML?: (this: P, html: string, view: EditorView) => string;
    /**
    The [parser](https://prosemirror.net/docs/ref/#model.DOMParser) to use when reading content from
    the clipboard. When not given, the value of the
    [`domParser`](https://prosemirror.net/docs/ref/#view.EditorProps.domParser) prop is used.
    */
    clipboardParser?: DOMParser;
    /**
    Transform pasted plain text. The `plain` flag will be true when
    the text is pasted as plain text.
    */
    transformPastedText?: (
      this: P,
      text: string,
      plain: boolean,
      view: EditorView,
    ) => string;
    /**
    A function to parse text from the clipboard into a document
    slice. Called after
    [`transformPastedText`](https://prosemirror.net/docs/ref/#view.EditorProps.transformPastedText).
    The default behavior is to split the text into lines, wrap them
    in `<p>` tags, and call
    [`clipboardParser`](https://prosemirror.net/docs/ref/#view.EditorProps.clipboardParser) on it.
    The `plain` flag will be true when the text is pasted as plain text.
    */
    clipboardTextParser?: (
      this: P,
      text: string,
      $context: ResolvedPos,
      plain: boolean,
      view: EditorView,
    ) => Slice;
    /**
    Can be used to transform pasted or dragged-and-dropped content
    before it is applied to the document. The `plain` flag will be
    true when the text is pasted as plain text.
    */
    transformPasted?: (
      this: P,
      slice: Slice,
      view: EditorView,
      plain: boolean,
    ) => Slice;
    /**
    Can be used to transform copied or cut content before it is
    serialized to the clipboard.
    */
    transformCopied?: (this: P, slice: Slice, view: EditorView) => Slice;
    /**
    Allows you to pass custom rendering and behavior logic for
    nodes. Should map node names to constructor functions that
    produce a [`NodeView`](https://prosemirror.net/docs/ref/#view.NodeView) object implementing the
    node's display behavior. The third argument `getPos` is a
    function that can be called to get the node's current position,
    which can be useful when creating transactions to update it.
    Note that if the node is not in the document, the position
    returned by this function will be `undefined`.
    
    `decorations` is an array of node or inline decorations that are
    active around the node. They are automatically drawn in the
    normal way, and you will usually just want to ignore this, but
    they can also be used as a way to provide context information to
    the node view without adding it to the document itself.
    
    `innerDecorations` holds the decorations for the node's content.
    You can safely ignore this if your view has no content or a
    `contentDOM` property, since the editor will draw the decorations
    on the content. But if you, for example, want to create a nested
    editor with the content, it may make sense to provide it with the
    inner decorations.
    
    (For backwards compatibility reasons, [mark
    views](https://prosemirror.net/docs/ref/#view.EditorProps.markViews) can also be included in this
    object.)
    */
    nodeViews?: {
      [node: string]: NodeViewConstructor;
    };
    /**
    Pass custom mark rendering functions. Note that these cannot
    provide the kind of dynamic behavior that [node
    views](https://prosemirror.net/docs/ref/#view.NodeView) can—they just provide custom rendering
    logic. The third argument indicates whether the mark's content
    is inline.
    */
    markViews?: {
      [mark: string]: MarkViewConstructor;
    };
    /**
    The DOM serializer to use when putting content onto the
    clipboard. If not given, the result of
    [`DOMSerializer.fromSchema`](https://prosemirror.net/docs/ref/#model.DOMSerializer^fromSchema)
    will be used. This object will only have its
    [`serializeFragment`](https://prosemirror.net/docs/ref/#model.DOMSerializer.serializeFragment)
    method called, and you may provide an alternative object type
    implementing a compatible method.
    */
    clipboardSerializer?: DOMSerializer;
    /**
    A function that will be called to get the text for the current
    selection when copying text to the clipboard. By default, the
    editor will use [`textBetween`](https://prosemirror.net/docs/ref/#model.Node.textBetween) on the
    selected range.
    */
    clipboardTextSerializer?: (
      this: P,
      content: Slice,
      view: EditorView,
    ) => string;
    /**
    A set of [document decorations](https://prosemirror.net/docs/ref/#view.Decoration) to show in the
    view.
    */
    decorations?: (
      this: P,
      state: EditorState,
    ) => DecorationSource | null | undefined;
    /**
    When this returns false, the content of the view is not directly
    editable.
    */
    editable?: (this: P, state: EditorState) => boolean;
    /**
    Control the DOM attributes of the editable element. May be either
    an object or a function going from an editor state to an object.
    By default, the element will get a class `"ProseMirror"`, and
    will have its `contentEditable` attribute determined by the
    [`editable` prop](https://prosemirror.net/docs/ref/#view.EditorProps.editable). Additional classes
    provided here will be added to the class. For other attributes,
    the value provided first (as in
    [`someProp`](https://prosemirror.net/docs/ref/#view.EditorView.someProp)) will be used.
    */
    attributes?:
      | {
          [name: string]: string;
        }
      | ((state: EditorState) => {
          [name: string]: string;
        });
    /**
    Determines the distance (in pixels) between the cursor and the
    end of the visible viewport at which point, when scrolling the
    cursor into view, scrolling takes place. Defaults to 0.
    */
    scrollThreshold?:
      | number
      | {
          top: number;
          right: number;
          bottom: number;
          left: number;
        };
    /**
    Determines the extra space (in pixels) that is left above or
    below the cursor when it is scrolled into view. Defaults to 5.
    */
    scrollMargin?:
      | number
      | {
          top: number;
          right: number;
          bottom: number;
          left: number;
        };
  }
  /**
The props object given directly to the editor view supports some
fields that can't be used in plugins:
*/
  interface DirectEditorProps extends EditorProps {
    /**
    The current state of the editor.
    */
    state: EditorState;
    /**
    A set of plugins to use in the view, applying their [plugin
    view](https://prosemirror.net/docs/ref/#state.PluginSpec.view) and
    [props](https://prosemirror.net/docs/ref/#state.PluginSpec.props). Passing plugins with a state
    component (a [state field](https://prosemirror.net/docs/ref/#state.PluginSpec.state) field or a
    [transaction](https://prosemirror.net/docs/ref/#state.PluginSpec.filterTransaction) filter or
    appender) will result in an error, since such plugins must be
    present in the state to work.
    */
    plugins?: readonly Plugin[];
    /**
    The callback over which to send transactions (state updates)
    produced by the view. If you specify this, you probably want to
    make sure this ends up calling the view's
    [`updateState`](https://prosemirror.net/docs/ref/#view.EditorView.updateState) method with a new
    state that has the transaction
    [applied](https://prosemirror.net/docs/ref/#state.EditorState.apply). The callback will be bound to have
    the view instance as its `this` binding.
    */
    dispatchTransaction?: (tr: Transaction) => void;
  }

  /**
The type of object passed to
[`EditorState.create`](https://prosemirror.net/docs/ref/#state.EditorState^create).
*/
  interface EditorStateConfig {
    /**
    The schema to use (only relevant if no `doc` is specified).
    */
    schema?: Schema;
    /**
    The starting document. Either this or `schema` _must_ be
    provided.
    */
    doc?: Node$1;
    /**
    A valid selection in the document.
    */
    selection?: Selection;
    /**
    The initial set of [stored marks](https://prosemirror.net/docs/ref/#state.EditorState.storedMarks).
    */
    storedMarks?: readonly Mark[] | null;
    /**
    The plugins that should be active in this state.
    */
    plugins?: readonly Plugin[];
  }
  /**
The state of a ProseMirror editor is represented by an object of
this type. A state is a persistent data structure—it isn't
updated, but rather a new state value is computed from an old one
using the [`apply`](https://prosemirror.net/docs/ref/#state.EditorState.apply) method.

A state holds a number of built-in fields, and plugins can
[define](https://prosemirror.net/docs/ref/#state.PluginSpec.state) additional fields.
*/
  declare class EditorState {
    /**
    The current document.
    */
    doc: Node$1;
    /**
    The selection.
    */
    selection: Selection;
    /**
    A set of marks to apply to the next input. Will be null when
    no explicit marks have been set.
    */
    storedMarks: readonly Mark[] | null;
    /**
    The schema of the state's document.
    */
    get schema(): Schema;
    /**
    The plugins that are active in this state.
    */
    get plugins(): readonly Plugin[];
    /**
    Apply the given transaction to produce a new state.
    */
    apply(tr: Transaction): EditorState;
    /**
    Verbose variant of [`apply`](https://prosemirror.net/docs/ref/#state.EditorState.apply) that
    returns the precise transactions that were applied (which might
    be influenced by the [transaction
    hooks](https://prosemirror.net/docs/ref/#state.PluginSpec.filterTransaction) of
    plugins) along with the new state.
    */
    applyTransaction(rootTr: Transaction): {
      state: EditorState;
      transactions: readonly Transaction[];
    };
    /**
    Accessor that constructs and returns a new [transaction](https://prosemirror.net/docs/ref/#state.Transaction) from this state.
    */
    get tr(): Transaction;
    /**
    Create a new state.
    */
    static create(config: EditorStateConfig): EditorState;
    /**
    Create a new state based on this one, but with an adjusted set
    of active plugins. State fields that exist in both sets of
    plugins are kept unchanged. Those that no longer exist are
    dropped, and those that are new are initialized using their
    [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method, passing in the new
    configuration object..
    */
    reconfigure(config: {
      /**
        New set of active plugins.
        */
      plugins?: readonly Plugin[];
    }): EditorState;
    /**
    Serialize this state to JSON. If you want to serialize the state
    of plugins, pass an object mapping property names to use in the
    resulting JSON object to plugin objects. The argument may also be
    a string or number, in which case it is ignored, to support the
    way `JSON.stringify` calls `toString` methods.
    */
    toJSON(pluginFields?: { [propName: string]: Plugin }): any;
    /**
    Deserialize a JSON representation of a state. `config` should
    have at least a `schema` field, and should contain array of
    plugins to initialize the state with. `pluginFields` can be used
    to deserialize the state of plugins, by associating plugin
    instances with the property names they use in the JSON object.
    */
    static fromJSON(
      config: {
        /**
        The schema to use.
        */
        schema: Schema;
        /**
        The set of active plugins.
        */
        plugins?: readonly Plugin[];
      },
      json: any,
      pluginFields?: {
        [propName: string]: Plugin;
      },
    ): EditorState;
  }

  /**
This is the type passed to the [`Plugin`](https://prosemirror.net/docs/ref/#state.Plugin)
constructor. It provides a definition for a plugin.
*/
  interface PluginSpec<PluginState> {
    /**
    The [view props](https://prosemirror.net/docs/ref/#view.EditorProps) added by this plugin. Props
    that are functions will be bound to have the plugin instance as
    their `this` binding.
    */
    props?: EditorProps<Plugin<PluginState>>;
    /**
    Allows a plugin to define a [state field](https://prosemirror.net/docs/ref/#state.StateField), an
    extra slot in the state object in which it can keep its own data.
    */
    state?: StateField<PluginState>;
    /**
    Can be used to make this a keyed plugin. You can have only one
    plugin with a given key in a given state, but it is possible to
    access the plugin's configuration and state through the key,
    without having access to the plugin instance object.
    */
    key?: PluginKey;
    /**
    When the plugin needs to interact with the editor view, or
    set something up in the DOM, use this field. The function
    will be called when the plugin's state is associated with an
    editor view.
    */
    view?: (view: EditorView) => PluginView;
    /**
    When present, this will be called before a transaction is
    applied by the state, allowing the plugin to cancel it (by
    returning false).
    */
    filterTransaction?: (tr: Transaction, state: EditorState) => boolean;
    /**
    Allows the plugin to append another transaction to be applied
    after the given array of transactions. When another plugin
    appends a transaction after this was called, it is called again
    with the new state and new transactions—but only the new
    transactions, i.e. it won't be passed transactions that it
    already saw.
    */
    appendTransaction?: (
      transactions: readonly Transaction[],
      oldState: EditorState,
      newState: EditorState,
    ) => Transaction | null | undefined;
    /**
    Additional properties are allowed on plugin specs, which can be
    read via [`Plugin.spec`](https://prosemirror.net/docs/ref/#state.Plugin.spec).
    */
    [key: string]: any;
  }
  /**
A stateful object that can be installed in an editor by a
[plugin](https://prosemirror.net/docs/ref/#state.PluginSpec.view).
*/
  type PluginView = {
    /**
    Called whenever the view's state is updated.
    */
    update?: (view: EditorView, prevState: EditorState) => void;
    /**
    Called when the view is destroyed or receives a state
    with different plugins.
    */
    destroy?: () => void;
  };
  /**
Plugins bundle functionality that can be added to an editor.
They are part of the [editor state](https://prosemirror.net/docs/ref/#state.EditorState) and
may influence that state and the view that contains it.
*/
  declare class Plugin<PluginState = any> {
    /**
    The plugin's [spec object](https://prosemirror.net/docs/ref/#state.PluginSpec).
    */
    readonly spec: PluginSpec<PluginState>;
    /**
    Create a plugin.
    */
    constructor(
      /**
    The plugin's [spec object](https://prosemirror.net/docs/ref/#state.PluginSpec).
    */
      spec: PluginSpec<PluginState>,
    );
    /**
    The [props](https://prosemirror.net/docs/ref/#view.EditorProps) exported by this plugin.
    */
    readonly props: EditorProps<Plugin<PluginState>>;
    /**
    Extract the plugin's state field from an editor state.
    */
    getState(state: EditorState): PluginState | undefined;
  }
  /**
A plugin spec may provide a state field (under its
[`state`](https://prosemirror.net/docs/ref/#state.PluginSpec.state) property) of this type, which
describes the state it wants to keep. Functions provided here are
always called with the plugin instance as their `this` binding.
*/
  interface StateField<T> {
    /**
    Initialize the value of the field. `config` will be the object
    passed to [`EditorState.create`](https://prosemirror.net/docs/ref/#state.EditorState^create). Note
    that `instance` is a half-initialized state instance, and will
    not have values for plugin fields initialized after this one.
    */
    init: (config: EditorStateConfig, instance: EditorState) => T;
    /**
    Apply the given transaction to this state field, producing a new
    field value. Note that the `newState` argument is again a partially
    constructed state does not yet contain the state from plugins
    coming after this one.
    */
    apply: (
      tr: Transaction,
      value: T,
      oldState: EditorState,
      newState: EditorState,
    ) => T;
    /**
    Convert this field to JSON. Optional, can be left off to disable
    JSON serialization for the field.
    */
    toJSON?: (value: T) => any;
    /**
    Deserialize the JSON representation of this field. Note that the
    `state` argument is again a half-initialized state.
    */
    fromJSON?: (config: EditorStateConfig, value: any, state: EditorState) => T;
  }
  /**
A key is used to [tag](https://prosemirror.net/docs/ref/#state.PluginSpec.key) plugins in a way
that makes it possible to find them, given an editor state.
Assigning a key does mean only one plugin of that type can be
active in a state.
*/
  declare class PluginKey<PluginState = any> {
    /**
    Create a plugin key.
    */
    constructor(name?: string);
    /**
    Get the active plugin with this key, if any, from an editor
    state.
    */
    get(state: EditorState): Plugin<PluginState> | undefined;
    /**
    Get the plugin's state from an editor state.
    */
    getState(state: EditorState): PluginState | undefined;
  }

  /**
Commands are functions that take a state and a an optional
transaction dispatch function and...

 - determine whether they apply to this state
 - if not, return false
 - if `dispatch` was passed, perform their effect, possibly by
   passing a transaction to `dispatch`
 - return true

In some cases, the editor view is passed as a third argument.
*/
  type Command = (
    state: EditorState,
    dispatch?: (tr: Transaction) => void,
    view?: EditorView,
  ) => boolean;
  /**
An editor state transaction, which can be applied to a state to
create an updated state. Use
[`EditorState.tr`](https://prosemirror.net/docs/ref/#state.EditorState.tr) to create an instance.

Transactions track changes to the document (they are a subclass of
[`Transform`](https://prosemirror.net/docs/ref/#transform.Transform)), but also other state changes,
like selection updates and adjustments of the set of [stored
marks](https://prosemirror.net/docs/ref/#state.EditorState.storedMarks). In addition, you can store
metadata properties in a transaction, which are extra pieces of
information that client code or plugins can use to describe what a
transaction represents, so that they can update their [own
state](https://prosemirror.net/docs/ref/#state.StateField) accordingly.

The [editor view](https://prosemirror.net/docs/ref/#view.EditorView) uses a few metadata
properties: it will attach a property `"pointer"` with the value
`true` to selection transactions directly caused by mouse or touch
input, a `"composition"` property holding an ID identifying the
composition that caused it to transactions caused by composed DOM
input, and a `"uiEvent"` property of that may be `"paste"`,
`"cut"`, or `"drop"`.
*/
  declare class Transaction extends Transform {
    /**
    The timestamp associated with this transaction, in the same
    format as `Date.now()`.
    */
    time: number;
    private curSelection;
    private curSelectionFor;
    private updated;
    private meta;
    /**
    The stored marks set by this transaction, if any.
    */
    storedMarks: readonly Mark[] | null;
    /**
    The transaction's current selection. This defaults to the editor
    selection [mapped](https://prosemirror.net/docs/ref/#state.Selection.map) through the steps in the
    transaction, but can be overwritten with
    [`setSelection`](https://prosemirror.net/docs/ref/#state.Transaction.setSelection).
    */
    get selection(): Selection;
    /**
    Update the transaction's current selection. Will determine the
    selection that the editor gets when the transaction is applied.
    */
    setSelection(selection: Selection): this;
    /**
    Whether the selection was explicitly updated by this transaction.
    */
    get selectionSet(): boolean;
    /**
    Set the current stored marks.
    */
    setStoredMarks(marks: readonly Mark[] | null): this;
    /**
    Make sure the current stored marks or, if that is null, the marks
    at the selection, match the given set of marks. Does nothing if
    this is already the case.
    */
    ensureMarks(marks: readonly Mark[]): this;
    /**
    Add a mark to the set of stored marks.
    */
    addStoredMark(mark: Mark): this;
    /**
    Remove a mark or mark type from the set of stored marks.
    */
    removeStoredMark(mark: Mark | MarkType): this;
    /**
    Whether the stored marks were explicitly set for this transaction.
    */
    get storedMarksSet(): boolean;
    /**
    Update the timestamp for the transaction.
    */
    setTime(time: number): this;
    /**
    Replace the current selection with the given slice.
    */
    replaceSelection(slice: Slice): this;
    /**
    Replace the selection with the given node. When `inheritMarks` is
    true and the content is inline, it inherits the marks from the
    place where it is inserted.
    */
    replaceSelectionWith(node: Node$1, inheritMarks?: boolean): this;
    /**
    Delete the selection.
    */
    deleteSelection(): this;
    /**
    Replace the given range, or the selection if no range is given,
    with a text node containing the given string.
    */
    insertText(text: string, from?: number, to?: number): this;
    /**
    Store a metadata property in this transaction, keyed either by
    name or by plugin.
    */
    setMeta(key: string | Plugin | PluginKey, value: any): this;
    /**
    Retrieve a metadata property for a given name or plugin.
    */
    getMeta(key: string | Plugin | PluginKey): any;
    /**
    Returns true if this transaction doesn't contain any metadata,
    and can thus safely be extended.
    */
    get isGeneric(): boolean;
    /**
    Indicate that the editor should scroll the selection into view
    when updated to the state produced by this transaction.
    */
    scrollIntoView(): this;
    /**
    True when this transaction has had `scrollIntoView` called on it.
    */
    get scrolledIntoView(): boolean;
  }

  /**
Superclass for editor selections. Every selection type should
extend this. Should not be instantiated directly.
*/
  declare abstract class Selection {
    /**
    The resolved anchor of the selection (the side that stays in
    place when the selection is modified).
    */
    readonly $anchor: ResolvedPos;
    /**
    The resolved head of the selection (the side that moves when
    the selection is modified).
    */
    readonly $head: ResolvedPos;
    /**
    Initialize a selection with the head and anchor and ranges. If no
    ranges are given, constructs a single range across `$anchor` and
    `$head`.
    */
    constructor(
      /**
    The resolved anchor of the selection (the side that stays in
    place when the selection is modified).
    */
      $anchor: ResolvedPos,
      /**
    The resolved head of the selection (the side that moves when
    the selection is modified).
    */
      $head: ResolvedPos,
      ranges?: readonly SelectionRange[],
    );
    /**
    The ranges covered by the selection.
    */
    ranges: readonly SelectionRange[];
    /**
    The selection's anchor, as an unresolved position.
    */
    get anchor(): number;
    /**
    The selection's head.
    */
    get head(): number;
    /**
    The lower bound of the selection's main range.
    */
    get from(): number;
    /**
    The upper bound of the selection's main range.
    */
    get to(): number;
    /**
    The resolved lower  bound of the selection's main range.
    */
    get $from(): ResolvedPos;
    /**
    The resolved upper bound of the selection's main range.
    */
    get $to(): ResolvedPos;
    /**
    Indicates whether the selection contains any content.
    */
    get empty(): boolean;
    /**
    Test whether the selection is the same as another selection.
    */
    abstract eq(selection: Selection): boolean;
    /**
    Map this selection through a [mappable](https://prosemirror.net/docs/ref/#transform.Mappable)
    thing. `doc` should be the new document to which we are mapping.
    */
    abstract map(doc: Node$1, mapping: Mappable): Selection;
    /**
    Get the content of this selection as a slice.
    */
    content(): Slice;
    /**
    Replace the selection with a slice or, if no slice is given,
    delete the selection. Will append to the given transaction.
    */
    replace(tr: Transaction, content?: Slice): void;
    /**
    Replace the selection with the given node, appending the changes
    to the given transaction.
    */
    replaceWith(tr: Transaction, node: Node$1): void;
    /**
    Convert the selection to a JSON representation. When implementing
    this for a custom selection class, make sure to give the object a
    `type` property whose value matches the ID under which you
    [registered](https://prosemirror.net/docs/ref/#state.Selection^jsonID) your class.
    */
    abstract toJSON(): any;
    /**
    Find a valid cursor or leaf node selection starting at the given
    position and searching back if `dir` is negative, and forward if
    positive. When `textOnly` is true, only consider cursor
    selections. Will return null when no valid selection position is
    found.
    */
    static findFrom(
      $pos: ResolvedPos,
      dir: number,
      textOnly?: boolean,
    ): Selection | null;
    /**
    Find a valid cursor or leaf node selection near the given
    position. Searches forward first by default, but if `bias` is
    negative, it will search backwards first.
    */
    static near($pos: ResolvedPos, bias?: number): Selection;
    /**
    Find the cursor or leaf node selection closest to the start of
    the given document. Will return an
    [`AllSelection`](https://prosemirror.net/docs/ref/#state.AllSelection) if no valid position
    exists.
    */
    static atStart(doc: Node$1): Selection;
    /**
    Find the cursor or leaf node selection closest to the end of the
    given document.
    */
    static atEnd(doc: Node$1): Selection;
    /**
    Deserialize the JSON representation of a selection. Must be
    implemented for custom classes (as a static class method).
    */
    static fromJSON(doc: Node$1, json: any): Selection;
    /**
    To be able to deserialize selections from JSON, custom selection
    classes must register themselves with an ID string, so that they
    can be disambiguated. Try to pick something that's unlikely to
    clash with classes from other modules.
    */
    static jsonID(
      id: string,
      selectionClass: {
        fromJSON: (doc: Node$1, json: any) => Selection;
      },
    ): {
      fromJSON: (doc: Node$1, json: any) => Selection;
    };
    /**
    Get a [bookmark](https://prosemirror.net/docs/ref/#state.SelectionBookmark) for this selection,
    which is a value that can be mapped without having access to a
    current document, and later resolved to a real selection for a
    given document again. (This is used mostly by the history to
    track and restore old selections.) The default implementation of
    this method just converts the selection to a text selection and
    returns the bookmark for that.
    */
    getBookmark(): SelectionBookmark;
    /**
    Controls whether, when a selection of this type is active in the
    browser, the selected range should be visible to the user.
    Defaults to `true`.
    */
    visible: boolean;
  }
  /**
A lightweight, document-independent representation of a selection.
You can define a custom bookmark type for a custom selection class
to make the history handle it well.
*/
  interface SelectionBookmark {
    /**
    Map the bookmark through a set of changes.
    */
    map: (mapping: Mappable) => SelectionBookmark;
    /**
    Resolve the bookmark to a real selection again. This may need to
    do some error checking and may fall back to a default (usually
    [`TextSelection.between`](https://prosemirror.net/docs/ref/#state.TextSelection^between)) if
    mapping made the bookmark invalid.
    */
    resolve: (doc: Node$1) => Selection;
  }
  /**
Represents a selected range in a document.
*/
  declare class SelectionRange {
    /**
    The lower bound of the range.
    */
    readonly $from: ResolvedPos;
    /**
    The upper bound of the range.
    */
    readonly $to: ResolvedPos;
    /**
    Create a range.
    */
    constructor(
      /**
    The lower bound of the range.
    */
      $from: ResolvedPos,
      /**
    The upper bound of the range.
    */
      $to: ResolvedPos,
    );
  }
  /**
A text selection represents a classical editor selection, with a
head (the moving side) and anchor (immobile side), both of which
point into textblock nodes. It can be empty (a regular cursor
position).
*/
  declare class TextSelection extends Selection {
    /**
    Construct a text selection between the given points.
    */
    constructor($anchor: ResolvedPos, $head?: ResolvedPos);
    /**
    Returns a resolved position if this is a cursor selection (an
    empty text selection), and null otherwise.
    */
    get $cursor(): ResolvedPos | null;
    map(doc: Node$1, mapping: Mappable): Selection;
    replace(tr: Transaction, content?: Slice): void;
    eq(other: Selection): boolean;
    getBookmark(): TextBookmark;
    toJSON(): any;
    /**
    Create a text selection from non-resolved positions.
    */
    static create(doc: Node$1, anchor: number, head?: number): TextSelection;
    /**
    Return a text selection that spans the given positions or, if
    they aren't text positions, find a text selection near them.
    `bias` determines whether the method searches forward (default)
    or backwards (negative number) first. Will fall back to calling
    [`Selection.near`](https://prosemirror.net/docs/ref/#state.Selection^near) when the document
    doesn't contain a valid text position.
    */
    static between(
      $anchor: ResolvedPos,
      $head: ResolvedPos,
      bias?: number,
    ): Selection;
  }
  declare class TextBookmark {
    readonly anchor: number;
    readonly head: number;
    constructor(anchor: number, head: number);
    map(mapping: Mappable): TextBookmark;
    resolve(doc: Node$1): Selection;
  }
  /**
A node selection is a selection that points at a single node. All
nodes marked [selectable](https://prosemirror.net/docs/ref/#model.NodeSpec.selectable) can be the
target of a node selection. In such a selection, `from` and `to`
point directly before and after the selected node, `anchor` equals
`from`, and `head` equals `to`..
*/
  declare class NodeSelection extends Selection {
    /**
    Create a node selection. Does not verify the validity of its
    argument.
    */
    constructor($pos: ResolvedPos);
    /**
    The selected node.
    */
    node: Node$1;
    map(doc: Node$1, mapping: Mappable): Selection;
    content(): Slice;
    eq(other: Selection): boolean;
    toJSON(): any;
    getBookmark(): NodeBookmark;
    /**
    Create a node selection from non-resolved positions.
    */
    static create(doc: Node$1, from: number): NodeSelection;
    /**
    Determines whether the given node may be selected as a node
    selection.
    */
    static isSelectable(node: Node$1): boolean;
  }
  declare class NodeBookmark {
    readonly anchor: number;
    constructor(anchor: number);
    map(mapping: Mappable): TextBookmark | NodeBookmark;
    resolve(doc: Node$1): Selection | NodeSelection;
  }
  /**
A selection type that represents selecting the whole document
(which can not necessarily be expressed with a text selection, when
there are for example leaf block nodes at the start or end of the
document).
*/
  declare class AllSelection extends Selection {
    /**
    Create an all-selection over the given document.
    */
    constructor(doc: Node$1);
    replace(tr: Transaction, content?: Slice): void;
    toJSON(): any;
    map(doc: Node$1): AllSelection;
    eq(other: Selection): boolean;
    getBookmark(): {
      map(): any;
      resolve(doc: Node$1): AllSelection;
    };
  }

  /**
An ordered list [node spec](https://prosemirror.net/docs/ref/#model.NodeSpec). Has a single
attribute, `order`, which determines the number at which the list
starts counting, and defaults to 1. Represented as an `<ol>`
element.
*/
  declare const orderedList: NodeSpec;
  /**
A bullet list node spec, represented in the DOM as `<ul>`.
*/
  declare const bulletList: NodeSpec;
  /**
A list item (`<li>`) spec.
*/
  declare const listItem: NodeSpec;
  /**
Convenience function for adding list-related node types to a map
specifying the nodes for a schema. Adds
[`orderedList`](https://prosemirror.net/docs/ref/#schema-list.orderedList) as `"ordered_list"`,
[`bulletList`](https://prosemirror.net/docs/ref/#schema-list.bulletList) as `"bullet_list"`, and
[`listItem`](https://prosemirror.net/docs/ref/#schema-list.listItem) as `"list_item"`.

`itemContent` determines the content expression for the list items.
If you want the commands defined in this module to apply to your
list structure, it should have a shape like `"paragraph block*"` or
`"paragraph (ordered_list | bullet_list)*"`. `listGroup` can be
given to assign a group name to the list node types, for example
`"block"`.
*/
  declare function addListNodes(
    nodes: OrderedMap<NodeSpec>,
    itemContent: string,
    listGroup?: string,
  ): OrderedMap<NodeSpec>;
  /**
Returns a command function that wraps the selection in a list with
the given type an attributes. If `dispatch` is null, only return a
value to indicate whether this is possible, but don't actually
perform the change.
*/
  declare function wrapInList(
    listType: NodeType,
    attrs?: Attrs | null,
  ): Command;
  /**
Try to wrap the given node range in a list of the given type.
Return `true` when this is possible, `false` otherwise. When `tr`
is non-null, the wrapping is added to that transaction. When it is
`null`, the function only queries whether the wrapping is
possible.
*/
  declare function wrapRangeInList(
    tr: Transaction | null,
    range: NodeRange,
    listType: NodeType,
    attrs?: Attrs | null,
  ): boolean;
  /**
Build a command that splits a non-empty textblock at the top level
of a list item by also splitting that list item.
*/
  declare function splitListItem(
    itemType: NodeType,
    itemAttrs?: Attrs,
  ): Command;
  /**
Acts like [`splitListItem`](https://prosemirror.net/docs/ref/#schema-list.splitListItem), but
without resetting the set of active marks at the cursor.
*/
  declare function splitListItemKeepMarks(
    itemType: NodeType,
    itemAttrs?: Attrs,
  ): Command;
  /**
Create a command to lift the list item around the selection up into
a wrapping list.
*/
  declare function liftListItem(itemType: NodeType): Command;
  /**
Create a command to sink the list item around the selection down
into an inner list.
*/
  declare function sinkListItem(itemType: NodeType): Command;

  /**
Delete the selection, if there is one.
*/
  declare const deleteSelection: Command;
  /**
If the selection is empty and at the start of a textblock, try to
reduce the distance between that block and the one before it—if
there's a block directly before it that can be joined, join them.
If not, try to move the selected block closer to the next one in
the document structure by lifting it out of its parent or moving it
into a parent of the previous block. Will use the view for accurate
(bidi-aware) start-of-textblock detection if given.
*/
  declare const joinBackward: Command;
  /**
A more limited form of [`joinBackward`](https://prosemirror.net/docs/ref/#commands.joinBackward)
that only tries to join the current textblock to the one before
it, if the cursor is at the start of a textblock.
*/
  declare const joinTextblockBackward: Command;
  /**
A more limited form of [`joinForward`](https://prosemirror.net/docs/ref/#commands.joinForward)
that only tries to join the current textblock to the one after
it, if the cursor is at the end of a textblock.
*/
  declare const joinTextblockForward: Command;
  /**
When the selection is empty and at the start of a textblock, select
the node before that textblock, if possible. This is intended to be
bound to keys like backspace, after
[`joinBackward`](https://prosemirror.net/docs/ref/#commands.joinBackward) or other deleting
commands, as a fall-back behavior when the schema doesn't allow
deletion at the selected point.
*/
  declare const selectNodeBackward: Command;
  /**
If the selection is empty and the cursor is at the end of a
textblock, try to reduce or remove the boundary between that block
and the one after it, either by joining them or by moving the other
block closer to this one in the tree structure. Will use the view
for accurate start-of-textblock detection if given.
*/
  declare const joinForward: Command;
  /**
When the selection is empty and at the end of a textblock, select
the node coming after that textblock, if possible. This is intended
to be bound to keys like delete, after
[`joinForward`](https://prosemirror.net/docs/ref/#commands.joinForward) and similar deleting
commands, to provide a fall-back behavior when the schema doesn't
allow deletion at the selected point.
*/
  declare const selectNodeForward: Command;
  /**
Join the selected block or, if there is a text selection, the
closest ancestor block of the selection that can be joined, with
the sibling above it.
*/
  declare const joinUp: Command;
  /**
Join the selected block, or the closest ancestor of the selection
that can be joined, with the sibling after it.
*/
  declare const joinDown: Command;
  /**
Lift the selected block, or the closest ancestor block of the
selection that can be lifted, out of its parent node.
*/
  declare const lift: Command;
  /**
If the selection is in a node whose type has a truthy
[`code`](https://prosemirror.net/docs/ref/#model.NodeSpec.code) property in its spec, replace the
selection with a newline character.
*/
  declare const newlineInCode: Command;
  /**
When the selection is in a node with a truthy
[`code`](https://prosemirror.net/docs/ref/#model.NodeSpec.code) property in its spec, create a
default block after the code block, and move the cursor there.
*/
  declare const exitCode: Command;
  /**
If a block node is selected, create an empty paragraph before (if
it is its parent's first child) or after it.
*/
  declare const createParagraphNear: Command;
  /**
If the cursor is in an empty textblock that can be lifted, lift the
block.
*/
  declare const liftEmptyBlock: Command;
  /**
Create a variant of [`splitBlock`](https://prosemirror.net/docs/ref/#commands.splitBlock) that uses
a custom function to determine the type of the newly split off block.
*/
  declare function splitBlockAs(
    splitNode?: (
      node: Node$1,
      atEnd: boolean,
      $from: ResolvedPos,
    ) => {
      type: NodeType;
      attrs?: Attrs;
    } | null,
  ): Command;
  /**
Split the parent block of the selection. If the selection is a text
selection, also delete its content.
*/
  declare const splitBlock: Command;
  /**
Acts like [`splitBlock`](https://prosemirror.net/docs/ref/#commands.splitBlock), but without
resetting the set of active marks at the cursor.
*/
  declare const splitBlockKeepMarks: Command;
  /**
Move the selection to the node wrapping the current selection, if
any. (Will not select the document node.)
*/
  declare const selectParentNode: Command;
  /**
Select the whole document.
*/
  declare const selectAll: Command;
  /**
Moves the cursor to the start of current text block.
*/
  declare const selectTextblockStart: Command;
  /**
Moves the cursor to the end of current text block.
*/
  declare const selectTextblockEnd: Command;
  /**
Wrap the selection in a node of the given type with the given
attributes.
*/
  declare function wrapIn(nodeType: NodeType, attrs?: Attrs | null): Command;
  /**
Returns a command that tries to set the selected textblocks to the
given node type with the given attributes.
*/
  declare function setBlockType(
    nodeType: NodeType,
    attrs?: Attrs | null,
  ): Command;
  /**
Create a command function that toggles the given mark with the
given attributes. Will return `false` when the current selection
doesn't support that mark. This will remove the mark if any marks
of that type exist in the selection, or add it otherwise. If the
selection is empty, this applies to the [stored
marks](https://prosemirror.net/docs/ref/#state.EditorState.storedMarks) instead of a range of the
document.
*/
  declare function toggleMark(
    markType: MarkType,
    attrs?: Attrs | null,
    options?: {
      /**
    Controls whether, when part of the selected range has the mark
    already and part doesn't, the mark is removed (`true`, the
    default) or added (`false`).
    */
      removeWhenPresent?: boolean;
      /**
    When set to false, this will prevent the command from acting on
    the content of inline nodes marked as
    [atoms](https://prosemirror.net/docs/ref/#model.NodeSpec.atom) that are completely covered by a
    selection range.
    */
      enterInlineAtoms?: boolean;
      /**
    By default, this command doesn't apply to leading and trailing
    whitespace in the selection. Set this to `true` to change that.
    */
      includeWhitespace?: boolean;
    },
  ): Command;
  /**
Wrap a command so that, when it produces a transform that causes
two joinable nodes to end up next to each other, those are joined.
Nodes are considered joinable when they are of the same type and
when the `isJoinable` predicate returns true for them or, if an
array of strings was passed, if their node type name is in that
array.
*/
  declare function autoJoin(
    command: Command,
    isJoinable:
      | ((before: Node$1, after: Node$1) => boolean)
      | readonly string[],
  ): Command;
  /**
Combine a number of command functions into a single function (which
calls them one by one until one returns true).
*/
  declare function chainCommands(...commands: readonly Command[]): Command;
  /**
A basic keymap containing bindings not specific to any schema.
Binds the following keys (when multiple commands are listed, they
are chained with [`chainCommands`](https://prosemirror.net/docs/ref/#commands.chainCommands)):

* **Enter** to `newlineInCode`, `createParagraphNear`, `liftEmptyBlock`, `splitBlock`
* **Mod-Enter** to `exitCode`
* **Backspace** and **Mod-Backspace** to `deleteSelection`, `joinBackward`, `selectNodeBackward`
* **Delete** and **Mod-Delete** to `deleteSelection`, `joinForward`, `selectNodeForward`
* **Mod-Delete** to `deleteSelection`, `joinForward`, `selectNodeForward`
* **Mod-a** to `selectAll`
*/
  declare const pcBaseKeymap: {
    [key: string]: Command;
  };
  /**
A copy of `pcBaseKeymap` that also binds **Ctrl-h** like Backspace,
**Ctrl-d** like Delete, **Alt-Backspace** like Ctrl-Backspace, and
**Ctrl-Alt-Backspace**, **Alt-Delete**, and **Alt-d** like
Ctrl-Delete.
*/
  declare const macBaseKeymap: {
    [key: string]: Command;
  };
  /**
Depending on the detected platform, this will hold
[`pcBasekeymap`](https://prosemirror.net/docs/ref/#commands.pcBaseKeymap) or
[`macBaseKeymap`](https://prosemirror.net/docs/ref/#commands.macBaseKeymap).
*/
  declare const baseKeymap: {
    [key: string]: Command;
  };

  /**
Create a keymap plugin for the given set of bindings.

Bindings should map key names to [command](https://prosemirror.net/docs/ref/#commands)-style
functions, which will be called with `(EditorState, dispatch,
EditorView)` arguments, and should return true when they've handled
the key. Note that the view argument isn't part of the command
protocol, but can be used as an escape hatch if a binding needs to
directly interact with the UI.

Key names may be strings like `"Shift-Ctrl-Enter"`—a key
identifier prefixed with zero or more modifiers. Key identifiers
are based on the strings that can appear in
[`KeyEvent.key`](https:developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
Use lowercase letters to refer to letter keys (or uppercase letters
if you want shift to be held). You may use `"Space"` as an alias
for the `" "` name.

Modifiers can be given in any order. `Shift-` (or `s-`), `Alt-` (or
`a-`), `Ctrl-` (or `c-` or `Control-`) and `Cmd-` (or `m-` or
`Meta-`) are recognized. For characters that are created by holding
shift, the `Shift-` prefix is implied, and should not be added
explicitly.

You can use `Mod-` as a shorthand for `Cmd-` on Mac and `Ctrl-` on
other platforms.

You can add multiple keymap plugins to an editor. The order in
which they appear determines their precedence (the ones early in
the array get to dispatch first).
*/
  declare function keymap(bindings: { [key: string]: Command }): Plugin;
  /**
Given a set of bindings (using the same format as
[`keymap`](https://prosemirror.net/docs/ref/#keymap.keymap)), return a [keydown
handler](https://prosemirror.net/docs/ref/#view.EditorProps.handleKeyDown) that handles them.
*/
  declare function keydownHandler(bindings: {
    [key: string]: Command;
  }): (view: EditorView, event: KeyboardEvent) => boolean;

  /**
Set a flag on the given transaction that will prevent further steps
from being appended to an existing history event (so that they
require a separate undo command to undo).
*/
  declare function closeHistory(tr: Transaction): Transaction;
  interface HistoryOptions {
    /**
    The amount of history events that are collected before the
    oldest events are discarded. Defaults to 100.
    */
    depth?: number;
    /**
    The delay between changes after which a new group should be
    started. Defaults to 500 (milliseconds). Note that when changes
    aren't adjacent, a new group is always started.
    */
    newGroupDelay?: number;
  }
  /**
Returns a plugin that enables the undo history for an editor. The
plugin will track undo and redo stacks, which can be used with the
[`undo`](https://prosemirror.net/docs/ref/#history.undo) and [`redo`](https://prosemirror.net/docs/ref/#history.redo) commands.

You can set an `"addToHistory"` [metadata
property](https://prosemirror.net/docs/ref/#state.Transaction.setMeta) of `false` on a transaction
to prevent it from being rolled back by undo.
*/
  declare function history(config?: HistoryOptions): Plugin;
  /**
A command function that undoes the last change, if any.
*/
  declare const undo: Command;
  /**
A command function that redoes the last undone change, if any.
*/
  declare const redo: Command;
  /**
A command function that undoes the last change. Don't scroll the
selection into view.
*/
  declare const undoNoScroll: Command;
  /**
A command function that redoes the last undone change. Don't
scroll the selection into view.
*/
  declare const redoNoScroll: Command;
  /**
The amount of undoable events available in a given state.
*/
  declare function undoDepth(state: EditorState): any;
  /**
The amount of redoable events available in a given editor state.
*/
  declare function redoDepth(state: EditorState): any;
  /**
Returns true if the given transaction was generated by the history
plugin.
*/
  declare function isHistoryTransaction(tr: Transaction): boolean;

  /**
Input rules are regular expressions describing a piece of text
that, when typed, causes something to happen. This might be
changing two dashes into an emdash, wrapping a paragraph starting
with `"> "` into a blockquote, or something entirely different.
*/
  declare class InputRule {
    inCode: boolean | "only";
    inCodeMark: boolean | "only";
    /**
    Create an input rule. The rule applies when the user typed
    something and the text directly in front of the cursor matches
    `match`, which should end with `$`.
    
    The `handler` can be a string, in which case the matched text, or
    the first matched group in the regexp, is replaced by that
    string.
    
    Or a it can be a function, which will be called with the match
    array produced by
    [`RegExp.exec`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec),
    as well as the start and end of the matched range, and which can
    return a [transaction](https://prosemirror.net/docs/ref/#state.Transaction) that describes the
    rule's effect, or null to indicate the input was not handled.
    */
    constructor(
      /**
    @internal
    */
      match: RegExp,
      handler:
        | string
        | ((
            state: EditorState,
            match: RegExpMatchArray,
            start: number,
            end: number,
          ) => Transaction | null),
      options?: {
        /**
        When set to false,
        [`undoInputRule`](https://prosemirror.net/docs/ref/#inputrules.undoInputRule) doesn't work on
        this rule.
        */
        undoable?: boolean;
        /**
        By default, input rules will not apply inside nodes marked
        as [code](https://prosemirror.net/docs/ref/#model.NodeSpec.code). Set this to true to change
        that, or to `"only"` to _only_ match in such nodes.
        */
        inCode?: boolean | "only";
        /**
        When set to `false`, this rule will not fire inside marks
        marked as [code](https://prosemirror.net/docs/ref/#model.MarkSpec.code). The default is
        `true`.
        */
        inCodeMark?: boolean;
      },
    );
  }
  type PluginState = {
    transform: Transaction;
    from: number;
    to: number;
    text: string;
  } | null;
  /**
Create an input rules plugin. When enabled, it will cause text
input that matches any of the given rules to trigger the rule's
action.
*/
  declare function inputRules({
    rules,
  }: {
    rules: readonly InputRule[];
  }): Plugin<PluginState>;
  /**
This is a command that will undo an input rule, if applying such a
rule was the last thing that the user did.
*/
  declare const undoInputRule: Command;

  /**
Converts double dashes to an emdash.
*/
  declare const emDash: InputRule;
  /**
Converts three dots to an ellipsis character.
*/
  declare const ellipsis: InputRule;
  /**
“Smart” opening double quotes.
*/
  declare const openDoubleQuote: InputRule;
  /**
“Smart” closing double quotes.
*/
  declare const closeDoubleQuote: InputRule;
  /**
“Smart” opening single quotes.
*/
  declare const openSingleQuote: InputRule;
  /**
“Smart” closing single quotes.
*/
  declare const closeSingleQuote: InputRule;
  /**
Smart-quote related input rules.
*/
  declare const smartQuotes: readonly InputRule[];

  /**
Build an input rule for automatically wrapping a textblock when a
given string is typed. The `regexp` argument is
directly passed through to the `InputRule` constructor. You'll
probably want the regexp to start with `^`, so that the pattern can
only occur at the start of a textblock.

`nodeType` is the type of node to wrap in. If it needs attributes,
you can either pass them directly, or pass a function that will
compute them from the regular expression match.

By default, if there's a node with the same type above the newly
wrapped node, the rule will try to [join](https://prosemirror.net/docs/ref/#transform.Transform.join) those
two nodes. You can pass a join predicate, which takes a regular
expression match and the node before the wrapped node, and can
return a boolean to indicate whether a join should happen.
*/
  declare function wrappingInputRule(
    regexp: RegExp,
    nodeType: NodeType,
    getAttrs?: Attrs | null | ((matches: RegExpMatchArray) => Attrs | null),
    joinPredicate?: (match: RegExpMatchArray, node: Node$1) => boolean,
  ): InputRule;
  /**
Build an input rule that changes the type of a textblock when the
matched text is typed into it. You'll usually want to start your
regexp with `^` to that it is only matched at the start of a
textblock. The optional `getAttrs` parameter can be used to compute
the new node's attributes, and works the same as in the
`wrappingInputRule` function.
*/
  declare function textblockTypeInputRule(
    regexp: RegExp,
    nodeType: NodeType,
    getAttrs?: Attrs | null | ((match: RegExpMatchArray) => Attrs | null),
  ): InputRule;

  /**
The types defined in this module aren't the only thing you can
display in your menu. Anything that conforms to this interface can
be put into a menu structure.
*/
  interface MenuElement {
    /**
    Render the element for display in the menu. Must return a DOM
    element and a function that can be used to update the element to
    a new state. The `update` function must return false if the
    update hid the entire element.
    */
    render(pm: EditorView): {
      dom: HTMLElement;
      update: (state: EditorState) => boolean;
    };
  }
  /**
An icon or label that, when clicked, executes a command.
*/
  declare class MenuItem implements MenuElement {
    /**
    The spec used to create this item.
    */
    readonly spec: MenuItemSpec;
    /**
    Create a menu item.
    */
    constructor(
      /**
    The spec used to create this item.
    */
      spec: MenuItemSpec,
    );
    /**
    Renders the icon according to its [display
    spec](https://prosemirror.net/docs/ref/#menu.MenuItemSpec.display), and adds an event handler which
    executes the command when the representation is clicked.
    */
    render(view: EditorView): {
      dom: HTMLElement;
      update: (state: EditorState) => boolean;
    };
  }
  /**
Specifies an icon. May be either an SVG icon, in which case its
`path` property should be an [SVG path
spec](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d),
and `width` and `height` should provide the viewbox in which that
path exists. Alternatively, it may have a `text` property
specifying a string of text that makes up the icon, with an
optional `css` property giving additional CSS styling for the
text. _Or_ it may contain `dom` property containing a DOM node.
*/
  type IconSpec =
    | {
        path: string;
        width: number;
        height: number;
      }
    | {
        text: string;
        css?: string;
      }
    | {
        dom: Node;
      };
  /**
The configuration object passed to the `MenuItem` constructor.
*/
  interface MenuItemSpec {
    /**
    The function to execute when the menu item is activated.
    */
    run: (
      state: EditorState,
      dispatch: (tr: Transaction) => void,
      view: EditorView,
      event: Event,
    ) => void;
    /**
    Optional function that is used to determine whether the item is
    appropriate at the moment. Deselected items will be hidden.
    */
    select?: (state: EditorState) => boolean;
    /**
    Function that is used to determine if the item is enabled. If
    given and returning false, the item will be given a disabled
    styling.
    */
    enable?: (state: EditorState) => boolean;
    /**
    A predicate function to determine whether the item is 'active' (for
    example, the item for toggling the strong mark might be active then
    the cursor is in strong text).
    */
    active?: (state: EditorState) => boolean;
    /**
    A function that renders the item. You must provide either this,
    [`icon`](https://prosemirror.net/docs/ref/#menu.MenuItemSpec.icon), or [`label`](https://prosemirror.net/docs/ref/#MenuItemSpec.label).
    */
    render?: (view: EditorView) => HTMLElement;
    /**
    Describes an icon to show for this item.
    */
    icon?: IconSpec;
    /**
    Makes the item show up as a text label. Mostly useful for items
    wrapped in a [drop-down](https://prosemirror.net/docs/ref/#menu.Dropdown) or similar menu. The object
    should have a `label` property providing the text to display.
    */
    label?: string;
    /**
    Defines DOM title (mouseover) text for the item.
    */
    title?: string | ((state: EditorState) => string);
    /**
    Optionally adds a CSS class to the item's DOM representation.
    */
    class?: string;
    /**
    Optionally adds a string of inline CSS to the item's DOM
    representation.
    */
    css?: string;
  }
  /**
A drop-down menu, displayed as a label with a downwards-pointing
triangle to the right of it.
*/
  declare class Dropdown implements MenuElement {
    /**
    Create a dropdown wrapping the elements.
    */
    constructor(
      content: readonly MenuElement[] | MenuElement,
      /**
    @internal
    */
      options?: {
        /**
        The label to show on the drop-down control.
        */
        label?: string;
        /**
        Sets the
        [`title`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/title)
        attribute given to the menu control.
        */
        title?: string;
        /**
        When given, adds an extra CSS class to the menu control.
        */
        class?: string;
        /**
        When given, adds an extra set of CSS styles to the menu control.
        */
        css?: string;
      },
    );
    /**
    Render the dropdown menu and sub-items.
    */
    render(view: EditorView): {
      dom: HTMLElement;
      update: (state: EditorState) => boolean;
    };
  }
  /**
Represents a submenu wrapping a group of elements that start
hidden and expand to the right when hovered over or tapped.
*/
  declare class DropdownSubmenu implements MenuElement {
    /**
    Creates a submenu for the given group of menu elements. The
    following options are recognized:
    */
    constructor(
      content: readonly MenuElement[] | MenuElement,
      /**
    @internal
    */
      options?: {
        /**
        The label to show on the submenu.
        */
        label?: string;
      },
    );
    /**
    Renders the submenu.
    */
    render(view: EditorView): {
      dom: HTMLElement;
      update: (state: EditorState) => boolean;
    };
  }
  /**
Render the given, possibly nested, array of menu elements into a
document fragment, placing separators between them (and ensuring no
superfluous separators appear when some of the groups turn out to
be empty).
*/
  declare function renderGrouped(
    view: EditorView,
    content: readonly (readonly MenuElement[])[],
  ): {
    dom: DocumentFragment;
    update: (state: EditorState) => boolean;
  };
  /**
A set of basic editor-related icons. Contains the properties
`join`, `lift`, `selectParentNode`, `undo`, `redo`, `strong`, `em`,
`code`, `link`, `bulletList`, `orderedList`, and `blockquote`, each
holding an object that can be used as the `icon` option to
`MenuItem`.
*/
  declare const icons: {
    [name: string]: IconSpec;
  };
  /**
Menu item for the `joinUp` command.
*/
  declare const joinUpItem: MenuItem;
  /**
Menu item for the `lift` command.
*/
  declare const liftItem: MenuItem;
  /**
Menu item for the `selectParentNode` command.
*/
  declare const selectParentNodeItem: MenuItem;
  /**
Menu item for the `undo` command.
*/
  declare let undoItem: MenuItem;
  /**
Menu item for the `redo` command.
*/
  declare let redoItem: MenuItem;
  /**
Build a menu item for wrapping the selection in a given node type.
Adds `run` and `select` properties to the ones present in
`options`. `options.attrs` may be an object that provides
attributes for the wrapping node.
*/
  declare function wrapItem(
    nodeType: NodeType,
    options: Partial<MenuItemSpec> & {
      attrs?: Attrs | null;
    },
  ): MenuItem;
  /**
Build a menu item for changing the type of the textblock around the
selection to the given type. Provides `run`, `active`, and `select`
properties. Others must be given in `options`. `options.attrs` may
be an object to provide the attributes for the textblock node.
*/
  declare function blockTypeItem(
    nodeType: NodeType,
    options: Partial<MenuItemSpec> & {
      attrs?: Attrs | null;
    },
  ): MenuItem;

  /**
A plugin that will place a menu bar above the editor. Note that
this involves wrapping the editor in an additional `<div>`.
*/
  declare function menuBar(options: {
    /**
    Provides the content of the menu, as a nested array to be
    passed to `renderGrouped`.
    */
    content: readonly (readonly MenuElement[])[];
    /**
    Determines whether the menu floats, i.e. whether it sticks to
    the top of the viewport when the editor is partially scrolled
    out of view.
    */
    floating?: boolean;
  }): Plugin;

  export {
    AddMarkStep,
    AddNodeMarkStep,
    AllSelection,
    AttrStep,
    ContentMatch,
    DOMParser,
    DOMSerializer,
    Decoration,
    DecorationSet,
    DocAttrStep,
    Dropdown,
    DropdownSubmenu,
    EditorState,
    EditorView,
    Fragment,
    InputRule,
    MapResult,
    Mapping,
    Mark,
    MarkType,
    MenuItem,
    Node$1 as Node,
    NodeRange,
    NodeSelection,
    NodeType,
    Plugin,
    PluginKey,
    RemoveMarkStep,
    RemoveNodeMarkStep,
    ReplaceAroundStep,
    ReplaceError,
    ReplaceStep,
    ResolvedPos,
    Schema,
    Selection,
    SelectionRange,
    Slice,
    Step,
    StepMap,
    StepResult,
    TextSelection,
    Transaction,
    Transform,
    addListNodes,
    autoJoin,
    baseKeymap,
    blockTypeItem,
    bulletList,
    canJoin,
    canSplit,
    chainCommands,
    closeDoubleQuote,
    closeHistory,
    closeSingleQuote,
    createParagraphNear,
    deleteSelection,
    dropPoint,
    ellipsis,
    emDash,
    exitCode,
    findWrapping,
    history,
    icons,
    inputRules,
    insertPoint,
    isHistoryTransaction,
    joinBackward,
    joinDown,
    joinForward,
    joinPoint,
    joinTextblockBackward,
    joinTextblockForward,
    joinUp,
    joinUpItem,
    keydownHandler,
    keymap,
    lift,
    liftEmptyBlock,
    liftItem,
    liftListItem,
    liftTarget,
    listItem,
    macBaseKeymap,
    marks,
    menuBar,
    newlineInCode,
    nodes,
    openDoubleQuote,
    openSingleQuote,
    orderedList,
    pcBaseKeymap,
    redo,
    redoDepth,
    redoItem,
    redoNoScroll,
    renderGrouped,
    replaceStep,
    schema,
    selectAll,
    selectNodeBackward,
    selectNodeForward,
    selectParentNode,
    selectParentNodeItem,
    selectTextblockEnd,
    selectTextblockStart,
    setBlockType,
    sinkListItem,
    smartQuotes,
    splitBlock,
    splitBlockAs,
    splitBlockKeepMarks,
    splitListItem,
    splitListItemKeepMarks,
    textblockTypeInputRule,
    toggleMark,
    undo,
    undoDepth,
    undoInputRule,
    undoItem,
    undoNoScroll,
    wrapIn,
    wrapInList,
    wrapItem,
    wrapRangeInList,
    wrappingInputRule,
  };
  export type {
    AttributeSpec,
    Attrs,
    Child,
    Command,
    DOMEventMap,
    DOMOutputSpec,
    DecorationAttrs,
    DecorationSource,
    DirectEditorProps,
    EditorProps,
    EditorStateConfig,
    GenericParseRule,
    IconSpec,
    Mappable,
    MarkSpec,
    MarkView,
    MarkViewConstructor,
    MenuElement,
    MenuItemSpec,
    NodeSpec,
    NodeView,
    NodeViewConstructor,
    ParseOptions,
    ParseRule,
    PluginSpec,
    PluginView,
    SchemaSpec,
    SelectionBookmark,
    StateField,
    StyleParseRule,
    TagParseRule,
    ViewMutationRecord,
  };

  // export as namespace ProsemirrorMod;
}
