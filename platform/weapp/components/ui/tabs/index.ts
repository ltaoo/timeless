import { TabHeaderCore } from "@/domains/ui/tab-header/index";

Component({
  externalClasses: ["tab-class", "item-class", "active-item-class"],
  options: {
    virtualHost: true,
    addGlobalClass: true,
  },
  properties: {
    _store: {
      type: null,
      observer(store: TabHeaderCore<{ key: string; options: { id: string; text: string }[] }>) {
        if (this.mounted) {
          return;
        }
        this.mounted = true;
        const { tabs } = store;
        console.log("[COMPONENT]ui/tabs - _store observer", tabs);
        this.setData({
          options: tabs,
        });
        store.onStateChange((v) => {
          // const {  } = v;
          // console.log('[]values change', nextValues.selectedTabIndex);
          // this.triggerEvent("change", {
          //   index: selectedTabIndex,
          //   item: selectedTab,
          // });
        });
        store.onLinePositionChange((v) => {
          this.setData({
            left: v.left,
            showLine: true,
          });
        });
        // store.onMounted((v) => {
        //   this.setData({
        //     showLine: true,
        //   });
        // });
        // store.onScroll((instance) => {
        //   this.scrollTo(instance);
        // });
      },
    },
    /** 非选中状态下的样式 */
    itemStyle: {
      type: String,
      value: "",
    },
    /** 选中项的样式 */
    activeItemStyle: {
      type: String,
      value: "",
    },
    style: {
      type: String,
      value: "",
    },
    /** 是否要滚动动画 */
    scrollWithAnimation: {
      type: Boolean,
      value: true,
    },
    wrapHeight: {
      type: Number,
      value: 80,
    },
  },
  data: {
    options: [],
    left: 0,
    showLine: false,
  },
  mounted: false,
  created() {},
  methods: {
    query(selector: string): Promise<{ width: number; height: number; left: number }> {
      return new Promise((resolve) => {
        this.createSelectorQuery()
          .select(selector)
          .boundingClientRect((rect: { width: number; height: number; left: number }) => {
            resolve(rect);
          })
          .exec();
      });
    },
    handleChange(e: { currentTarget: { dataset: { index: number } } }) {
      const { index } = e.currentTarget.dataset;
      const store = this.data._store as TabHeaderCore<{ key: string; options: { id: string; text: string }[] }>;
      store.select(index);
    },
    /** 横向滚动到指定位置 */
    scrollTo(scrollLeft) {
      if (typeof scrollLeft === "number") {
        this.setData({
          scrollLeftInset: scrollLeft,
        });
      }
    },
    async updateContainer() {
      const id = "tabs-outer";
      const client = await this.query(`#${id}`);
      const { width, height, left } = client;
      // console.log('[] - setContainer', client);
      const store = this.data._store as TabHeaderCore<{ key: string; options: { id: string; text: string }[] }>;
      store.updateContainerClient({
        width,
        height,
        left,
      });
    },
    async updateTab(event) {
      const {
        dataset: { id, index },
      } = event.currentTarget;
      const client = await this.query(`#${id}`);
      console.log("[COMPONENT]ui/tabs - setTab", client);
      const { width, height, left } = client;
      const store = this.data._store as TabHeaderCore<{ key: string; options: { id: string; text: string }[] }>;
      store.updateTabClient(index, {
        width,
        height,
        left,
      });
    },
  },
});
