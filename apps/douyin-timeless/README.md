# Douyin Timeless

使用 Timeless 的 store-driven view/model 架构复刻移动端抖音核心体验。

```bash
pnpm --filter @timeless/douyin-timeless dev
pnpm --filter @timeless/douyin-timeless build
```

页面均采用 `*.model.js`（状态、行为）与 `*.js`（无状态视图）组合。项目包含推荐视频上下滑动、播放控制、点赞/收藏/关注、评论与分享面板、经验瀑布流、商城和商品详情、发布页、消息/聊天、个人主页及作者主页。

视觉素材、兼容格式演示视频和演示数据来自用户指定的 `douyin-vue` 参考项目，仅用于学习与研究；原项目采用 GPL 许可证。
