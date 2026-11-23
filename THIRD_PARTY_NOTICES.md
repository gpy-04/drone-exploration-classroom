# 参考与第三方说明

## 用户指定的架构参考

https://github.com/gpy-04/smart-driving-exploration-classroom

参考其当前课堂的浅色科学展册、顶部章节、左活动目录、中央模型、右侧四步工作台和本机学习记录的组织方式。内容改为用户提供的无人机模型、八关游戏、无人机历史与动漫杭州第一视角巡航。

## 接入的用户项目

- https://github.com/gpy-04/rotor05-drone-teardown：四旋翼与固定翼结构页面。
- https://github.com/gpy-04/drone-flight-lab-2d：八关 2D 科普游戏。

课堂构建只生成集成副本。原有实验引擎、模型、科学依据和资源说明保留在副本中；独立打开实验可以使用其原版界面。八关的照片、字体和视频来源继续由游戏自身的“图片与科学依据”说明提供。并未为这些原有素材重新声明统一许可。

## Three.js

新巡航场景使用 Three.js 0.186.1 及 BufferGeometryUtils，MIT。完整许可随构建写入 `experiments/THREE-LICENSE.txt`；离线游戏包含打包代码的许可注释。旧结构模型使用其自身内置的 Three.js 与 teardown 衍生框架，原声明保留。

## 中国无人机历史与真实照片

博物馆采用连续滚动时间线。六张照片均为真实影像，不使用 AI 生成图或结构示意图冒充历史照片。图注区分历史节点与后续机型照片：精灵 4K 和 T50 分别是家族后续产品照片，不是首代 Phantom 或 MG-1 的照片。每张照片在页面中保留来源链接。详细清单见 `assets/museum/SOURCES.json`。

- 北京五号历史飞行照片：北京航空航天大学新闻网，纪念文传源报道。https://news.buaa.edu.cn/info/1006/43902.htm
- 长空一号馆藏实物：南京航空航天大学航空航天馆。历史说明明确其在拉-17 测绘仿制基础上研制，1966-12-06 首飞。https://njhkhtg.nuaa.edu.cn/2023/0805/c18250a316762/page.htm
- 精灵系列 4K 机型实拍：Suyash Dwivedi，Wikimedia Commons，CC BY-SA 4.0。https://commons.wikimedia.org/wiki/File:DJI_Phantom_4K_drone_in_action.jpg
- T50 喷洒演示实拍：Blervis，Wikimedia Commons，CC0。https://commons.wikimedia.org/wiki/File:DJI_Agras_T50_demonstrating_sprayers_in_flight.jpg
- AR500C 实拍：中国航空工业集团有限公司，国务院国资委发布。https://wap.sasac.gov.cn/n2588025/n2588149/c14724625/content.html
- 翼龙-2H 救援报道实拍：中国航空工业集团有限公司，国务院国资委，2024 年汉源应急救援报道。https://wap.sasac.gov.cn/n2588025/n2588124/c31282266/content.html

上述北航、南航与航空工业照片的版权归原权利人，来源页面未声明开放许可，本项目不为其另行授予许可。Commons 照片保留作者与许可链接；各照片仅缩放显示，未修改主体。CC BY-SA 4.0 的许可说明：https://creativecommons.org/licenses/by-sa/4.0/ 。CC0：https://creativecommons.org/publicdomain/zero/1.0/ 。

补充历史依据：
- DJI 首代 Phantom 公告，2013-01-07。https://www.dji.com/media-center/announcements/dji-launches-industry-best-easiest-to-fly-quadcopter-for-consumer-use
- DJI 首款 MG-1 农业无人机公告，2015-11-27。https://www.dji.com/media-center/announcements/dji-introduces-company-s-first-agriculture-drone

## 无人机与国产 AI 教学

- 通义千问图像与视频理解能力：阿里云官方文档。https://help.aliyun.com/zh/model-studio/vision
- DeepSeek 结构化 JSON 输出：官方 API 文档。https://api-docs.deepseek.com/zh-cn/guides/json_mode/

交通、农业与应急三个流程为本项目编写的应用设想和预设演示，未调用真实模型，不代表照片中的历史机型已经接入这些 AI 服务。不把语言模型视为电机控制器；视觉与文字分析结果需人工复核。未来畅想保存为独立的本机文字记录。

## 动漫杭州

建筑、卡通车辆、街道、树木、地标意象、贴图和界面由代码生成，无真实车牌或人物素材。杭州地标与水岸经过艺术重组，非地理测绘或真实交通路网。游戏中的专用道公告和交通情境仅为本次教学规则。
