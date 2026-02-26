// export * from "crelt";
// export * from "prosemirror-model";
// export * from "prosemirror-schema-basic";
// export * from "prosemirror-schema-list";
// export * from "prosemirror-commands";
// export * from "prosemirror-keymap";
// export * from "prosemirror-history";
// export * from "prosemirror-inputrules";
// export * from "prosemirror-transform";
// export * from "prosemirror-menu";
// export * from "prosemirror-view";
// export * from "prosemirror-state";

import * as crelt from "crelt";
import * as prosemirrorModel from "prosemirror-model";
import * as prosemirrorSchemaBasic from "prosemirror-schema-basic";
import * as prosemirrorSchemaList from "prosemirror-schema-list";
import * as prosemirrorCommands from "prosemirror-commands";
import * as prosemirrorKeymap from "prosemirror-keymap";
import * as prosemirrorHistory from "prosemirror-history";
import * as prosemirrorInputrules from "prosemirror-inputrules";
import * as prosemirrorTransform from "prosemirror-transform";
import * as prosemirrorMenu from "prosemirror-menu";
import * as prosemirrorView from "prosemirror-view";
import * as prosemirrorState from "prosemirror-state";

const ProsemirrorMod = {
  ...crelt,
  ...prosemirrorModel,
  ...prosemirrorSchemaBasic,
  ...prosemirrorSchemaList,
  ...prosemirrorCommands,
  ...prosemirrorKeymap,
  ...prosemirrorHistory,
  ...prosemirrorInputrules,
  ...prosemirrorTransform,
  ...prosemirrorMenu,
  ...prosemirrorView,
  ...prosemirrorState,
};

export default ProsemirrorMod;
